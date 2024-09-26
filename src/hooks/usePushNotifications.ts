import { useSubscribeToPush } from "api/memories";
import { useState } from "react";

export const usePushNotifications = () => {
  const { mutate } = useSubscribeToPush();
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [error, setError] = useState<boolean>(false);
  const [registered, setRegistered] = useState<boolean>(false);

  if (!("serviceWorker" in navigator)) {
    console.log("Service workers are not supported");
    return { subscription };
  }

  if (!registered) {
    navigator.serviceWorker
      .register("./sw.js", {
        scope: "/",
        type: "module",
      })
      .catch((err) => console.error("Service worker registration failed", err))
      .finally(() => setRegistered(true));
  }

  if (!subscription && !error) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((subscription) => {
        setSubscription(subscription);

        if (subscription === null) {
          reg.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey:
                "BGbQfx_iQmO8VrcKNRTUw2blDHGflF_g3S0qjQZtM021eUlHj-GhQsSbqwbit8tF2hy7fi1Gfmq0j5TpRiCF7Zo",
            })
            .then((sub) => {
              setSubscription(sub);
              mutate({ subscription: sub.toJSON() });
            })
            .catch((err) => {
              console.log("error subscribing ", err);
              setError(true);
            });
        }
      });
    });
  }

  return { subscription };
};
