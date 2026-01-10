import { supabase } from "api/database";
import { useMutation, useQuery, useQueryClient } from "react-query";

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export const useGetNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ["notifications", userId],
    enabled: userId !== undefined,
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .match({ user_id: userId })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(error.message);
      }

      return data as Notification[];
    },
  });
};

export const useGetUnreadCount = (userId?: string) => {
  return useQuery({
    queryKey: ["notifications-unread-count", userId],
    enabled: userId !== undefined,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .match({ user_id: userId, read: false });

      if (error) {
        throw new Error(error.message);
      }

      return count ?? 0;
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .match({ id, user_id: user.id });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries("notifications");
      queryClient.invalidateQueries("notifications-unread-count");
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .match({ user_id: user.id, read: false });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries("notifications");
      queryClient.invalidateQueries("notifications-unread-count");
    },
  });
};
