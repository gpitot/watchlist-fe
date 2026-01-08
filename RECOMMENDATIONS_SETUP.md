# Recommendations Engine Setup Guide

This guide will help you set up the automated recommendations scheduling system for your watchlist application.

## Prerequisites

- Supabase CLI installed
- Access to your Supabase project dashboard
- Database migrations applied
- Edge function deployed

## Step 1: Apply Database Migrations

Apply both recommendation migrations to your database:

```bash
# Apply the recommendations table migration
supabase db push

# Or apply specific migrations
supabase migration up --include-all
```

This will create:
- `user_recommendations` table - Stores recommendations
- `user_recommendation_status` table - Tracks generation status
- `generate_recommendations_for_user()` function - Processes single user
- `process_scheduled_recommendations()` function - Batch processes users
- pg_cron job - Runs hourly

## Step 2: Enable Required PostgreSQL Extensions

The scheduling system requires two PostgreSQL extensions. These are enabled in the migration, but you can verify they're active:

```sql
-- Check if extensions are enabled
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'http');
```

If not enabled, run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
```

## Step 3: Configure Database Settings

The recommendation functions need access to your Supabase URL and service role key. Set these as database settings:

### Option A: Using Supabase Dashboard

1. Go to **Project Settings** > **Database**
2. Scroll to **Custom Configuration**
3. Add the following settings:

```
app.settings.supabase_url = 'https://your-project.supabase.co'
app.settings.service_role_key = 'your-service-role-key'
```

### Option B: Using SQL

Connect to your database with `psql` or the Supabase SQL editor:

```sql
-- Set Supabase URL
ALTER DATABASE postgres SET app.settings.supabase_url TO 'https://your-project.supabase.co';

-- Set Service Role Key (KEEP THIS SECRET!)
ALTER DATABASE postgres SET app.settings.service_role_key TO 'your-service-role-key';
```

**IMPORTANT**: Replace `your-project.supabase.co` and `your-service-role-key` with your actual values.

**Security Note**: The service role key has full database access. Ensure your database connection is secure.

## Step 4: Deploy the Edge Function

Deploy the `generate_recommendations` function:

```bash
supabase functions deploy generate_recommendations
```

Verify deployment:

```bash
supabase functions list
```

## Step 5: Verify pg_cron Job is Running

Check that the cron job was created successfully:

```sql
SELECT * FROM cron.job WHERE jobname = 'generate-user-recommendations-hourly';
```

You should see an entry with:
- `jobname`: `generate-user-recommendations-hourly`
- `schedule`: `0 * * * *` (runs hourly)
- `command`: `select public.process_scheduled_recommendations();`
- `active`: `t` (true)

## Step 6: Test the System

### Test Manual Generation (Single User)

Test generating recommendations for a specific user via SQL:

```sql
-- Replace with an actual user ID from your auth.users table
SELECT public.generate_recommendations_for_user('USER_UUID_HERE');
```

The function returns a JSON result:
```json
{
  "success": true,
  "user_id": "USER_UUID",
  "result": {
    "message": "Recommendations generated successfully",
    "count": 20
  }
}
```

### Test Batch Processing

Test the scheduled batch processor:

```sql
SELECT public.process_scheduled_recommendations();
```

This will process up to 10 eligible users and return:
```json
{
  "processed_count": 3,
  "error_count": 0,
  "total_count": 3,
  "timestamp": "2026-01-08T12:00:00Z",
  "results": [...]
}
```

### Test Frontend Integration

Test the frontend hooks:

```typescript
import { useGetRecommendations, useGetRecommendationStatus } from "api/movies";
import { useUserContext } from "providers/user_provider";

const TestComponent = () => {
  const { user } = useUserContext();
  const { data: recommendations } = useGetRecommendations(user?.id);
  const { data: status } = useGetRecommendationStatus(user?.id);

  return (
    <div>
      <h3>Recommendation Status</h3>
      {status && (
        <div>
          <p>Last Generated: {status.last_generated_at || 'Never'}</p>
          <p>Next Scheduled: {status.next_scheduled_at || 'Not scheduled'}</p>
          <p>Processing: {status.is_processing ? 'Yes' : 'No'}</p>
          {status.error_message && <p>Error: {status.error_message}</p>}
        </div>
      )}

      <h3>Recommendations ({recommendations?.length || 0})</h3>
      {recommendations?.map(rec => (
        <div key={rec.id}>
          <h4>{rec.movies.title}</h4>
          <p>Score: {rec.score}</p>
        </div>
      ))}
    </div>
  );
};
```

## Schedule Configuration

### Default Schedule

By default, the cron job runs **every hour** at the top of the hour (`:00`). It processes up to **10 users** per batch.

### Customizing the Schedule

To change the schedule frequency, update the cron job:

```sql
-- Example: Run every 6 hours
SELECT cron.unschedule('generate-user-recommendations-hourly');
SELECT cron.schedule(
  'generate-user-recommendations-6hourly',
  '0 */6 * * *',
  $$SELECT public.process_scheduled_recommendations();$$
);

