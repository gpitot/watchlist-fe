import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "providers/user_provider";
import { Router } from "providers/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
function App() {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </UserProvider>
  );
}

export default App;
