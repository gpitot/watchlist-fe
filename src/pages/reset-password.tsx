import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import React from "react";
import { supabase } from "api/database";

export const ResetPasswordPage: React.FC = () => {
  console.log("hostname ", window.location.hostname);
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
