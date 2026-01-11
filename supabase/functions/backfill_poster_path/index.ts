import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { createClient } from "supabase";
import { checkCronAuth } from "../_shared/cron-auth.ts";
import { isMedium, MovieAndShowService } from "../_shared/movie_service.ts";

const adminClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const movieAndShowService = new MovieAndShowService();

Deno.serve(async (req) => {
  if (!checkCronAuth(req)) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }
  return new Response("Not implemented", { status: 502, headers: corsHeaders });
  const { data, error } = await adminClient
    .from("movies")
    .select("id, movie_db_id, medium")
    .is("poster_path", null)
    .limit(30);
  if (error) {
    throw new Error(
      `Failed to fetch movies with missing posters: ${error.message}`
    );
  }

  for (const movie of data) {
    if (!isMedium(movie.medium)) {
      console.error(`Invalid medium for movie ID ${movie.id}: ${movie.medium}`);
      continue;
    }
    const { poster_path } = await movieAndShowService.getDetails(
      movie.movie_db_id,
      movie.medium
    );
    if (poster_path) {
      const { error: updateError } = await adminClient
        .from("movies")
        .update({ poster_path })
        .eq("id", movie.id);
      if (updateError) {
        console.error(
          `Failed to update movie ID ${movie.id} with poster path: ${updateError.message}`
        );
      } else {
        console.log(`Updated movie ID ${movie.id} with poster path.`);
      }
    }
  }
  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});

/*

curl -i --location --request POST 'https://ambmualoussdnneksprb.supabase.co/functions/v1/backfill_poster_path' \
    --header 'Content-Type: application/json' \
    --header 'x-cron-secret: 189usdf8y134n1234099123' \
    --data '{"name":"Functions"}'
*/
