import { useUserContext } from "providers/user_provider";
import { Link, Outlet } from "react-router-dom";

export const Base: React.FC = () => {
  const { user, isLoggedIn } = useUserContext();

  const copyShareLink = async () => {
    if (!user) {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/share/${user.id}`
      );
      alert("Copied to clipboard!");
    } catch (e) {
      alert("Could not copy to clipboard.");
    }
  };

  return (
    <article>
      <header className="p-4 py-8  bg-green-800 text-white  flex justify-between align-middle">
        <Link to="/">
          <h1 className="text-2xl">Movie watchlist</h1>
        </Link>

        {isLoggedIn && (
          <button className="text-md underline" onClick={copyShareLink}>
            Share your watchlist
          </button>
        )}
      </header>
      <Outlet />
    </article>
  );
};
