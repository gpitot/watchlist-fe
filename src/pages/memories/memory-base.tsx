import { supabase } from "api/database";
import { usePushNotifications } from "hooks/usePushNotifications";
import { AddMemory } from "pages/memories/add-memory";
import { useUserContext } from "providers/user_provider";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const MemoryBase: React.FC = () => {
  const { error, subscription, loading: subLoading } = usePushNotifications();
  const { isLoggedIn, loading } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn && !loading) {
      navigate("/login");
    }
  }, [isLoggedIn, loading]);

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
      <div>Loading: {subLoading}</div>
      {subscription && <div>{`${JSON.stringify(subscription.toJSON())}`}</div>}
      {error && <div>{error}</div>}
      <button
        onClick={pushNotifications}
        className="border-2 p-4 m-4 border-gray-600 bg-red-700"
      >
        Push!
      </button>
    </article>
  );
};
