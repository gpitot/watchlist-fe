-- Update trending table unique constraint to allow same movie on different dates
-- Drop the old unique constraint on movie_id only
ALTER TABLE public.trending DROP CONSTRAINT IF EXISTS trending_movie_id_key;

-- Add unique constraint on movie_id + date (cast created_at to date)
-- This allows the same movie to appear in trending on different dates
CREATE UNIQUE INDEX IF NOT EXISTS trending_movie_id_date_unique
ON public.trending (movie_id, DATE(created_at));
