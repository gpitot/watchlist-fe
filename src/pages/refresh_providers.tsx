import { useRefreshProviders } from "api/movies";

export const RefreshProviders: React.FC = () => {
  const { mutate, isLoading, isError } = useRefreshProviders();

  const handleClick = () => {
    mutate();
  };

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error</h1>;

  return <button onClick={handleClick}>Refresh</button>;
};
