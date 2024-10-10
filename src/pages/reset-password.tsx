import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { supabase } from "api/database";
import { useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    return null;
  }

  return (
    <div className="p-4 ">
      <Auth.UpdatePassword
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          className: {
            button: "text-black border-black ",
          },
        }}
      />
    </div>
  );
};
