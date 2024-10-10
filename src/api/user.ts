import { supabase } from "api/database";
import { useMutation } from "react-query";

export const useUpdateUserPassword = () => {
  return useMutation(async (newPassword: string) => {
    return await supabase.auth.updateUser({
      password: newPassword,
    });
  });
};
