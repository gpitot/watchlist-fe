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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className={classNames(
          "relative w-full sm:max-w-lg max-h-[85vh] flex flex-col",
          "bg-slate-900 border border-white/10 rounded-t-2xl sm:rounded-2xl",
          "shadow-2xl shadow-purple-500/10",
          "transform transition-transform duration-200",
          {
            "translate-y-0": isOpen,
            "translate-y-full sm:translate-y-4": !isOpen,
          }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900 border-b border-white/10">
          <div className="flex-1 min-w-0 pr-4">
            {trailer ? (
              <a
                href={trailer}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
              >
                <h2 className="text-lg font-semibold truncate">
                  {movie.title}
                </h2>
                <svg
                  className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100"
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
              <h2 className="text-lg font-semibold text-white truncate">
                {movie.title}
              </h2>
            )}
          </div>

          <button
            onClick={onModalClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
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

        <div className="flex-1 overflow-y-scroll p-4 space-y-4">
          <p className="text-white/70 text-sm leading-relaxed">
            {movie.description}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm">Your rating:</span>
            <Stars rating={rating} handleClick={updateRating} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {movie.production && (
              <div className="space-y-1">
                <p className="text-white/40 text-xs uppercase tracking-wider">
                  Production
                </p>
                <p className="text-white/80">{movie.production}</p>
              </div>
            )}

            {providers.length > 0 && (
              <div className="space-y-1">
                <p className="text-white/40 text-xs uppercase tracking-wider">
                  Available on
                </p>
                <div className="flex flex-wrap gap-1">
                  {providers.map((provider) => (
                    <span
                      key={provider.provider_name}
                      className="inline-block px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30"
                    >
                      {provider.provider_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(cast.length > 0 || crew.length > 0) && (
            <div className="pt-2 border-t border-white/10 space-y-3">
              {cast.length > 0 && (
                <div className="space-y-1">
                  <p className="text-white/40 text-xs uppercase tracking-wider">
                    Cast
                  </p>
                  <p className="text-white/70 text-sm">
                    {cast.map((actor) => actor.name).join(", ")}
                  </p>
                </div>
              )}
              {crew.length > 0 && (
                <div className="space-y-1">
                  <p className="text-white/40 text-xs uppercase tracking-wider">
                    Crew
                  </p>
                  <p className="text-white/70 text-sm">
                    {crew.map((member) => member.name).join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isSharing && (
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={removeMovie}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-colors text-sm font-medium"
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
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-medium",
                  movie.watched
                    ? "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10 hover:border-white/20"
                    : "bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 border-green-500/20 hover:border-green-500/30"
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
