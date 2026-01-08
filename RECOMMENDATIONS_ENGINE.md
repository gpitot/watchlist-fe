# Movie Recommendations Engine

## Overview

The recommendations engine generates personalized movie and TV show recommendations for users based on their watch history and ratings. It analyzes cast members, crew members, and production companies from movies users have watched and rated highly to find similar content.

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

**2. Generate Recommendations**

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

#### Response Type

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
```

## Scheduling (Future Implementation)

The recommendations engine is designed to be run on a schedule (e.g., daily or weekly) for each user. This can be implemented using:

1. **Supabase Cron Jobs** (pg_cron extension)
   ```sql
   SELECT cron.schedule(
     'generate-recommendations-daily',
     '0 2 * * *',  -- Run at 2 AM daily
     $$
     SELECT net.http_post(
       'https://your-project.supabase.co/functions/v1/generate_recommendations',
       body := '{}',
       headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'
     );
     $$
   );
   ```

2. **External Scheduler** (Vercel Cron, AWS EventBridge, etc.)
   - Call the edge function with service role credentials
   - Iterate through all active users

3. **User-Triggered Updates**
   - Regenerate when user adds new ratings
   - Regenerate when user requests fresh recommendations

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

- **Migration**: `supabase/migrations/20260108000000_create_recommendations_table.sql`
- **Edge Function**: `supabase/functions/generate_recommendations/index.ts`
- **API Hooks**: `src/api/movies.ts` (useGetRecommendations, useGenerateRecommendations)
- **Type Definitions**:
  - `src/interfaces/database.types.ts`
  - `supabase/functions/_shared/database.types.ts`
