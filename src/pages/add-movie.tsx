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
      className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
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
        <div className="w-10 h-14 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-white/30"
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
        <p className="text-white text-sm font-medium truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {year && <span className="text-white/50 text-xs">{year}</span>}
          <span
            className={classNames(
              "text-xs px-1.5 py-0.5 rounded",
              isTV
                ? "bg-green-500/20 text-green-300"
                : "bg-blue-500/20 text-blue-300"
            )}
          >
            {isTV ? "TV" : "Movie"}
          </span>
        </div>
      </div>
      <svg
        className="w-5 h-5 text-white/30 flex-shrink-0"
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
    <div className="absolute z-20 top-full left-0 right-0 mt-2 max-h-[60vh] overflow-y-auto rounded-xl bg-slate-900 border border-white/10 shadow-2xl shadow-black/50">
      {!hasMovies && !hasTvs && (
        <div className="p-4 text-center text-white/50 text-sm">
          No results found
        </div>
      )}

      {hasMovies && (
        <>
          <div className="sticky top-0 px-3 py-2 bg-slate-800/90 backdrop-blur border-b border-white/10">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Movies
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {data.movies.map((item) => (
              <Result key={item.id} item={item} handleAdd={handleAdd} />
            ))}
          </div>
        </>
      )}

      {hasTvs && (
        <>
          <div className="sticky top-0 px-3 py-2 bg-slate-800/90 backdrop-blur border-b border-white/10">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">
              TV Shows
            </h3>
          </div>
          <div className="divide-y divide-white/5">
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
            className="w-5 h-5 text-white/40"
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
          className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
          placeholder="Search movies or TV shows..."
          onChange={handleChange}
          value={title}
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isSearchLoading && (
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          )}
          {!isSearchLoading && title && (
            <button
              onClick={() => setTitle("")}
              className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
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
