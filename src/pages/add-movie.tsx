import { Stream, useAddMovie, useSearchStreams } from "api/movies";
import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { debounce } from "lodash-es";

const Result: React.FC<{
  item: Stream;
  handleAdd: (body: { id: number; medium: string; streamData: Stream }) => void;
}> = ({ item, handleAdd }) => {
  const year = item.release_date ? item.release_date.slice(0, 4) : null;
  const isTV = item.medium === "tv";

  return (
    <button
      className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover transition-colors text-left"
      onClick={() =>
        handleAdd({ id: item.id, medium: item.medium, streamData: item })
      }
    >
      {item.poster_path ? (
        <img
          src={item.poster_path}
          alt=""
          className="w-10 h-14 object-cover rounded-md flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-14 rounded-md bg-surface flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-text-muted"
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
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {year && <span className="text-text-tertiary text-xs">{year}</span>}
          <span
            className={classNames(
              "text-xs px-1.5 py-0.5 rounded",
              isTV
                ? "bg-success/20 text-success-lighter"
                : "bg-info/20 text-info-light"
            )}
          >
            {isTV ? "TV" : "Movie"}
          </span>
        </div>
      </div>
      <svg
        className="w-5 h-5 text-text-muted flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
};

const Results: React.FC<{
  data?: {
    movies: Stream[];
    tvs: Stream[];
  } | null;
  handleAdd: (body: { id: number; medium: string; streamData: Stream }) => void;
}> = ({ data, handleAdd }) => {
  if (!data) {
    return null;
  }
  const hasMovies = data.movies.length > 0;
  const hasTvs = data.tvs.length > 0;

  return (
    <div className="absolute z-50 top-full left-0 right-0 mt-2 max-h-[60vh] overflow-y-auto rounded-xl bg-bg-primary border border-border-default shadow-2xl shadow-primary">
      {!hasMovies && !hasTvs && (
        <div className="p-4 text-center text-text-tertiary text-sm">
          No results found
        </div>
      )}

      {hasMovies && (
        <>
          <div className="sticky top-0 px-3 py-2 bg-bg-tertiary/90 backdrop-blur border-b border-border-default">
            <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Movies
            </h3>
          </div>
          <div className="divide-y divide-border-default">
            {data.movies.map((item) => (
              <Result key={item.id} item={item} handleAdd={handleAdd} />
            ))}
          </div>
        </>
      )}

      {hasTvs && (
        <>
          <div className="sticky top-0 px-3 py-2 bg-bg-tertiary/90 backdrop-blur border-b border-border-default">
            <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
              TV Shows
            </h3>
          </div>
          <div className="divide-y divide-border-default">
            {data.tvs.map((item) => (
              <Result key={item.id} item={item} handleAdd={handleAdd} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const AddMovie: React.FC = () => {
  const {
    mutate: search,
    data,
    isLoading: isSearchLoading,
  } = useSearchStreams();
  const { mutate: add, isLoading } = useAddMovie();

  const [title, setTitle] = useState("");

  const handleAdd = (body: {
    id: number;
    medium: string;
    streamData: Stream;
  }) => {
    add(body);
    setTitle("");
  };

  const handleSearch = useCallback(
    debounce((title: string) => {
      if (search.length <= 0) {
        return;
      }
      search(title);
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <div className="flex flex-col relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
          placeholder="Search movies or TV shows..."
          onChange={handleChange}
          value={title}
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isSearchLoading && (
            <div className="w-5 h-5 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
          )}
          {!isSearchLoading && title && (
            <button
              onClick={() => setTitle("")}
              className="p-1 rounded-full hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {title.length > 0 && <Results data={data} handleAdd={handleAdd} />}
    </div>
  );
};

export { AddMovie };
