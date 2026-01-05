import { LoginForm } from "pages/login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Homepage } from "pages/homepage";
import { AuthenticatedRoute } from "components/authenticated_route";

const router = createBrowserRouter([
  {
    path: "/watchlist",
    element: (
      <AuthenticatedRoute>
        <Homepage />
      </AuthenticatedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <AuthenticatedRoute>
        <Homepage />
      </AuthenticatedRoute>
    ),
  },
  {
    path: "/watchlist/share/:userId",
    element: <Homepage />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
