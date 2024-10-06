import {
  MovieDetailsResponse,
  useRemoveMovie,
  useToggleWatched,
  useUpdateRating,
} from "api/movies";
import classNames from "classnames";
import { Stars } from "components/stars";
import { useShareWatchlist } from "hooks/useShareWatchlist";

export const MovieModal: React.FC<{
  movie?: MovieDetailsResponse;
  isOpen: boolean;
  onModalClose: () => void;
}> = ({ movie, isOpen, onModalClose }) => {
  const { isSharing } = useShareWatchlist();
  const { mutateAsync: mutateAsyncToggleWatched } = useToggleWatched();
  const { mutateAsync: mutateAsyncUpdateRating } = useUpdateRating();
  const { mutateAsync: mutateAsyncRemoveMovie } = useRemoveMovie();

  const toggleWatched = async () => {
    if (!movie) {
      return;
    }
    await mutateAsyncToggleWatched(movie);
    onModalClose();
  };

  const updateRating = async (rating: number) => {
    if (!movie) {
      return;
    }
    await mutateAsyncUpdateRating({ id: movie.id, rating: rating + 1 });
    onModalClose();
  };

  const removeMovie = async () => {
    if (!movie) {
      return;
    }
    await mutateAsyncRemoveMovie({ id: movie.id });
    onModalClose();
  };

  if (!movie) {
    return null;
  }

  const rating = movie?.rating ?? 0;

  const cast = movie?.movie_credits.filter((r) => r.role === "cast") ?? [];
  const crew = movie?.movie_credits.filter((r) => r.role === "crew") ?? [];

  const providers =
    movie?.movie_providers.filter((p) => p.provider_type === "free") ?? [];

  return (
    <div
      className={classNames({
        "fixed inset-0 w-full h-screen z-10 backdrop-blur-sm": isOpen,
      })}
      onClick={onModalClose}
    >
      <dialog
        open={isOpen}
        className={`
          md:relative
          md:my-10
          
          fixed 
          mx-auto 
          bottom-0 
          p-4 
          rounded-md 
          border-solid 
          border-black 
          border-2 
          max-w-lg h-4/5
          overflow-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {movie && (
          <div className="space-y-2">
            <div className="flex">
              <h1 className="text-lg underline">{movie.title}</h1>

              <button
                className="border-solid border-2 border-black px-2 bg-gray-200 rounded-md ml-auto"
                onClick={onModalClose}
              >
                X
              </button>
            </div>
            <p className="text-sm">{movie.description}</p>

            <Stars rating={rating} handleClick={updateRating} />

            <div className="text-sm space-y-2">
              <div>
                <p className="font-bold">Produced by</p>
                <ul className="font-extralight text-xs">
                  <li>{movie.production}</li>
                </ul>
              </div>

              {providers.length > 0 && (
                <div>
                  <p className="font-bold">Providers</p>
                  <ul className="font-extralight text-xs">
                    {providers.map((provider) => (
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

            {!isSharing && (
              <div className="flex space-x-4 py-4 w-full">
                <button
                  className="border-solid border-2 border-black p-2 bg-red-200 rounded-md flex-grow"
                  onClick={removeMovie}
                >
                  Remove movie
                </button>
                <button
                  className="border-solid border-2 border-black p-2 bg-green-200 rounded-md flex-grow"
                  onClick={toggleWatched}
                >
                  {movie.watched ? "Mark as unwatched" : "Mark as watched"}
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
};
