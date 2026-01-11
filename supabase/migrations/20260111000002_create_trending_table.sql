-- Create trending table to store current trending movies/TV shows
CREATE TABLE IF NOT EXISTS public.trending (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    medium TEXT NOT NULL CHECK (medium IN ('movie', 'tv')),
    trending_rank INTEGER NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(movie_id)
);

-- Index for efficient querying by rank
CREATE INDEX idx_trending_rank ON public.trending(trending_rank);

-- Index for joining with movies table
CREATE INDEX idx_trending_movie_id ON public.trending(movie_id);

-- Enable Row Level Security
ALTER TABLE public.trending ENABLE ROW LEVEL SECURITY;

-- Public read access (trending data is not user-specific)
CREATE POLICY "Allow public read access on trending"
    ON public.trending
    FOR SELECT
    USING (true);

-- Service role can manage trending data
CREATE POLICY "Allow service role to manage trending"
    ON public.trending
    FOR ALL
    USING (auth.role() = 'service_role');
