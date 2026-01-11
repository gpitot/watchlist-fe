-- Add poster_path column to movies table for storing TMDB poster URLs
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS poster_path TEXT;
