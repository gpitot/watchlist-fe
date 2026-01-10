import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { createClient } from "supabase";
import type { SendData } from "../_shared/email.ts";
import { checkCronAuth } from "../_shared/cron-auth.ts";

const adminClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const HOUR = 60 * 60 * 1000;

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
      console.log("Error fetching recently available streams:", error);
      throw error;
    }

    if (data.length === 0) {
      console.log("No new available streams found");
      return new Response(JSON.stringify({}), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // group by user_id
    const grouped = data.reduce(
      (
        acc: Record<string, { email: string | null; streams: typeof data }>,
        curr: (typeof data)[number]
      ) => {
        if (!curr.user_id) {
          return acc;
        }
        if (!acc[curr.user_id]) {
          acc[curr.user_id] = { email: curr.email, streams: [] };
        }
        acc[curr.user_id].streams.push(curr);
        return acc;
      },
      {}
    );

    const promises = Object.entries(grouped).map(
      async ([userId, { email, streams }]) => {
        // Create in-app notification

        await adminClient.from("notifications").insert(
          streams.map((stream) => ({
            user_id: userId,
            type: "new_availability",
            title: "New content available",
            message: `"${stream.title}" is now available on ${stream.provider_name}`,
          }))
        );

        // Send email notification if email exists
        if (!email) {
          return;
        }

        const emailData: SendData = {
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
          body: JSON.stringify(emailData),
        });
      }
    );

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
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
*/
