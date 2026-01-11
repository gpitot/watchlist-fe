import { Stream, useAddMovie, useGetTrending } from "api/movies";
import classNames from "classnames";
import { useState } from "react";
import { useUserContext } from "providers/user_provider";

const TrendingCard: React.FC<{
  item: Stream;
  onAdd: (body: { id: number; medium: string; streamData: Stream }) => void;
}> = ({ item, onAdd }) => {
  const year = item.release_date ? item.release_date.slice(0, 4) : null;
  const isTV = item.medium === "tv";

  return (
    <button
      onClick={() => onAdd({ id: item.id, medium: item.medium, streamData: item })}
      className="flex-shrink-0 w-32 sm:w-36 group"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface-hover">
        {item.poster_path ? (
          <img
            src={item.poster_path}
            alt={item.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <span className="text-white text-xs font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </span>
        </div>
        <div
          className={classNames(
            "absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded font-medium",
            isTV ? "bg-green-500/90 text-white" : "bg-blue-500/90 text-white"
          )}
        >
          {isTV ? "TV" : "Movie"}
        </div>
      </div>
      <div className="mt-2 text-left">
        <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
        {year && <p className="text-text-tertiary text-xs">{year}</p>}
      </div>
    </button>
  );
};

export const TrendingSection: React.FC = () => {
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("week");
  const { user } = useUserContext();
  const { data, isLoading } = useGetTrending(timeWindow, user?.id);
  const { mutate: addMovie } = useAddMovie();

  const handleAdd = (body: { id: number; medium: string; streamData: Stream }) => {
    addMovie(body);
  };

  if (isLoading) {
    return (
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-6 w-32 bg-surface-hover rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 sm:w-36">
              <div className="aspect-[2/3] rounded-lg bg-surface-hover animate-pulse" />
              <div className="mt-2 h-4 w-24 bg-surface-hover rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasMovies = data.movies && data.movies.length > 0;
  const hasTvs = data.tvs && data.tvs.length > 0;

  if (!hasMovies && !hasTvs) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-light" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
            </svg>
            Trending
          </h2>
        </div>
        <div className="flex gap-1 p-1 bg-surface rounded-lg">
          <button
            onClick={() => setTimeWindow("day")}
            className={classNames(
              "px-3 py-1 text-sm rounded-md transition-all",
              timeWindow === "day"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Today
          </button>
          <button
            onClick={() => setTimeWindow("week")}
            className={classNames(
              "px-3 py-1 text-sm rounded-md transition-all",
              timeWindow === "week"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            This Week
          </button>
        </div>
      </div>

      {hasMovies && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Movies</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-6 sm:px-6 scrollbar-hide">
            {data.movies.map((item) => (
              <TrendingCard key={item.id} item={item} onAdd={handleAdd} />
            ))}
          </div>
        </div>
      )}

      {hasTvs && (
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">TV Shows</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-6 sm:px-6 scrollbar-hide">
            {data.tvs.map((item) => (
              <TrendingCard key={item.id} item={item} onAdd={handleAdd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
