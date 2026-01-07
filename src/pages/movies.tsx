import classNames from "classnames";

import { useState } from "react";
import { MovieDetailsResponse } from "api/movies";
import { MovieModal } from "pages/movie-modal";
import { Stars } from "components/stars";

type MovieState = "watched" | "available" | "unavailable";

const getMovieState = (
  movie: MovieDetailsResponse,
  availableProviders: string[]
): MovieState => {
  if (movie.watched) {
    return "watched";
  }

  const hasFreeProviders = movie.movie_providers.some((p) =>
    availableProviders.includes(p.provider_name ?? "")
  );

  if (hasFreeProviders) {
    return "available";
  }

  return "unavailable";
};

const StateIndicator: React.FC<{ state: MovieState }> = ({ state }) => {
  if (state === "watched") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Watched
      </span>
    );
  }
  if (state === "available") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Available
      </span>
    );
  }
  if (state === "unavailable") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/50 border border-white/20">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        Not available
      </span>
    );
  }
  return null;
};

const MovieCard: React.FC<{
  movie: MovieDetailsResponse;
  state: MovieState;
  onClick: () => void;
}> = ({ movie, state, onClick }) => {
  const genres = movie.movies_genres.map((g) => g.genre).join(", ");
  const year = movie.release_date?.slice(0, 4);

  return (
    <button
      onClick={onClick}
      className={classNames(
        "w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-200",
        "hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/5",
        "focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-[0.98]",
        {
          "bg-white/5 border-white/10": state === "unavailable",
          "bg-green-500/5 border-green-500/20": state === "available",
          "bg-purple-500/5 border-purple-500/20 opacity-75": state === "watched",
        }
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
              <h3
                className={classNames(
                  "font-medium text-base sm:text-lg",
                  state === "watched" ? "text-white/60" : "text-white"
                )}
              >
                {movie.title}
              </h3>
              {year && (
                <span className="text-white/40 text-sm flex-shrink-0">({year})</span>
              )}
            </div>
            <StateIndicator state={state} />
          </div>

          {movie.rating && (
            <div className="flex-shrink-0 mt-0.5">
              <Stars rating={movie.rating} size="sm" />
            </div>
          )}
        </div>

        {genres && (
          <p className="text-white/40 text-sm line-clamp-1">{genres}</p>
        )}
      </div>
    </button>
  );
};

type FilterType = "all" | "available" | "watched" | "unavailable";

const TableUI: React.FC<{
  data: MovieDetailsResponse[];
  availableProviders: string[];
}> = ({ data, availableProviders }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<MovieDetailsResponse>();
  const [filter, setFilter] = useState<FilterType>("all");

  const handleMovieClick = (movie: MovieDetailsResponse) => {
    setCurrentMovie(movie);
    setModalIsOpen(true);
  };

  const onModalClose = () => {
    setModalIsOpen(false);
    setCurrentMovie(undefined);
  };

  const watchedCount = data.filter((m) => m.watched).length;
  const availableCount = data.filter(
    (m) => !m.watched && getMovieState(m, availableProviders) === "available"
  ).length;
  const unavailableCount = data.filter(
    (m) => getMovieState(m, availableProviders) === "unavailable"
  ).length;

  const filteredData = data.filter((movie) => {
    if (filter === "all") return true;
    const state = getMovieState(movie, availableProviders);
    if (filter === "available") return state === "available";
    if (filter === "watched") return state === "watched";
    if (filter === "unavailable") return state === "unavailable";
    return true;
  });

  const toggleFilter = (type: FilterType) => {
    setFilter((current) => (current === type ? "all" : type));
  };

  return (
    <>
      <MovieModal
        isOpen={modalIsOpen}
        onModalClose={onModalClose}
        movie={currentMovie}
      />

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-lg md:text-xl font-medium text-white">
            Your Watchlist
            <span className="text-white/40 font-normal ml-2">
              ({filteredData.length} {filteredData.length === 1 ? "title" : "titles"})
            </span>
          </h2>
          <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2 -mb-2 md:pb-0 md:mb-0">
            {availableCount > 0 && (
              <button
                onClick={() => toggleFilter("available")}
                className={classNames(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap flex-shrink-0",
                  filter === "available"
                    ? "bg-green-500/20 border-green-500/40 text-green-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-green-400" />
                {availableCount} available
              </button>
            )}
            {unavailableCount > 0 && (
              <button
                onClick={() => toggleFilter("unavailable")}
                className={classNames(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap flex-shrink-0",
                  filter === "unavailable"
                    ? "bg-white/20 border-white/30 text-white/70"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-white/40" />
                {unavailableCount} not available
              </button>
            )}
            {watchedCount > 0 && (
              <button
                onClick={() => toggleFilter("watched")}
                className={classNames(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap flex-shrink-0",
                  filter === "watched"
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                )}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {watchedCount} watched
              </button>
            )}
          </div>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12 px-4 text-white/40">
            <p className="text-base">Your watchlist is empty</p>
            <p className="text-sm mt-1">Add movies or shows to get started</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 px-4 text-white/40">
            <p className="text-base">No movies match this filter</p>
            <button
              onClick={() => setFilter("all")}
              className="text-sm mt-2 text-purple-400 hover:text-purple-300 underline active:text-purple-200"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {filteredData.map((movie) => {
              const movieState = getMovieState(movie, availableProviders);
              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  state={movieState}
                  onClick={() => handleMovieClick(movie)}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
export const Movies: React.FC<{
  movies: MovieDetailsResponse[];
  availableProviders: string[];
}> = ({ movies, availableProviders }) => {
  return <TableUI data={movies} availableProviders={availableProviders} />;
};
