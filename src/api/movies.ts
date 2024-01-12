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
    provider_name: string;
    provider_type: string;
  }[];
};

export const useGetMovies = (userId?: string) => {
  return useQuery({
    queryKey: ["movies"],
    enabled: userId !== undefined,
    queryFn: async (): Promise<{ movies: MovieDetailsResponse[] }> => {
      const { data, error } = await supabase
        .from("movies_users")
        .select(
          `
          watched, rating,
          movies(
            *,
            movie_credits(name, role), 
            movies_genres(genre), 
            movie_providers(provider_name, provider_type)
          )
          `
        )
        .match({ user_id: userId })
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const movies: MovieDetailsResponse[] = data.map((movie) => {
        if (movie.movies === null) {
          throw new Error("Movie not found");
        }
        return {
          ...movie,
          ...movie.movies,
        };
      });

      return {
        movies,
      };
    },
  });
};

export const useToggleWatched = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, watched }: { id: number; watched: boolean }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }
      await supabase
        .from("movies_users")
        .update({
          watched: !watched,
          rating: !watched === false ? null : undefined,
        })
        .match({ movie_id: id, user_id: user.id });
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }
      await supabase
        .from("movies_users")
        .update({
          rating,
          watched: true,
        })
        .match({ user_id: user.id, movie_id: id });
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }
      await supabase
        .from("movies_users")
        .delete()
        .match({ movie_id: id, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("movies");
    },
  });
};
