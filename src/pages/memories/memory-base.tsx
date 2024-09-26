import { supabase } from "api/database";
import { usePushNotifications } from "hooks/usePushNotifications";
import { AddMemory } from "pages/memories/add-memory";
import { Outlet } from "react-router-dom";

export const MemoryBase: React.FC = () => {
  const { subscription } = usePushNotifications();
  console.log("[g] subscription ", subscription?.toJSON());

  const pushNotifications = async () => {
    const { data, error } = await supabase.functions.invoke(
      "web_push_subscribe",
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );

    console.log(data, error);
  };
  return (
    <article>
      <Outlet />

      <AddMemory />

      <button onClick={pushNotifications}>Push!</button>
    </article>
  );
};
