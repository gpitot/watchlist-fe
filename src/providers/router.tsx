import { LoginPage } from "pages/login";
import { Base } from "pages/Base";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AddMovie } from "pages/add-movie";
import { Movies } from "pages/movies";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Base />,
    children: [
      {
        path: "/",
        element: (
          <>
            <AddMovie />
            <Movies />
          </>
        ),
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
