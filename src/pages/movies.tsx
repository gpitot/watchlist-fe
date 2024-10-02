import classNames from "classnames";

import { useState } from "react";
import { MovieDetailsResponse } from "api/movies";
import { MovieModal } from "pages/movie-modal";
import { Stars } from "components/stars";

const columns: [
  string,
  {
    dataType: keyof MovieDetailsResponse;
    render: React.FC<MovieDetailsResponse>;
  }
][] = [
  [
    "Title",
    {
      dataType: "title",
      render: ({ title, rating }) => (
        <>
          <span>{title}</span>
          {rating && <Stars rating={rating} size="sm" />}
        </>
      ),
    },
  ],

  [
    "Genres",
    {
      dataType: "movies_genres",
      render: ({ movies_genres }) => (
        <>{movies_genres.map((genre) => genre.genre).join(", ")}</>
      ),
    },
  ],

  [
    "Release",
    {
      dataType: "release_date",
      render: ({ release_date }) => <>{release_date}</>,
    },
  ],
] as const;

const findParentRow = (el: HTMLElement): HTMLElement | null => {
  if (el.tagName === "TR") {
    return el;
  }

  if (el.parentElement) {
    return findParentRow(el.parentElement);
  }
  return null;
};

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

const TableUI: React.FC<{
  data: MovieDetailsResponse[];
  availableProviders: string[];
}> = ({ data, availableProviders }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<MovieDetailsResponse>();

  const handleClick = (e: React.MouseEvent<HTMLTableSectionElement>) => {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }
    const row = findParentRow(e.target);
    if (!row) {
      return;
    }
    const movieId = row.getAttribute("data-movieid");
    if (!movieId) {
      throw new Error("Movie ID not found");
    }
    setCurrentMovie(data.find((m) => m.id === Number(movieId)));
    setModalIsOpen(true);
  };

  return (
    <>
      <MovieModal
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
        movie={currentMovie}
      />
      <div className="relative w-screen overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map(([header]) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>

          <tbody onClick={handleClick}>
            {data.map((movie) => {
              const movieState = getMovieState(movie, availableProviders);

              return (
                <tr
                  key={movie.id}
                  className={classNames({
                    "bg-gray-100": movieState === "unavailable",
                    "bg-green-100": movieState === "available",
                    "bg-pink-100": movieState === "watched",
                  })}
                  data-movieid={movie.id}
                >
                  {columns.map(([column, config]) => (
                    <td key={column} className="p-1">
                      {config.render(movie)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
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
