import { useSubscribeToPush } from "api/memories";
import { useEffect, useState } from "react";

export const usePushNotifications = (): {
  subscription: PushSubscription | null;
  error: string | undefined;
} => {
  const { mutate } = useSubscribeToPush();
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [error, setError] = useState<string | undefined>();
  const [registered, setRegistered] = useState<boolean>(false);

  useEffect(() => {
    if (subscription) {
      mutate({ subscription: subscription.toJSON() });
    }
  }, [subscription]);

  if (!("serviceWorker" in navigator)) {
    console.log("Service workers are not supported");
    setError("Service workers are not supported");
  }

  if (!registered && !error) {
    navigator.serviceWorker
      .register("./sw.js", {
        scope: "/",
        type: "module",
      })
      .catch((err) => {
        console.log("error registering service worker", err);
        setError("Error registering service worker");
      })
      .finally(() => setRegistered(true));
  }

  if (!subscription && !error) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((subscription) => {
        if (subscription === null) {
          reg.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey:
                "BGbQfx_iQmO8VrcKNRTUw2blDHGflF_g3S0qjQZtM021eUlHj-GhQsSbqwbit8tF2hy7fi1Gfmq0j5TpRiCF7Zo",
            })
            .then((sub) => {
              setSubscription(sub);
            })
            .catch((err) => {
              console.log("error subscribing ", err);
              setError("Error subscribing to push notifications");
            });
        } else {
          setSubscription(subscription);
        }
      });
    });
  }

  return { subscription, error };
};
