import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { createClient } from "supabase";
import type { SendData } from "../_shared/email.ts";

const adminClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const HOUR = 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    /*
    - select users , user_movies, movies, movie_providers
    where movie providers has been created in last week
    */
    const currentDate = new Date().getTime();
    const lastWeek = new Date(currentDate - 7 * 24 * HOUR);
    const { data, error } = await adminClient
      .from("available_streams")
      .select("*")
      .filter("created_at", "gt", lastWeek.toISOString().slice(0, 10));

    if (error) {
      throw error;
    }

    // group into emails
    const grouped = data.reduce(
      (acc: Record<string, typeof data>, curr: (typeof data)[number]) => {
        if (!curr.email) {
          return acc;
        }
        if (!acc[curr.email]) {
          acc[curr.email] = [];
        }
        acc[curr.email].push(curr);
        return acc;
      },
      {}
    );

    const promises = Object.entries(grouped).map(([email, streams]) => {
      const data: SendData = {
        to: email,
        subject: "Your watchlist items are now available",
        html: `
          Hi,
          These items from your watchlist are now available on one of your streaming services:
          <ul>
            ${streams
              .map((stream) => {
                return `<li>${stream.title} on ${stream.provider_name}</li>`;
              })
              .join("")}
          </ul>
          `,
      };

      return adminClient.functions.invoke("send-email-notification", {
        method: "POST",
        body: JSON.stringify(data),
      });
    });

    const result = await Promise.allSettled(promises);
    const failed = result.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      throw new Error(
        `Failed to send ${failed.length} emails with reasons ${failed.map(
          (f) => f.reason
        )}`
      );
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

/*

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-recently-available' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
*/
