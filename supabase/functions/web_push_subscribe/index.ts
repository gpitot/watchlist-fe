import { corsHeaders } from "../_shared/cors.ts";
import * as webpush from "@negrel/webpush";

// Read generated VAPID file.
const vapidKeysJson = JSON.parse(Deno.readTextFileSync("./vapid.json"));
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Retrieve subscription.
  const subscription = await req.json();
  // You can store it in a DB to reuse it later.
  // ...

  // Create a subscriber object.
  const subscriber = appServer.subscribe(subscription);

  // Send notification.
  await subscriber.pushTextMessage(
    JSON.stringify({ title: "Hello from application server!" }),
    {}
  );

  return new Response(JSON.stringify({}), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
