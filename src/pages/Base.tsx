import { Outlet } from "react-router-dom";

export const Base: React.FC = () => {
  return (
    <article>
      <Outlet />
    </article>
  );
};
