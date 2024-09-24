import {
  MovieDetailsResponse,
  useRemoveMovie,
  useToggleWatched,
  useUpdateRating,
} from "api/movies";
import classNames from "classnames";
import { Stars } from "components/stars";

export const MovieModal: React.FC<{
  movie?: MovieDetailsResponse;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ movie, isOpen, setIsOpen }) => {
  const { mutateAsync: mutateAsyncToggleWatched } = useToggleWatched();
  const { mutateAsync: mutateAsyncUpdateRating } = useUpdateRating();
  const { mutateAsync: mutateAsyncRemoveMovie } = useRemoveMovie();

  const toggleWatched = async () => {
    if (!movie) {
      return;
    }
    await mutateAsyncToggleWatched(movie);
    setIsOpen(false);
  };

  const updateRating = async (rating: number) => {
    if (!movie) {
      return;
    }
    await mutateAsyncUpdateRating({ id: movie.id, rating: rating + 1 });
    setIsOpen(false);
  };

  const removeMovie = async () => {
    if (!movie) {
      return;
    }
    await mutateAsyncRemoveMovie({ id: movie.id });
    setIsOpen(false);
  };

  if (isOpen && !movie) {
    return null;
  }

  const rating = movie?.rating ?? 0;

  const cast = movie?.movie_credits.filter((r) => r.role === "cast") ?? [];
  const crew = movie?.movie_credits.filter((r) => r.role === "crew") ?? [];

  return (
    <div
      className={classNames({
        "fixed inset-0 w-full h-screen z-10 backdrop-blur-sm": isOpen,
      })}
      onClick={() => setIsOpen(false)}
    >
      <dialog
        open={isOpen}
        className=" relative mx-auto my-10 p-4 rounded-md border-solid border-black border-2 max-w-lg max-h-96 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {movie && (
          <div className="space-y-2">
            <div className="flex">
              <h1 className="text-lg underline">{movie.title}</h1>

              <button
                className="border-solid border-2 border-black px-2 bg-gray-200 rounded-md ml-auto"
                onClick={() => setIsOpen(false)}
              >
                X
              </button>
            </div>
            <p className="text-sm">{movie.description}</p>

            <Stars rating={rating} handleClick={updateRating} />
            <div className="flex space-x-2 pb-4">
              <button
                className="border-solid border-2 border-black px-2 bg-red-200 rounded-md"
                onClick={removeMovie}
              >
                Remove movie
              </button>
              <button
                className="border-solid border-2 border-black px-2 bg-green-200 rounded-md"
                onClick={toggleWatched}
              >
                {movie.watched ? "Mark as unwatched" : "Mark as watched"}
              </button>
            </div>
            <div className="text-sm space-y-2">
              <div>
                <p>
                  <span className="font-bold">Produced by: </span>
                  {movie.production}
                </p>
              </div>

              {movie.movie_providers.length > 0 && (
                <div>
                  <p className="font-bold">Providers</p>
                  <ul className="font-extralight text-xs">
                    {movie.movie_providers.map((provider) => (
                      <li key={provider.provider_name}>
                        {provider.provider_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cast.length > 0 && (
                <div>
                  <p className="font-bold">Cast</p>
                  <ul className="font-extralight text-xs">
                    {movie.movie_credits
                      .filter((r) => r.role === "cast")
                      .map((actor) => (
                        <li key={actor.name}>{actor.name}</li>
                      ))}
                  </ul>
                </div>
              )}
              {crew.length > 0 && (
                <div>
                  <p className="font-bold">Crew</p>
                  <ul className="font-extralight text-xs">
                    {movie.movie_credits
                      .filter((r) => r.role === "crew")
                      .map((actor) => (
                        <li key={actor.name}>{actor.name}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
};
