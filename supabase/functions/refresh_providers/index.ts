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
    const { data } = await adminClient
      .from("movies_users")
      .select(
        "movie_id, movies(medium, movie_db_id, providers_refreshed_date)"
      );

    for (const movie of data ?? []) {
      const movieId = movie.movie_id;
      const {
        movie_db_id: movieDBId,
        medium,
        providers_refreshed_date,
      } = movie.movies ?? {};

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

      if (updatedProviders.length > 0) {
        // adminClient to delete
        const { error } = await adminClient
          .from("movie_providers")
          .delete()
          .match({ movie_id: movieId });
        if (error) {
          throw error;
        }
      }

      const { error } = await adminClient.from("movie_providers").insert(
        updatedProviders.map((provider) => ({
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
