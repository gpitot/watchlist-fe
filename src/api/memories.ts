import { supabase } from "api/database";
import { useMutation } from "react-query";

export const useAddMemory = () => {
  return useMutation(
    async ({
      memory,
      answer,
    }: {
      memory: string;
      answer: string;
    }): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }
      const { error } = await supabase
        .from("user_memories")
        .insert({ memory, answer, user_id: user.id });
      if (error) {
        throw error;
      }
    }
  );
};

export const useSubscribeToPush = () => {
  // return useMutation(
  //   async ({ subscription }: { subscription: PushSubscription }) => {
  //     const { error } = await supabase.from("user_push_subscriptions").insert({
  //       endpoint: subscription.endpoint,
  //       p256dh: subscription.keys.p256dh,
  //       auth: subscription.keys.auth,
  //     });
  //     if (error) {
  //       throw error;
  //     }
  //   }
  // );
};
