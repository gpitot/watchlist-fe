import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { MovieService } from "../_shared/movie_service.ts";
import { createClient } from "supabase";

const movieService = new MovieService();

const adminClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await anonClient.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { data } = await anonClient
      .from("movies_users")
      .select("movie_id, movies(movie_db_id)")
      .match({ user_id: user.id });

    for (const movie of data ?? []) {
      if (!movie.movies?.movie_db_id) {
        throw new Error("movie_db_id not found in database");
      }

      const movieId = movie.movie_id;
      const movieDBId = movie.movies.movie_db_id;

      const updatedProviders = await movieService.getMovieProviders(movieDBId);

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

      const { error } = await anonClient.from("movie_providers").insert(
        updatedProviders.map((provider) => ({
          movie_id: movieId,
          provider_name: provider.name,
          provider_type: provider.type,
        }))
      );
      if (error) {
        throw error;
      }
    }

    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error(err);
    return new Response(err.message, { status: 500, headers: corsHeaders });
  }
});
