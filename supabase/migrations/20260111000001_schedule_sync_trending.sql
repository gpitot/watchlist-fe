-- Schedule sync-trending to run daily at 3am UTC
select cron.schedule(
  'sync-trending',
  '0 3 * * *', -- Every day at 3am UTC
  $$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url') || '/functions/v1/sync-trending',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
