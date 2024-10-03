import { Stream, useAddMovie, useSearchStreams } from "api/movies";
import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { debounce } from "lodash-es";

const Result: React.FC<{
  item: Stream;
  handleAdd: (body: { id: number; medium: string }) => void;
}> = ({ item, handleAdd }) => {
  return (
    <button
      className={classNames(
        "flex items-center gap-x-2 min-h-10 justify-between border-b-2",
        {
          "bg-green-50": item.medium === "tv",
          "bg-blue-50": item.medium === "movie",
        }
      )}
      key={item.id}
      onClick={() => handleAdd({ id: item.id, medium: item.medium })}
    >
      <span className="p-2 italic text-sm">
        {item.name}{" "}
        {item.release_date ? `(${item.release_date.slice(0, 4)})` : ""}
      </span>
      <img src={item.poster_path} alt="" className="h-10" />
    </button>
  );
};

const Results: React.FC<{
  data?: {
    movies: Stream[];
    tvs: Stream[];
  } | null;
  handleAdd: (body: { id: number; medium: string }) => void;
}> = ({ data, handleAdd }) => {
  if (!data) {
    return null;
  }
  const hasMovies = data.movies.length > 0;
  const hasTvs = data.tvs.length > 0;
  if (!hasMovies && !hasTvs) {
    return null;
  }

  return (
    <div className="flex flex-col absolute z-10 top-10 border-black border-4">
      {hasMovies && (
        <h2 className="text-sm font-bold border-b-2 bg-blue-100 p-2">Movies</h2>
      )}
      {data.movies.map((item) => (
        <Result item={item} handleAdd={handleAdd} />
      ))}
      {hasTvs && (
        <h2 className="text-sm font-bold border-b-2 bg-green-100 p-2">Shows</h2>
      )}
      {data.tvs.map((item) => (
        <Result item={item} handleAdd={handleAdd} />
      ))}
    </div>
  );
};

const AddMovie: React.FC = () => {
  const { mutate: search, data } = useSearchStreams();
  const { mutate: add, isLoading } = useAddMovie();

  const [title, setTitle] = useState("");

  const handleAdd = (body: { id: number; medium: string }) => {
    add(body);
    setTitle("");
  };

  const handleSearch = useCallback(
    debounce((title: string) => {
      if (search.length <= 0) {
        return;
      }
      search(title);
    }, 1000),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <div className="flex flex-col relative w-[400px] max-w-full">
      <input
        type="text"
        className="border-2 p-2 w-full max-w-full border-black"
        placeholder="Add a movie or show to your watchlist"
        onChange={handleChange}
        value={title}
        disabled={isLoading}
      />
      {title.length > 0 && <Results data={data} handleAdd={handleAdd} />}
    </div>
  );
};

export { AddMovie };
