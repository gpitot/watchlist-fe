import { LoginPage } from "pages/login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Homepage } from "pages/homepage";
import { AuthenticatedRoute } from "components/authenticated_route";
import { ResetPasswordPage } from "pages/reset-password";

const router = createBrowserRouter([
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
    element: <LoginPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
