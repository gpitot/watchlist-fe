import { corsHeaders } from "../_shared/cors.ts";
import { MovieAndShowService, TimeWindow, Medium } from "../_shared/movie_service.ts";
import { createClient } from "supabase";
import { Database } from "../_shared/database.types.ts";

const movieAndShowService = new MovieAndShowService();

const isTimeWindow = (value: string): value is TimeWindow => {
  return value === "day" || value === "week";
};

type TrendingItem = {
  id: number;
  name: string;
  poster_path?: string;
  release_date?: string;
  medium: Medium;
};

const filterByUserProviders = async (
  items: TrendingItem[],
  userProviders: string[],
  type: Medium
): Promise<TrendingItem[]> => {
  // If user has no providers, return all items
  if (userProviders.length === 0) {
    return items;
  }

  const filteredItems: TrendingItem[] = [];

  for (const item of items) {
    try {
      // Fetch streaming providers for this item from TMDB
      const providers = await movieAndShowService.getProviders(item.id, type);

      // Check if item has at least one provider that matches user's providers
      const hasMatchingProvider = providers.some((provider) =>
        userProviders.includes(provider.name)
      );

      if (hasMatchingProvider) {
        filteredItems.push(item);
      }
    } catch (error) {
      console.error(`Error fetching providers for ${type} ${item.id}:`, error);
      // If there's an error fetching providers, skip this item
      continue;
    }
  }

  return filteredItems;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const timeWindow = isTimeWindow(body.timeWindow) ? body.timeWindow : "week";

    // Get user from auth token
    const authHeader = req.headers.get("Authorization");
    let userProviders: string[] = [];

    if (authHeader) {
      const supabase = createClient<Database>(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch user's streaming providers if user is authenticated
      if (user) {
        const { data, error } = await supabase
          .from("user_providers")
          .select("provider_name")
          .eq("id", user.id);

        if (error) {
          console.error("Error fetching user providers:", error);
        } else {
          userProviders = data?.map((p) => p.provider_name) ?? [];
        }
      }
    }

    // Fetch trending movies and TV shows
    const trendingMovies = await movieAndShowService.getTrending("movie", timeWindow);
    const trendingTvs = await movieAndShowService.getTrending("tv", timeWindow);

    // Filter by user's streaming providers
    const filteredMovies = await filterByUserProviders(
      trendingMovies,
      userProviders,
      "movie"
    );
    const filteredTvs = await filterByUserProviders(
      trendingTvs,
      userProviders,
      "tv"
    );

    // Return top 10 of each
    const movies = filteredMovies.slice(0, 10);
    const tvs = filteredTvs.slice(0, 10);

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
