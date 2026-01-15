import { corsHeaders } from "../_shared/cors.ts";
import { checkCronAuth } from "../_shared/cron-auth.ts";
import { Database } from "../_shared/database.types.ts";
import { MovieAndShowService, Medium } from "../_shared/movie_service.ts";
import { createClient } from "supabase";

const movieService = new MovieAndShowService();

const adminClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const TRENDING_LIMIT = 20;

async function ensureMovieExists(
  movieDbId: number,
  medium: Medium
): Promise<number> {
  // Check if movie already exists
  const { data: existingMovie } = await adminClient
    .from("movies")
    .select("id")
    .match({ movie_db_id: movieDbId })
    .single();

  if (existingMovie) {
    return existingMovie.id;
  }

  // Fetch details from TMDB and insert
  const details = await movieService.getDetails(movieDbId, medium);

  const { data: newMovie, error } = await adminClient
    .from("movies")
    .insert({
      movie_db_id: details.id,
      title: details.title,
      description: details.description,
      release_date: details.release?.toISOString(),
      production: details.production,
      poster_path: details.poster_path,
      medium: medium,
      providers_refreshed_date: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (error || !newMovie) {
    throw new Error(`Failed to insert movie: ${error?.message}`);
  }

  // Insert credits
  if (details.credits.cast.length > 0) {
    await adminClient.from("movie_credits").insert(
      details.credits.cast.map((name) => ({
        movie_id: newMovie.id,
        name,
        role: "cast",
      }))
    );
  }

  if (details.credits.crew.length > 0) {
    await adminClient.from("movie_credits").insert(
      details.credits.crew.map((name) => ({
        movie_id: newMovie.id,
        name,
        role: "crew",
      }))
    );
  }

  // Insert genres
  if (details.genres.length > 0) {
    await adminClient.from("movies_genres").insert(
      details.genres.map((genre) => ({
        movie_id: newMovie.id,
        genre,
      }))
    );
  }

  // Insert providers
  if (details.providers.length > 0) {
    await adminClient.from("movie_providers").insert(
      details.providers.map((provider) => ({
        movie_id: newMovie.id,
        provider_name: provider.name,
        provider_type: provider.type,
      }))
    );
  }

  // Trigger video fetch asynchronously (fire and forget)
  adminClient.functions.invoke("add-movie-videos", {
    method: "POST",
    body: JSON.stringify({ movieId: newMovie.id }),
  });

  return newMovie.id;
}

async function processTrendingForMedium(
  medium: Medium
): Promise<{ movie_id: number; trending_rank: number; medium: Medium }[]> {
  const trending = await movieService.getTrending(medium, "week");

  const results: { movie_id: number; trending_rank: number; medium: Medium }[] =
    [];

  for (let i = 0; i < Math.min(trending.length, TRENDING_LIMIT); i++) {
    const item = trending[i];
    try {
      const movieId = await ensureMovieExists(item.id, medium);
      results.push({
        movie_id: movieId,
        trending_rank: i + 1,
        medium,
      });
      console.log(
        `Processed ${medium} ${i + 1}/${TRENDING_LIMIT}: ${item.name}`
      );
    } catch (err) {
      console.error(`Failed to process trending item ${item.id}:`, err);
      // Continue with other items
    }
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!checkCronAuth(req)) {
    return new Response("Unauthorized - Cron only", {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const mediums: Medium[] = ["movie", "tv"];

    const allTrendingEntries: {
      movie_id: number;
      trending_rank: number;
      medium: string;
      fetched_at: string;
    }[] = [];

    const fetchedAt = new Date().toISOString();

    // Process movies and TV shows
    for (const medium of mediums) {
      console.log(`Processing trending: ${medium}`);
      const entries = await processTrendingForMedium(medium);

      for (const entry of entries) {
        allTrendingEntries.push({
          movie_id: entry.movie_id,
          trending_rank: entry.trending_rank,
          medium: entry.medium,
          fetched_at: fetchedAt,
        });
      }
    }

    if (allTrendingEntries.length > 0) {
      const { error: insertError } = await adminClient
        .from("trending")
        .insert(allTrendingEntries);

      if (insertError) {
        throw new Error(`Failed to insert trending: ${insertError.message}`);
      }
    }

    console.log(
      `Successfully refreshed ${allTrendingEntries.length} trending entries`
    );

    return new Response(
      JSON.stringify({
        success: true,
        count: allTrendingEntries.length,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    console.error(err);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/refresh_trending' \
    --header 'x-cron-secret: 1234812349asdfjhqwer' \
    --header 'Content-Type: application/json'

*/
