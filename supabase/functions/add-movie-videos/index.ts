import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { isMedium } from "../_shared/movie_service.ts";
import { MovieAndShowService } from "../_shared/movie_service.ts";
import { createClient } from "supabase";

import { z } from "zod";

const Body = z.object({
  movieId: z.number(),
});
type Body = z.infer<typeof Body>;
const adminClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);
const movieAndShowService = new MovieAndShowService();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const { movieId } = Body.parse(body);
    console.log("Movie id to add videos: ", movieId);

    const { data, error } = await adminClient
      .from("movies")
      .select("movie_db_id, medium, movie_videos(id)")
      .match({ id: movieId })
      .single();
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error("Movie not found");
    }

    if (data.movie_videos.length > 0) {
      console.log("Videos already added for movie: ", movieId);
      return new Response(JSON.stringify({}), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!isMedium(data.medium)) {
      console.log("Not a medium movie: ", movieId);
      throw new Error("Stream has invalid medium");
    }

    const videos = await movieAndShowService.getVideos(
      data.movie_db_id,
      data.medium
    );

    const { error: insertError } = await adminClient
      .from("movie_videos")
      .insert(
        movieAndShowService.parseVideos(videos).map((video) => ({
          ...video,
          movie_id: movieId,
        }))
      );
    if (insertError) {
      throw insertError;
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/add-movie-videos' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"movieId": 7}'

*/
