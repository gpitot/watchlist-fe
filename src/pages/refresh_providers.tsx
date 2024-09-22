import { useRefreshProviders } from "api/movies";

export const RefreshProviders: React.FC = () => {
  const { mutate, isLoading, isError } = useRefreshProviders();

  const handleClick = () => {
    mutate();
  };

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error</h1>;

  return (
    <div className="p-4">
      <button
        onClick={handleClick}
        className="border-2 py-2 px-4 cursor-pointer border-gray"
      >
        Refresh
      </button>
    </div>
  );
};
