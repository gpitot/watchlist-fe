import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { MovieAndShowService, isMedium } from "../_shared/movie_service.ts";
import { createClient } from "supabase";

const movieService = new MovieAndShowService();

const adminClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const isValidRefreshDate = (date: string) => {
  const refreshDate = new Date(date).getTime();
  const currentDate = new Date().getTime();
  const lastWeek = currentDate - 7 * 24 * 60 * 60 * 1000;

  return lastWeek > refreshDate;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { data, error } = await adminClient.from("movies").select(
      `id, medium, movie_db_id, providers_refreshed_date 
        ,movie_providers(provider_name, provider_type)`
    );

    if (error) {
      throw error;
    }

    for (const movie of data ?? []) {
      const movieId = movie.id;
      const {
        movie_db_id: movieDBId,
        medium,
        providers_refreshed_date,
      } = movie ?? {};

      if (
        !movieDBId ||
        !medium ||
        !isMedium(medium) ||
        !providers_refreshed_date
      ) {
        throw new Error("movie_db_id not found in database");
      }

      if (!isValidRefreshDate(providers_refreshed_date)) {
        console.log("Skipping refresh of movie", movieId);
        continue;
      }
      console.log("Refreshing movie", movieId);

      const updatedProviders = await movieService.getProviders(
        movieDBId,
        medium
      );

      // providers to remove
      const providersToRemove = movie.movie_providers.filter(
        (provider) =>
          !updatedProviders.some(
            (updatedProvider) =>
              updatedProvider.name === provider.provider_name &&
              updatedProvider.type === provider.provider_type
          )
      );

      console.log("providersToRemove", providersToRemove);

      // providers to add
      const providersToAdd = updatedProviders.filter(
        (provider) =>
          !movie.movie_providers.some(
            (movieProvider) =>
              movieProvider.provider_name === provider.name &&
              movieProvider.provider_type === provider.type
          )
      );

      console.log("providersToAdd", providersToAdd);

      const removeProvidersPromise = await Promise.all(
        providersToRemove.map((provider) => {
          return adminClient.from("movie_providers").delete().match({
            movie_id: movieId,
            provider_name: provider.provider_name,
            provider_type: provider.provider_type,
          });
        })
      );
      if (removeProvidersPromise.some((p) => p.error)) {
        throw removeProvidersPromise.find((p) => p.error)?.error;
      }

      const { error } = await adminClient.from("movie_providers").insert(
        providersToAdd.map((provider) => ({
          movie_id: movieId,
          provider_name: provider.name,
          provider_type: provider.type,
        }))
      );
      if (error) {
        throw error;
      }

      const { error: updateMovieErr } = await adminClient
        .from("movies")
        .update({
          providers_refreshed_date: new Date().toISOString().slice(0, 10),
        })
        .match({ id: movieId });
      if (updateMovieErr) {
        throw updateMovieErr;
      }
    }

    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    console.error(err);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});
