import { AddMemory } from "pages/memories/add-memory";
import { Outlet } from "react-router-dom";

const substuff = async () => {
  console.log("[g] substart");

  if ("serviceWorker" in navigator) {
    // Register a service worker hosted at the root of the
    // site using the default scope.
    navigator.serviceWorker
      .register("./sw.js", {
        scope: "/",
        type: "module",
      })
      .then(
        (registration) => {
          console.log("Service worker registration succeeded:", registration);
        },
        (error) => {
          console.error(`Service worker registration failed: ${error}`);
        }
      );
  } else {
    console.error("Service workers are not supported.");
  }

  navigator.serviceWorker.ready.then((reg) => {
    console.log("[g] serviceWorker ready");
    reg.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BGbQfx_iQmO8VrcKNRTUw2blDHGflF_g3S0qjQZtM021eUlHj-GhQsSbqwbit8tF2hy7fi1Gfmq0j5TpRiCF7Zo",
      })
      .then((sub) => {
        console.log("[g] sub ", sub);

        reg.pushManager.getSubscription().then((subscription) => {
          console.log("[g] subscription ", subscription);
        });
      })
      .catch((err) => {
        console.log("error subscribing ", err);
      });
  });
};
substuff();
export const MemoryBase: React.FC = () => {
  return (
    <article>
      <Outlet />

      <AddMemory />
    </article>
  );
};
