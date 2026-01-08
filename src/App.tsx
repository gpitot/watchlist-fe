import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "providers/user_provider";
import { ThemeProvider } from "providers/theme_provider";
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
    <ThemeProvider>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <Router />
        </QueryClientProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
