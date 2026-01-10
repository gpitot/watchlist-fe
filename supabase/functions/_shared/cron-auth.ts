export function checkCronAuth(request: Request) {
  const cronHeader = request.headers.get("x-cron-secret");
  const expectedCronSecret = Deno.env.get("CRON_SECRET");

  if (!expectedCronSecret || cronHeader !== expectedCronSecret) {
    return false;
  }
  return true;
}
