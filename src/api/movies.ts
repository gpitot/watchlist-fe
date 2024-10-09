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
  medium: string;
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

export const useGetTrailer = (movieId?: number) => {
  return useQuery({
    queryKey: ["movie_videos", movieId],
    enabled: movieId !== undefined,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movie_videos")
        .select("url")
        .match({ movie_id: movieId, video_type: "Trailer" })
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data ? data.url : undefined;
    },
  });
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

export type Stream = {
  id: number;
  name: string;
  medium: string;
  poster_path?: string;
  release_date?: string;
};
export const useSearchStreams = () => {
  return useMutation(async (title: string) => {
    const { data, error } = await supabase.functions.invoke<{
      movies: Stream[];
      tvs: Stream[];
    }>("search-stream", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    if (error) {
      throw error;
    }
    return data;
  });
};

export const useAddMovie = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (body: { id: number; medium: string }): Promise<void> => {
      const { data, error } = await supabase.functions.invoke("add_movie", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (error) {
        throw error;
      }
      return data;
    },
    {
      onSuccess: async () => {
        queryClient.invalidateQueries("movies");
      },
    }
  );
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

export const useRefreshProviders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "refresh_providers",
        {
          method: "POST",
        }
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("movies");
    },
  });
};

export const useGetUserProviders = (userId?: string) => {
  return useQuery({
    queryKey: ["providers", userId],
    enabled: userId !== undefined,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_providers")
        .select(
          `
          provider_name
          `
        )
        .match({ id: userId });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
};

export const useUpdateUserProviders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      providers,
      providersToDelete,
    }: {
      providers: string[];
      providersToDelete: string[];
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }

      if (providersToDelete.length > 0) {
        await supabase
          .from("user_providers")
          .delete()
          .match({ id: user.id, provider_name: providersToDelete });
      }

      await supabase.from("user_providers").upsert(
        providers.map((provider_name) => ({
          id: user.id,
          provider_name,
        }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries("providers");
    },
  });
};
