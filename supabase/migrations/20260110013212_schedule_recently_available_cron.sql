-- Schedule get-recently-available to run daily at 5am UTC
select cron.schedule(
  'get-recently-available-daily',
  '* * * * *', --every minute
  $$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url') || '/functions/v1/get-recently-available',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
