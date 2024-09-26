import { usePushNotifications } from "hooks/usePushNotifications";
import { AddMemory } from "pages/memories/add-memory";
import { Outlet } from "react-router-dom";

export const MemoryBase: React.FC = () => {
  const { subscription } = usePushNotifications();
  console.log("[g] subscription ", subscription);
  return (
    <article>
      <Outlet />

      <AddMemory />
    </article>
  );
};
