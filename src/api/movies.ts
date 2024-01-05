import { supabase } from "api/database";
import { useMutation, useQuery, useQueryClient } from "react-query";

export type MovieDetailsResponse = {
  id: number;
  title: string;
  created_at: string;
  description: string | null;
  release_date?: string | null;
  production?: string | null;
  watched: boolean;
  rating: number | null;
  movies_genres: {
    genre: string | null;
  }[];
  movie_credits: {
    name: string | null;
    role: string | null;
  }[];
  movie_providers: {
    provider_name: string | null;
    provider_type: string;
  }[];
};

export const useGetMovies = (userId?: string) => {
  return useQuery({
    queryKey: ["movies"],
    enabled: userId !== undefined,
    queryFn: async (): Promise<{ movies: MovieDetailsResponse[] }> => {
      const { data, error } = await supabase
        .from("movies")
        .select(
          "*, movie_credits(name, role), movies_genres(genre), movie_providers(provider_name, provider_type)"
        )
        .match({ user_id: userId })
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return { movies: data };
    },
  });
};

export const useToggleWatched = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, watched }: { id: number; watched: boolean }) => {
      await supabase
        .from("movies")
        .update({
          watched: !watched,
          rating: !watched === false ? null : undefined,
        })
        .eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("movies");
    },
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rating }: { id: number; rating: number }) => {
      await supabase
        .from("movies")
        .update({
          rating,
          watched: true,
        })
        .eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("movies");
    },
  });
};

export const useRemoveMovie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await supabase.from("movies").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("movies");
    },
  });
};
