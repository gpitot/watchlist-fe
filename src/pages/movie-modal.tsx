import {
  MovieDetailsResponse,
  useGetTrailer,
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

  const { data: trailer } = useGetTrailer(movie?.id);

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
      className={classNames(
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center",
        "transition-opacity duration-200",
        {
          "opacity-100 pointer-events-auto": isOpen,
          "opacity-0 pointer-events-none": !isOpen,
        }
      )}
      onClick={onModalClose}
    >
      <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm" />

      <div
        className={classNames(
          "relative w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col",
          "bg-bg-primary border border-border-default rounded-t-3xl sm:rounded-2xl",
          "shadow-2xl shadow-primary-sm",
          "transform transition-transform duration-200",
          {
            "translate-y-0": isOpen,
            "translate-y-full sm:translate-y-4": !isOpen,
          }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-2">
          <div className="w-10 h-1 bg-border-hover rounded-full" />
        </div>

        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 bg-bg-primary border-b border-border-default">
          <div className="flex-1 min-w-0 pr-3">
            {trailer ? (
              <a
                href={trailer}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 text-text-primary active:text-primary-lighter sm:hover:text-primary-lighter transition-colors"
              >
                <h2 className="text-lg sm:text-xl font-semibold truncate">
                  {movie.title}
                </h2>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 opacity-60 group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </a>
            ) : (
              <h2 className="text-lg sm:text-xl font-semibold text-text-primary truncate">
                {movie.title}
              </h2>
            )}
          </div>

          <button
            onClick={onModalClose}
            className="p-2 rounded-full bg-surface active:bg-surface-hover sm:hover:bg-surface-hover text-text-secondary active:text-text-primary sm:hover:text-text-primary transition-colors flex-shrink-0"
          >
            <svg
              className="w-5 h-5"
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
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
          <p className="text-text-secondary text-sm leading-relaxed">
            {movie.description}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-text-tertiary text-sm">Your rating:</span>
            <Stars rating={rating} handleClick={updateRating} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            {movie.production && (
              <div className="space-y-1">
                <p className="text-text-tertiary text-xs uppercase tracking-wider">
                  Production
                </p>
                <p className="text-text-secondary">{movie.production}</p>
              </div>
            )}

            {providers.length > 0 && (
              <div className="space-y-1">
                <p className="text-text-tertiary text-xs uppercase tracking-wider">
                  Available on
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {providers.map((provider) => (
                    <span
                      key={provider.provider_name}
                      className="inline-block px-2.5 py-1 bg-success/20 text-success-lighter text-xs rounded-full border border-success/30"
                    >
                      {provider.provider_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(cast.length > 0 || crew.length > 0) && (
            <div className="pt-2 border-t border-border-default space-y-3">
              {cast.length > 0 && (
                <div className="space-y-1">
                  <p className="text-text-tertiary text-xs uppercase tracking-wider">
                    Cast
                  </p>
                  <p className="text-text-secondary text-sm">
                    {cast.map((actor) => actor.name).join(", ")}
                  </p>
                </div>
              )}
              {crew.length > 0 && (
                <div className="space-y-1">
                  <p className="text-text-tertiary text-xs uppercase tracking-wider">
                    Crew
                  </p>
                  <p className="text-text-secondary text-sm">
                    {crew.map((member) => member.name).join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isSharing && (
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-border-default">
              <button
                onClick={removeMovie}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-error/10 active:bg-error/20 sm:hover:bg-error/20 text-error-light active:text-error-lighter sm:hover:text-error-lighter border border-error/20 active:border-error/30 sm:hover:border-error/30 transition-colors text-sm font-medium active:scale-[0.98]"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove
              </button>
              <button
                onClick={toggleWatched}
                className={classNames(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl border transition-colors text-sm font-medium active:scale-[0.98]",
                  movie.watched
                    ? "bg-surface active:bg-surface-hover sm:hover:bg-surface-hover text-text-secondary active:text-text-primary sm:hover:text-text-primary border-border-default active:border-border-hover sm:hover:border-border-hover"
                    : "bg-success/10 active:bg-success/20 sm:hover:bg-success/20 text-success-light active:text-success-lighter sm:hover:text-success-lighter border-success/20 active:border-success/30 sm:hover:border-success/30"
                )}
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {movie.watched ? "Mark unwatched" : "Mark watched"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
