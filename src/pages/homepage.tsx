import { MultiSelect } from "components/multi_select";
import { TrendingSection } from "components/trending_section";
import { AddMovie } from "pages/add-movie";
import { Movies } from "pages/movies";
import { ThemeSwitcher } from "components/theme_switcher";
import { useUserContext } from "providers/user_provider";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useGetMovies,
  useGetUserProviders,
  useUpdateUserProviders,
} from "api/movies";
import { useMemo } from "react";
import { Option } from "components/multi_select";
import { useShareWatchlist } from "hooks/useShareWatchlist";
import { supabase } from "api/database";

export const Homepage: React.FC = () => {
  const { user, isLoggedIn, isAnonymous } = useUserContext();
  const { userId } = useParams();
  const { isSharing } = useShareWatchlist();
  const navigate = useNavigate();

  const copyShareLink = async () => {
    if (!user) {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/watchlist/share/${user.id}`
      );
      alert("Copied to clipboard!");
    } catch (e) {
      alert("Could not copy to clipboard.");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleConvertToPermanent = async () => {
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error converting to permanent account:", error);
      alert("Could not convert account. Please try again.");
    }
  };

  const { isLoading, isError, data } = useGetMovies(userId ?? user?.id);

  const { data: userProviders } = useGetUserProviders(user?.id);
  const { mutate } = useUpdateUserProviders();

  const userProviderOptions = (userProviders ?? []).map(
    ({ provider_name: p }) => ({
      label: p,
      value: p,
    })
  );

  const handleSelectProviders = (selected: Option[]) => {
    const previousSelected = userProviderOptions.map((p) => p.value);
    const currentSelected = selected.map((s) => s.value);

    console.log("[g] previousSelected ", previousSelected, currentSelected);

    const providersToDelete = previousSelected.filter(
      (p) => !currentSelected.includes(p)
    );

    const providersAdded = currentSelected.filter(
      (p) => !previousSelected.includes(p)
    );

    mutate({ providersAdded, providersToDelete });
  };

  const allProviderOptions = useMemo(() => {
    const providerSet = new Set<string>();
    data?.movies.map((m) => {
      const providers: string[] = m.movie_providers
        .filter((p) => p.provider_type === "free" && Boolean(p.provider_name))
        .map((p) => p.provider_name);
      providers.forEach((p) => providerSet.add(p));
    });
    return Array.from(providerSet)
      .sort()
      .map((p) => ({ label: p, value: p }));
  }, [data?.movies]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-lg">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="bg-error/10 border border-error/20 rounded-2xl p-8 text-center">
          <p className="text-error-light text-lg">Something went wrong</p>
          <p className="text-text-tertiary mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  console.log(
    "[g] allProviderOptions ",
    allProviderOptions,
    userProviderOptions
  );

  return (
    <div className="min-h-screen bg-gradient-primary">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg-primary/70 border-b border-border-default">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="group flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-primary shadow-lg group-hover:shadow-primary-lg transition-shadow">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
              <h1 className="text-lg sm:text-xl font-semibold text-text-primary group-hover:text-primary-lighter transition-colors">
                Watchlist
              </h1>
            </Link>

            {isLoggedIn && !isSharing && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ThemeSwitcher />
                <button
                  onClick={copyShareLink}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-surface hover:bg-surface-hover border border-border-default hover:border-border-hover text-text-secondary hover:text-text-primary transition-all text-sm font-medium active:scale-95"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span className="hidden xs:inline">Share</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-surface hover:bg-surface-hover border border-border-default hover:border-border-hover text-text-secondary hover:text-text-primary transition-all text-sm font-medium active:scale-95"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden xs:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {isLoggedIn && isAnonymous && !isSharing && (
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-primary/30">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-primary-lighter"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-text-primary font-medium text-sm sm:text-base">
                    You're using a temporary account
                  </p>
                  <p className="text-text-secondary text-xs sm:text-sm">
                    Save your watchlist permanently by creating an account
                  </p>
                </div>
              </div>
              <button
                onClick={handleConvertToPermanent}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white hover:bg-gray-100 text-slate-800 font-medium transition-all shadow-lg whitespace-nowrap text-sm active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-4 h-4"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.9 0 6.7 1.7 8.2 3.1l6-6C34.9 3 30.9 1.5 24 1.5 14 1.5 6.1 7.9 2.7 16.3l7.3 5.7C11.7 17 17.3 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.7c-.6 3-2.4 5.5-5 7.2l7.3 5.7c4.3-4 7-10 7-16.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.5 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5l-7.3-5.7C1.2 17.5 0 20.6 0 24s1.2 6.5 3.2 10.2l7.3-5.7z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 47c6.5 0 12-2.1 16-5.7l-7.3-5.7c-2.2 1.5-5 2.4-8.7 2.4-6.7 0-12.4-4.5-14.4-10.5l-7.3 5.7C6.1 41.1 14 47 24 47z"
                  />
                </svg>
                <span className="hidden xs:inline">Create Account with Google</span>
                <span className="xs:hidden">Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {isLoggedIn && !isSharing && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-surface backdrop-blur-sm border border-border-default">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <AddMovie />
              </div>
              <div className="lg:w-80">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Streaming Services
                </label>
                <MultiSelect
                  selected={userProviderOptions}
                  options={allProviderOptions}
                  setSelected={handleSelectProviders}
                  label={"Select Providers"}
                />
              </div>
            </div>
          </div>
        )}

        {isSharing && (
          <div className="mb-8 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-primary-lighter text-sm">
              You're viewing a shared watchlist
            </p>
          </div>
        )}

        {isLoggedIn && !isSharing && <TrendingSection />}

        <Movies
          movies={data.movies}
          availableProviders={userProviderOptions.map((p) => p.value)}
        />
      </main>
    </div>
  );
};
