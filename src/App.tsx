import { QueryClient, QueryClientProvider } from "react-query";
import { Movies } from "./movies";
import { AddMovie } from "./add-movie";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <>
        <AddMovie />
        <Movies />
      </>
    </QueryClientProvider>
  );
}

export default App;
