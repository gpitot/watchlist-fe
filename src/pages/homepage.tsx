import { MultiSelect } from "components/multi_select";
import { AddMovie } from "pages/add-movie";
import { Movies } from "pages/movies";
import { useUserContext } from "providers/user_provider";
import { useNavigate, useParams } from "react-router-dom";
import { useGetMovies } from "api/movies";
import { useEffect, useMemo, useState } from "react";
import { Option } from "react-multi-select-component";
import { RefreshProviders } from "pages/refresh_providers";

export const Homepage: React.FC = () => {
  const { user, isLoggedIn, loading } = useUserContext();
  const { userId } = useParams();

  const navigate = useNavigate();

  const { isLoading, isError, data } = useGetMovies(userId ?? user?.id);

  const [selectedProviders, setSelectedProviders] = useState<Option[]>([]);

  const initialProviderOptions = useMemo(() => {
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
    <div className="space-y-4">
      <div className="flex flex-col sm:items-center sm:flex-row">
        {userId === undefined && <AddMovie />}
        <MultiSelect
          selected={selectedProviders}
          options={initialProviderOptions}
          setSelected={setSelectedProviders}
          label={"Select Providers"}
        />
        <RefreshProviders />
      </div>

      <Movies
        movies={data.movies}
        availableProviders={selectedProviders.map((p) => p.value)}
      />
    </div>
  );
};
