import { LoginPage } from "pages/login";
import { Base } from "pages/Base";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Homepage } from "pages/homepage";
import { MemoryBase } from "pages/memories/memory-base";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Base />,
  },
  {
    path: "/watchlist",
    element: <Homepage />,
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
    path: "/memories",
    element: <MemoryBase />,
    children: [],
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
