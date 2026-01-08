# Movie Recommendations Engine

## Overview

The recommendations engine generates personalized movie and TV show recommendations for users based on their watch history and ratings. It analyzes cast members, crew members, and production companies from movies users have watched and rated highly to find similar content.

**⚙️ Automated Scheduling**: The engine runs automatically on a schedule (hourly by default), processing users in batches without manual intervention. See the [Scheduling](#scheduling-automated-generation) section below.

## How It Works

### Algorithm

1. **Analyze User Preferences**
   - Fetches all movies the user has watched with a rating of 4 or higher
   - Extracts cast, crew, and production companies from these movies

2. **Calculate Weights**
   - Each person/company is weighted by:
     - **Frequency**: How many liked movies they appear in
     - **Average Rating**: The average rating of movies they appear in
   - Weight formula: `appearances × avgRating`

3. **Find Candidate Movies**
   - Searches the database for movies featuring the same cast, crew, or production companies
   - Excludes movies already in the user's watchlist

4. **Score Recommendations**
   - Each candidate movie receives a score based on:
     - Number of matching cast members (weighted)
     - Number of matching crew members (weighted)
     - Production company match (weighted 1.5x)
   - Higher scores indicate stronger recommendations

5. **Store Top Recommendations**
   - Stores up to 20 top-scoring recommendations per user
   - Includes reasoning (which cast/crew/production companies matched)

### Database Schema

**Table: `user_recommendations`**

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key (auto-generated) |
| user_id | uuid | Foreign key to auth.users |
| movie_id | bigint | Foreign key to movies |
| score | numeric | Recommendation strength score |
| reason | jsonb | JSON object with matching details |
| generated_at | timestamp | When the recommendation was generated |
| created_at | timestamp | Record creation time |

**Reason JSON Structure:**
```json
{
  "matching_cast": ["Actor Name 1", "Actor Name 2"],
  "matching_crew": ["Director Name"],
  "matching_production": true
}
```

**Indexes:**
- `user_recommendations_user_id_idx` on `user_id`
- `user_recommendations_user_score_idx` on `(user_id, score DESC)`

**Row Level Security (RLS):**
- Users can only read their own recommendations
- Service role can manage all recommendations

**Table: `user_recommendation_status`**

Tracks when recommendations were generated for each user and scheduling information.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Primary key, foreign key to auth.users |
| last_generated_at | timestamp | Last time recommendations were generated |
| next_scheduled_at | timestamp | When next generation is scheduled |
| is_processing | boolean | Whether currently generating recommendations |
| error_message | text | Last error message if any |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

## Scheduling (Automated Generation)

The recommendations engine runs **automatically on a schedule** using PostgreSQL's `pg_cron` extension. By default, it processes up to 10 eligible users every hour.

### How Scheduling Works

1. **Hourly Cron Job**: Runs at the top of every hour (`:00`)
2. **User Eligibility**: Selects users who:
   - Have rated movies 4+ stars
   - Never had recommendations OR last generated 24+ hours ago
   - Are not currently being processed
3. **Batch Processing**: Processes up to 10 users per batch to avoid long transactions
4. **Status Tracking**: Updates `user_recommendation_status` table with results

### Database Functions

**`generate_recommendations_for_user(user_id)`**
- Generates recommendations for a single user
- Called by the scheduler or manually
- Updates status table with results

**`process_scheduled_recommendations()`**
- Batch processes eligible users
- Called by pg_cron every hour
- Returns summary with counts and errors

### Setup

For detailed setup instructions, see **[RECOMMENDATIONS_SETUP.md](./RECOMMENDATIONS_SETUP.md)**

Quick setup checklist:
1. ✅ Apply database migrations (`supabase db push`)
2. ✅ Deploy edge function (`supabase functions deploy generate_recommendations`)
3. ✅ Configure database settings (Supabase URL and service role key)
4. ✅ Verify pg_cron job is scheduled

### Manual Triggering

You can manually trigger recommendations for a specific user:

```sql
SELECT public.generate_recommendations_for_user('user-uuid-here');
```

Or manually run the batch processor:

```sql
SELECT public.process_scheduled_recommendations();
```

### Monitoring

Check recommendation generation status:

```sql
-- View user status
SELECT * FROM user_recommendation_status WHERE user_id = 'USER_UUID';

-- View recent cron job executions
SELECT * FROM cron.job_run_details
WHERE jobname = 'generate-user-recommendations-hourly'
ORDER BY start_time DESC LIMIT 10;
```

### Configuration

**Change Schedule Frequency:**

```sql
-- Run every 6 hours instead of hourly
SELECT cron.unschedule('generate-user-recommendations-hourly');
SELECT cron.schedule(
  'generate-user-recommendations-6hourly',
  '0 */6 * * *',
  $$SELECT public.process_scheduled_recommendations();$$
);
```

**Adjust Batch Size:**

Edit the `process_scheduled_recommendations()` function and change the `LIMIT` clause.

## Usage

### Backend

#### Supabase Edge Function

**Function**: `generate_recommendations`

**Endpoint**: `POST /functions/v1/generate_recommendations`

**Authentication**: Requires valid user JWT token

**Request**: No body required (uses authenticated user ID)

**Response**:
```json
{
  "message": "Recommendations generated successfully",
  "count": 20,
  "recommendations": [
    {
      "movieId": 123,
      "score": 15.5,
      "matches": {
        "cast": ["Actor A", "Actor B"],
        "crew": ["Director C"],
        "production": true
      }
    }
  ]
}
```

**Configuration:**
- `MIN_RATING_THRESHOLD`: 4 (minimum rating to consider a movie as "liked")
- `MAX_RECOMMENDATIONS`: 20 (maximum recommendations per user)

### Frontend

#### API Hooks

**1. Fetch Recommendations**

```typescript
import { useGetRecommendations } from "api/movies";
import { useUserContext } from "providers/user_provider";

const MyComponent = () => {
  const { user } = useUserContext();
  const { data, isLoading, error } = useGetRecommendations(user?.id);

  if (isLoading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error loading recommendations</div>;

  return (
    <div>
      {data?.map((rec) => (
        <div key={rec.id}>
          <h3>{rec.movies.title}</h3>
          <p>Score: {rec.score}</p>
          <p>Matched Cast: {rec.reason.matching_cast.join(", ")}</p>
        </div>
      ))}
    </div>
  );
};
```

**2. Generate Recommendations (Manual Trigger)**

```typescript
import { useGenerateRecommendations } from "api/movies";

const GenerateButton = () => {
  const { mutate, isLoading } = useGenerateRecommendations();

  return (
    <button
      onClick={() => mutate()}
      disabled={isLoading}
    >
      {isLoading ? "Generating..." : "Generate Recommendations"}
    </button>
  );
};
```

**3. Check Recommendation Status**

```typescript
import { useGetRecommendationStatus } from "api/movies";
import { useUserContext } from "providers/user_provider";

const StatusComponent = () => {
  const { user } = useUserContext();
  const { data: status } = useGetRecommendationStatus(user?.id);

  if (!status) return <div>No recommendations generated yet</div>;

  return (
    <div>
      <p>Last Generated: {new Date(status.last_generated_at).toLocaleString()}</p>
      <p>Next Scheduled: {status.next_scheduled_at ? new Date(status.next_scheduled_at).toLocaleString() : 'Soon'}</p>
      {status.is_processing && <p>⏳ Currently generating...</p>}
      {status.error_message && <p>❌ Error: {status.error_message}</p>}
    </div>
  );
};
```

#### Response Types

```typescript
type RecommendationResponse = {
  id: number;
  movie_id: number;
  score: number;
  reason: {
    matching_cast: string[];
    matching_crew: string[];
    matching_production: boolean;
  };
  generated_at: string;
  movies: {
    id: number;
    title: string;
    description: string | null;
    release_date: string | null;
    production: string | null;
    medium: string;
  };
};

type RecommendationStatus = {
  user_id: string;
  last_generated_at: string | null;
  next_scheduled_at: string | null;
  is_processing: boolean | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};
```

## Performance Considerations

### Optimization Strategies

1. **Batch Processing**
   - Process users in batches if running scheduled updates
   - Use connection pooling for database queries

2. **Caching**
   - Cache recommendations for 24-48 hours
   - Only regenerate when user's watch history changes significantly

3. **Query Optimization**
   - Indexes on `movie_credits.name` and `movies.production` improve lookup speed
   - Limit cast/crew to top 5 per movie (already implemented in data ingestion)

4. **Incremental Updates**
   - Only recalculate when user adds new ratings
   - Track `last_generated` timestamp

### Scaling Considerations

- **Current Implementation**: Suitable for 100-1000 active users
- **For Larger Scale**:
  - Move to background job queue (BullMQ, Temporal)
  - Implement collaborative filtering or ML models
  - Use vector embeddings for similarity search
  - Consider dedicated recommendation service

## Testing

### Manual Testing

1. **Setup**: Ensure user has rated at least 3 movies with 4+ stars
2. **Generate**: Call the edge function or use the frontend hook
3. **Verify**: Check that recommendations:
   - Don't include movies already in user's watchlist
   - Have matching cast/crew/production companies
   - Are sorted by score (descending)

### Example Test Case

```typescript
// Test: User who loves Marvel movies
// Setup: Rate highly: "Iron Man", "The Avengers", "Thor"
// Expected: Recommendations include other Marvel movies with:
//   - Robert Downey Jr., Chris Hemsworth (cast)
//   - Jon Favreau, Joss Whedon (crew)
//   - Marvel Studios (production)
```

## Future Enhancements

1. **Genre-Based Recommendations**
   - Factor in matching genres from `movies_genres` table
   - Weight by user's genre preferences

2. **Recency Bias**
   - Prefer newer movies or recent user interactions
   - Decay older ratings over time

3. **Diversity**
   - Ensure variety in recommendations (not all from same series)
   - Balance between safe picks and discovery

4. **User Feedback**
   - Track which recommendations users add to watchlist
   - Improve algorithm based on acceptance rate

5. **Collaborative Filtering**
   - "Users who liked X also liked Y"
   - Find similar users based on rating patterns

6. **Content-Based Features**
   - Movie descriptions/plots analysis
   - Keywords and themes
   - Director/actor filmography analysis

7. **Streaming Availability**
   - Prioritize recommendations available on user's streaming services
   - Use `user_providers` table for filtering

## Troubleshooting

### No Recommendations Generated

**Cause**: User hasn't rated enough movies
**Solution**: User needs at least 1 movie rated 4+ stars

### Low-Quality Recommendations

**Cause**: Insufficient data or edge cases
**Solutions**:
- Increase `MIN_RATING_THRESHOLD` to be more selective
- Require minimum number of liked movies
- Implement genre/keyword matching

### Performance Issues

**Cause**: Too many database queries
**Solutions**:
- Add database indexes
- Batch queries where possible
- Cache frequently accessed data
- Limit number of cast/crew members processed

## Migration

To apply the recommendations table migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration file:
# supabase/migrations/20260108000000_create_recommendations_table.sql
```

## Files

**Migrations:**
- `supabase/migrations/20260108000000_create_recommendations_table.sql` - Creates recommendations table
- `supabase/migrations/20260108000001_setup_recommendations_scheduling.sql` - Sets up scheduling with pg_cron

**Edge Function:**
- `supabase/functions/generate_recommendations/index.ts` - Recommendation generation logic

**API Hooks:**
- `src/api/movies.ts`:
  - `useGetRecommendations(userId)` - Fetch recommendations
  - `useGenerateRecommendations()` - Trigger manual generation
  - `useGetRecommendationStatus(userId)` - Check generation status

**Type Definitions:**
- `src/interfaces/database.types.ts` - Frontend types
- `supabase/functions/_shared/database.types.ts` - Backend types

**Documentation:**
- `RECOMMENDATIONS_ENGINE.md` - This file (overview and usage)
- `RECOMMENDATIONS_SETUP.md` - Detailed setup instructions
