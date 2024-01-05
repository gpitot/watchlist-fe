import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { MovieService } from "../_shared/movie_service.ts";
import { createClient } from "supabase";

const movieService = new MovieService();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { title } = await req.json();
  console.log("Movie title to add: ", title);

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
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const movieDetails = await movieService.queryMovieTitle(title);
  console.log(movieDetails);

  if (!movieDetails) {
    return new Response("Movie not found", {
      status: 404,
      headers: corsHeaders,
    });
  }

  const { data } = await anonClient
    .from("movies")
    .select("*")
    .match({ title: movieDetails.title, user_id: user.id })
    .single();

  if (data) {
    // movie already exists
    return new Response(JSON.stringify(movieDetails), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { data: movie, error } = await anonClient
    .from("movies")
    .insert({
      movie_db_id: movieDetails.id,
      title: movieDetails.title,
      description: movieDetails.description,
      release_date: movieDetails.release?.toISOString(),
      production: movieDetails.production,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error || !movie) {
    return new Response(error?.message, { status: 500, headers: corsHeaders });
  }

  await anonClient.from("movie_credits").insert(
    movieDetails.credits.cast.map((name) => ({
      movie_id: movie.id,
      name: name,
      role: "cast",
    }))
  );

  await anonClient.from("movie_credits").insert(
    movieDetails.credits.crew.map((name) => ({
      movie_id: movie.id,
      name: name,
      role: "crew",
    }))
  );

  await anonClient.from("movies_genres").insert(
    movieDetails.genres.map((genre) => ({
      movie_id: movie.id,
      genre,
    }))
  );

  const { error: movieProvidersError } = await anonClient
    .from("movie_providers")
    .insert(
      movieDetails.providers.map((provider) => ({
        movie_id: movie.id,
        provider_name: provider.name,
        provider_type: provider.type,
      }))
    );
  if (movieProvidersError) {
    return new Response(movieProvidersError.message, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(movieDetails), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/add-movie' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
