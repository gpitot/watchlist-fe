import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { MovieAndShowService, Medium } from "../_shared/movie_service.ts";
import { createClient } from "supabase";
import * as StringSimilarity from "string-similarity";

const movieAndShowService = new MovieAndShowService();

const determineMovieOrShow = async (
  title: string
): Promise<{ id: number; medium: Medium } | undefined> => {
  const movie = await movieAndShowService.searchByTitle(title, "movie");
  const tv = await movieAndShowService.searchByTitle(title, "tv");

  if (movie && tv) {
    const { id: movieId, name: movieName } = movie;
    const { id: tvId, name: tvName } = tv;

    const movieSimilarity = StringSimilarity.compareTwoStrings(
      title,
      movieName
    );
    const tvSimilarity = StringSimilarity.compareTwoStrings(title, tvName);

    console.log(
      "Movie and Tv found: ",
      movieName,
      tvName,
      movieSimilarity,
      tvSimilarity
    );

    if (movieSimilarity > tvSimilarity) {
      return {
        id: movieId,
        medium: "movie",
      };
    }
    return {
      id: tvId,
      medium: "tv",
    };
  }

  if (movie) {
    return {
      id: movie.id,
      medium: "movie",
    };
  }
  if (tv) {
    return {
      id: tv.id,
      medium: "tv",
    };
  }
  return undefined;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
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
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const result = await determineMovieOrShow(title);

    if (!result) {
      return new Response("Movie not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const { id: recordId, medium } = result;

    const { data } = await anonClient
      .from("movies")
      .select("*")
      .match({ movie_db_id: recordId })
      .single();

    let dbMovieId = data?.id;
    if (data === null) {
      // add movie in
      const movieDetails = await movieAndShowService.getDetails(
        recordId,
        medium
      );
      const { data: movie, error } = await anonClient
        .from("movies")
        .insert({
          movie_db_id: movieDetails.id,
          title: movieDetails.title,
          description: movieDetails.description,
          release_date: movieDetails.release?.toISOString(),
          production: movieDetails.production,
          medium: medium,
          providers_refreshed_date: new Date().toISOString().slice(0, 10),
        })
        .select("*")
        .single();

      if (error || !movie) {
        throw new Error(error?.message ?? "Error adding movie");
      }

      dbMovieId = movie.id;

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

      await anonClient.from("movie_providers").insert(
        movieDetails.providers.map((provider) => ({
          movie_id: movie.id,
          provider_name: provider.name,
          provider_type: provider.type,
        }))
      );
    }

    if (!dbMovieId) {
      throw new Error("Movie not found");
    }

    // add user link to movie
    const { error: movieUsersError } = await anonClient
      .from("movies_users")
      .insert({
        movie_id: dbMovieId,
        user_id: user.id,
        watched: false,
      });
    if (movieUsersError) {
      throw new Error(movieUsersError.message);
    }

    const { error, data: movieDetailsCachedResponse } = await anonClient
      .from("movies_users")
      .select(
        `
        watched, rating,
        movies(
          *,
          movie_credits(name, role), 
          movies_genres(genre), 
          movie_providers(provider_name, provider_type)
        )
      `
      )
      .match({ user_id: user.id, movie_id: dbMovieId })
      .single();

    if (error || !movieDetailsCachedResponse) {
      throw new Error(error.message);
    }

    return new Response(JSON.stringify(movieDetailsCachedResponse), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    console.error(err);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/add-movie' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
