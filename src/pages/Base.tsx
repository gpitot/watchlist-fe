import { Link } from "react-router-dom";

export const Base: React.FC = () => {
  return (
    <article>
      <ul className="list-disc p-20 text-xl">
        <li>
          <Link to="/watchlist">Watchlist</Link>
        </li>
        <li>
          <Link to="/memories">Memories</Link>
        </li>
      </ul>
    </article>
  );
};
