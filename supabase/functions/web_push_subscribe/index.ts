import { corsHeaders } from "../_shared/cors.ts";
import * as webpush from "@negrel/webpush";
import { createClient } from "supabase";
import { Database } from "../_shared/database.types.ts";
import { z } from "zod";

// Read generated VAPID file.
const VAPID_KEYS = Deno.env.get("VAPID_KEYS");
if (!VAPID_KEYS) {
  throw new Error("VAPID_KEYS is not set");
}
const vapidKeysJson = JSON.parse(VAPID_KEYS);
const vapidKeys = await webpush.importVapidKeys(vapidKeysJson, {
  extractable: false,
});

// adminEmail is used by Push services maintainer to contact you in case there
// is problem with your application server.
const adminEmail = "guillaume.pitot@gmail.com";

// Create an application server object.
const appServer = await webpush.ApplicationServer.new({
  contactInformation: "mailto:" + adminEmail,
  vapidKeys,
});

const adminClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const Subscription = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});
type Subscription = z.infer<typeof Subscription>;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { data, error } = await adminClient
      .from("user_push_subscriptions")
      .select("*");
    if (error) {
      throw error;
    }

    for (const subscriptionRecord of data ?? []) {
      const subscription = Subscription.parse({
        endpoint: subscriptionRecord.endpoint,
        keys: subscriptionRecord.keys,
      });

      // Create a subscriber object.
      const subscriber = appServer.subscribe(subscription);

      // Send notification.
      console.log("sending notification to ", subscriptionRecord.endpoint);
      await subscriber.pushTextMessage(
        JSON.stringify({ title: "Hello from application server!" }),
        {}
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