-- Example: Run daily at 2 AM
SELECT cron.unschedule('generate-user-recommendations-hourly');
SELECT cron.schedule(
  'generate-user-recommendations-daily',
  '0 2 * * *',
  $$SELECT public.process_scheduled_recommendations();$$
);
```

### Customizing Batch Size

To process more or fewer users per batch, edit the function in the migration file and reapply:

```sql
-- In the process_scheduled_recommendations function, change:
limit 10  -- Change this number

-- For example, to process 50 users per batch:
limit 50
```

Then recreate the function:

```bash
supabase db reset  # Or manually drop and recreate the function
```

## User Eligibility Criteria

Users are eligible for recommendation generation if:

1. **They have watched movies** with ratings ≥ 4 stars
2. **AND** one of the following:
   - Never had recommendations generated
   - `next_scheduled_at` is in the past
   - Last generated over 24 hours ago
3. **AND** not currently being processed

## Monitoring

### Check Cron Job Execution

View cron job run history:

```sql
SELECT * FROM cron.job_run_details
WHERE jobname = 'generate-user-recommendations-hourly'
ORDER BY start_time DESC
LIMIT 10;
```

### Check User Status

View all users and their recommendation status:

```sql
SELECT
  u.email,
  urs.last_generated_at,
  urs.next_scheduled_at,
  urs.is_processing,
  urs.error_message,
  (SELECT COUNT(*) FROM user_recommendations WHERE user_id = u.id) as rec_count
FROM auth.users u
LEFT JOIN user_recommendation_status urs ON urs.user_id = u.id
ORDER BY urs.last_generated_at DESC NULLS LAST;
```

### Check for Errors

View users with errors:

```sql
SELECT
  user_id,
  error_message,
  updated_at
FROM user_recommendation_status
WHERE error_message IS NOT NULL
ORDER BY updated_at DESC;
```

## Troubleshooting

### Cron Job Not Running

**Problem**: Cron job doesn't appear to be executing

**Solutions**:
1. Check if pg_cron extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
2. Verify job exists: `SELECT * FROM cron.job;`
3. Check job run details for errors: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC;`
4. Ensure database settings are configured (Step 3)

### Configuration Missing Error

**Problem**: Error message: "Missing required configuration: supabase_url or service_role_key"

**Solution**: Set the database settings as described in Step 3

### HTTP Extension Error

**Problem**: Error about `http_request` function not found

**Solution**: Ensure `http` extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
```

### No Eligible Users

**Problem**: `process_scheduled_recommendations()` returns `processed_count: 0`

**Reasons**:
- No users have rated movies 4+ stars
- All eligible users were processed recently (within 24 hours)
- Users are currently being processed

**Solution**: Wait for next scheduled interval or manually trigger for specific user

### Edge Function Timeout

**Problem**: Edge function times out for users with many movies

**Solution**: The function processes in batches and has built-in delays. For very active users, consider:
- Reducing `MAX_RECOMMENDATIONS` in the edge function
- Limiting cast/crew query scope
- Optimizing database indexes

### Recommendations Not Appearing

**Problem**: Status shows successful generation but no recommendations

**Check**:
1. Verify recommendations exist: `SELECT COUNT(*) FROM user_recommendations WHERE user_id = 'USER_ID';`
2. Check if user has rated movies: `SELECT * FROM movies_users WHERE user_id = 'USER_ID' AND rating >= 4;`
3. Review edge function logs: `supabase functions logs generate_recommendations`

## Performance Tuning

### For Large User Bases

If you have thousands of users:

1. **Increase batch size** but add processing delays:
   ```sql
   -- In process_scheduled_recommendations:
   limit 50  -- Instead of 10
   perform pg_sleep(1);  -- Increase delay between users
   ```

2. **Run more frequently** with smaller batches:
   ```sql
   -- Every 30 minutes instead of hourly
   '*/30 * * * *'
   ```

3. **Prioritize active users**:
   Modify the user selection query to prioritize recently active users

4. **Add database indexes**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_movies_users_rating
   ON movies_users(user_id, watched, rating);

   CREATE INDEX IF NOT EXISTS idx_movie_credits_name
   ON movie_credits(name, role);
   ```

## Unscheduling/Disabling

To stop automatic recommendation generation:

```sql
-- Disable the cron job
SELECT cron.unschedule('generate-user-recommendations-hourly');

-- Or pause it temporarily by updating the schedule to never run
SELECT cron.schedule(
  'generate-user-recommendations-hourly',
  '0 0 31 2 *',  -- Feb 31 never exists
  $$SELECT public.process_scheduled_recommendations();$$
);
```

## Security Considerations

1. **Service Role Key**: Store securely in database settings, never commit to git
2. **RLS Policies**: Ensure user_recommendations and user_recommendation_status have proper RLS
3. **Rate Limiting**: Consider adding rate limiting if allowing manual triggers from frontend
4. **Monitoring**: Regularly check error messages for security issues

## Next Steps

After setup is complete:

1. ✅ Monitor the first few cron job executions
2. ✅ Check recommendation quality for test users
3. ✅ Adjust scheduling frequency based on user activity
4. ✅ Consider adding a UI for users to manually trigger updates
5. ✅ Implement notification when new recommendations are available

## Support

If you encounter issues:

1. Check Supabase function logs: `supabase functions logs generate_recommendations`
2. Review cron job execution: `SELECT * FROM cron.job_run_details`
3. Examine user_recommendation_status for errors
4. Verify database settings are correct
