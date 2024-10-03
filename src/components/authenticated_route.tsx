import { useUserContext } from "providers/user_provider";
import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthenticatedRoute: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { isLoggedIn, loading } = useUserContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/login");
    }
  }, [loading, isLoggedIn]);

  if (loading) {
    return <h1>Loading...</h1>;
  }
  return children;
};
