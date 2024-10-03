import { corsHeaders } from "../_shared/cors.ts";
import Sendgrid from "@sendgrid/mail";
import { SendData } from "../_shared/email.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
if (!SENDGRID_API_KEY) {
  throw new Error("Missing SENDGRID_API_KEY");
}
Sendgrid.setApiKey(SENDGRID_API_KEY);

export const DEFAULT_FROM = "northmanlysquashclub@gmail.com";

export const sendMail = async (data: SendData) => {
  const res = await Sendgrid.send({ ...data, from: DEFAULT_FROM });
  console.log(res);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json();
    console.log("body", body);
    const data = SendData.parse(body);
    await sendMail(data);

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
