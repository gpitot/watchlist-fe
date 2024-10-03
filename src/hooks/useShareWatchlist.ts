import { useLocation } from "react-router-dom";

export const useShareWatchlist = () => {
  const location = useLocation();
  return {
    isSharing: location.pathname.includes("/watchlist/share"),
  };
};
