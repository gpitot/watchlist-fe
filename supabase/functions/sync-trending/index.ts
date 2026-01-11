import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { checkCronAuth } from "../_shared/cron-auth.ts";
import { MovieAndShowService, TimeWindow } from "../_shared/movie_service.ts";
import { createClient } from "supabase";

const movieAndShowService = new MovieAndShowService();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check cron authentication
    if (!checkCronAuth(req)) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log("Starting trending sync...");

    // Create service role client for database operations
    const supabaseClient = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch trending data for both time windows
    const timeWindows: TimeWindow[] = ["day", "week"];
    const allTrendingData: {
      movie_db_id: number;
      title: string;
      poster_path: string | undefined;
      release_date: string | undefined;
      medium: "movie" | "tv";
      time_window: TimeWindow;
      trending_rank: number;
    }[] = [];

    for (const timeWindow of timeWindows) {
      console.log(`Fetching trending data for timeWindow: ${timeWindow}`);

      // Fetch trending movies
      const trendingMovies = await movieAndShowService.getTrending(
        "movie",
        timeWindow
      );
      trendingMovies.forEach((movie, index) => {
        allTrendingData.push({
          movie_db_id: movie.id,
          title: movie.name,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          medium: "movie",
          time_window: timeWindow,
          trending_rank: index + 1,
        });
      });

      // Fetch trending TV shows
      const trendingTvs = await movieAndShowService.getTrending("tv", timeWindow);
      trendingTvs.forEach((tv, index) => {
        allTrendingData.push({
          movie_db_id: tv.id,
          title: tv.name,
          poster_path: tv.poster_path,
          release_date: tv.release_date,
          medium: "tv",
          time_window: timeWindow,
          trending_rank: index + 1,
        });
      });
    }

    console.log(`Fetched ${allTrendingData.length} trending items`);

    // Delete old trending data
    const { error: deleteError } = await supabaseClient
      .from("trending")
      .delete()
      .neq("id", 0); // Delete all rows

    if (deleteError) {
      console.error("Error deleting old trending data:", deleteError);
      throw new Error(`Failed to delete old trending data: ${deleteError.message}`);
    }

    console.log("Deleted old trending data");

    // Insert new trending data in batches to avoid hitting limits
    const batchSize = 100;
    for (let i = 0; i < allTrendingData.length; i += batchSize) {
      const batch = allTrendingData.slice(i, i + batchSize);
      const { error: insertError } = await supabaseClient
        .from("trending")
        .insert(batch);

      if (insertError) {
        console.error("Error inserting trending data:", insertError);
        throw new Error(`Failed to insert trending data: ${insertError.message}`);
      }
    }

    console.log("Successfully synced trending data");

    return new Response(
      JSON.stringify({
        success: true,
        count: allTrendingData.length,
        message: "Trending data synced successfully",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    console.error("Error in sync-trending function:", err);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sync-trending' \
    --header 'x-cron-secret: your-cron-secret' \
    --header 'Content-Type: application/json' \
    --data '{}'

*/
