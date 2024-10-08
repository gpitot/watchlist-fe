import { supabase } from "api/database";
import { useMutation, useQuery } from "react-query";

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

export const useGetMemory = (memoryId: number) => {
  return useQuery({
    queryKey: ["memory", memoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_memories")
        .select(
          `
          memory,answer
          `
        )
        .match({ id: memoryId })
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
};

export const useSubscribeToPush = () => {
  return useMutation(
    async ({ subscription }: { subscription: PushSubscriptionJSON }) => {
      if (!subscription.endpoint) {
        throw new Error("Invalid subscription: missing endpoint");
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }
      console.log("[g] saving to db: subscription ", subscription);
      const { error } = await supabase.from("user_push_subscriptions").upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      });
      if (error) {
        throw error;
      }
    }
  );
};
