import { corsHeaders } from "../_shared/cors.ts";
import { MovieAndShowService, TimeWindow } from "../_shared/movie_service.ts";

const movieAndShowService = new MovieAndShowService();

const isTimeWindow = (value: string): value is TimeWindow => {
  return value === "day" || value === "week";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const timeWindow = isTimeWindow(body.timeWindow) ? body.timeWindow : "week";

    const movies = (
      await movieAndShowService.getTrending("movie", timeWindow)
    ).slice(0, 10);
    const tvs = (
      await movieAndShowService.getTrending("tv", timeWindow)
    ).slice(0, 10);

    return new Response(JSON.stringify({ movies, tvs }), {
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/trending' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"timeWindow":"day"}'

*/
