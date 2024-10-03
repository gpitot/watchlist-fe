import { MultiSelect } from "components/multi_select";
import { AddMovie } from "pages/add-movie";
import { Movies } from "pages/movies";
import { useUserContext } from "providers/user_provider";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useGetMovies,
  useGetUserProviders,
  useUpdateUserProviders,
} from "api/movies";
import { useEffect, useMemo } from "react";
import { Option } from "react-multi-select-component";

export const Homepage: React.FC = () => {
  const { user, isLoggedIn, loading } = useUserContext();
  const { userId } = useParams();

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

  const navigate = useNavigate();

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

    const providersToDelete = previousSelected.filter(
      (p) => !currentSelected.includes(p)
    );

    mutate({ providers: currentSelected, providersToDelete });
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

  useEffect(() => {
    if (!isLoggedIn && !loading) {
      navigate("/login");
    }
  }, [isLoggedIn, loading]);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError || !data) return <h1>Error</h1>;

  return (
    <>
      <header className="p-4 py-8  bg-green-800 text-white  flex justify-between align-middle">
        <Link to="/">
          <h1 className="text-2xl">Watchlist</h1>
        </Link>

        {isLoggedIn && (
          <button className="text-md underline" onClick={copyShareLink}>
            Share your watchlist
          </button>
        )}
      </header>
      <div className="space-y-4">
        <div className="flex flex-col sm:items-center sm:flex-row md:px-4">
          {userId === undefined && <AddMovie />}
          <MultiSelect
            selected={userProviderOptions}
            options={allProviderOptions}
            setSelected={handleSelectProviders}
            label={"Select Providers"}
          />
        </div>

        <Movies
          movies={data.movies}
          availableProviders={userProviderOptions.map((p) => p.value)}
        />
      </div>
    </>
  );
};
