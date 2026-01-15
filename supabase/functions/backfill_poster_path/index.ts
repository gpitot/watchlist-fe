import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  throw new Error("Deprecated function");
});

/*

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-recently-available' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
*/
