import classNames from "classnames";

import { useState } from "react";
import { MovieDetailsResponse } from "api/movies";
import { MovieModal } from "pages/movie-modal";

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
      render: ({ title }) => <>{title}</>,
    },
  ],

  // [
  //   "Rating",
  //   {
  //     dataType: "rating",
  //     render: ({ rating }) => <>{rating}</>,
  //   },
  // ],

  [
    "Genres",
    {
      dataType: "movies_genres",
      render: ({ movies_genres }) => (
        <>{movies_genres.map((genre) => genre.genre).join(", ")}</>
      ),
    },
  ],

  // [
  //   "Providers",
  //   {
  //     dataType: "movie_providers",
  //     render: ({ movie_providers }) => (
  //       <>
  //         {movie_providers
  //           .filter((provider) => provider.provider_type === "free")
  //           .map((provider) => provider.provider_name)
  //           .join(", ")}
  //       </>
  //     ),
  //   },
  // ],

  // [
  //   "Description",
  //   {
  //     dataType: "description",
  //     render: ({ description }) => <>{description?.slice(0, 20)}</>,
  //   },
  // ],

  // [
  //   "Production",
  //   {
  //     dataType: "production",
  //     render: ({ production }) => <>{production}</>,
  //   },
  // ],

  [
    "Release",
    {
      dataType: "release_date",
      render: ({ release_date }) => <>{release_date}</>,
    },
  ],

  // [
  //   "Watched",
  //   {
  //     dataType: "watched",
  //     render: ({ watched }) => <>{watched ? "Yes" : "No"}</>,
  //   },
  // ],
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
              const hasFreeProviders = movie.movie_providers.some((p) =>
                availableProviders.includes(p.provider_name ?? "")
              );
              return (
                <tr
                  key={movie.id}
                  className={classNames({
                    "bg-green-300": hasFreeProviders,
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
