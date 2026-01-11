import { corsHeaders } from "../_shared/cors.ts";
import { checkCronAuth } from "../_shared/cron-auth.ts";
import { SendData } from "../_shared/email.ts";

import { Resend } from "resend";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY");
}
const resend = new Resend(RESEND_API_KEY);

export const DEFAULT_FROM = "guillaume.pitot@gmail.com";

export const sendMail = async (data: SendData) => {
  const res = await resend.emails.send({
    from: DEFAULT_FROM,
    to: data.to,
    subject: data.subject,
    html: data.html,
  });
  console.log(res);
};

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

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email-notification' \
    --header 'x-cron-secret: 1234812349asdfjhqwer' \
    --header 'Content-Type: application/json' \
    --data '{"to": "guillaume.pitot@gmail.com", "subject": "Test email", "html": "<h1>Hello from Resend!</h1>"}'

    */
