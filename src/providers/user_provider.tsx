import { Session, User } from "@supabase/supabase-js";
import { supabase } from "api/database";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type UserContext =
  | {
      user: User;
      isLoggedIn: true;
      isAnonymous: boolean;
      loading: boolean;
    }
  | {
      isLoggedIn: false;
      isAnonymous: false;
      loading: boolean;
      user?: undefined;
    };

const UserContext = createContext<UserContext | undefined>(undefined);

export const UserProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: UserContext = session?.user
    ? {
        user: session.user,
        isLoggedIn: true,
        isAnonymous: session.user.is_anonymous ?? false,
        loading,
      }
    : {
        isLoggedIn: false,
        isAnonymous: false,
        loading,
      };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const data = useContext(UserContext);
  if (data === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return data;
};
