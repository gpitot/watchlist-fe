import { LoginPage } from "pages/login";
import { Base } from "pages/Base";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Homepage } from "pages/homepage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Base />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/share/:userId",
        element: <Homepage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
