import { LoginPage } from "pages/login";
import { Base } from "pages/Base";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Homepage } from "pages/homepage";
import { MemoryBase } from "pages/memories/memory-base";
import { ViewMemory } from "pages/memories/view-memory";
import { AuthenticatedRoute } from "components/authenticated_route";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Base />,
  },
  {
    path: "/watchlist",
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
    element: <LoginPage />,
  },

  {
    path: "/memories",
    element: <MemoryBase />,
    children: [
      {
        path: "/memories/:memoryId",
        element: <ViewMemory />,
      },
    ],
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
