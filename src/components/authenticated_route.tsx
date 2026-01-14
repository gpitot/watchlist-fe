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
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-lg">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  return children;
};
