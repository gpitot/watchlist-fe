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

export const useGetTrending = (timeWindow: "day" | "week" = "week", userId?: string) => {
  return useQuery({
    queryKey: ["trending", timeWindow, userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{
        movies: Stream[];
        tvs: Stream[];
      }>("trending", {
        method: "POST",
        body: JSON.stringify({ timeWindow, userId }),
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
};

export const useAddMovie = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (body: {
      id: number;
      medium: string;
      streamData?: Stream;
    }): Promise<void> => {
      const { data, error } = await supabase.functions.invoke("add_movie", {
        method: "POST",
        body: JSON.stringify({ id: body.id, medium: body.medium }),
      });
      if (error) {
        throw error;
      }
      return data;
    },
    {
      onMutate: async (
        newMovie: { id: number; medium: string; streamData?: Stream }
      ) => {
        // Cancel any outgoing refetches to avoid overwriting our optimistic update
        await queryClient.cancelQueries("movies");

        // Snapshot the previous value
        const previousMovies = queryClient.getQueryData<{
          movies: MovieDetailsResponse[];
        }>("movies");

        // Optimistically update to the new value if we have stream data
        if (newMovie.streamData && previousMovies) {
          const optimisticMovie: MovieDetailsResponse = {
            id: newMovie.streamData.id,
            title: newMovie.streamData.name,
            created_at: new Date().toISOString(),
            description: null,
            release_date: newMovie.streamData.release_date || null,
            production: newMovie.streamData.poster_path || null,
            watched: false,
            rating: null,
            medium: newMovie.streamData.medium,
            movies_genres: [],
            movie_credits: [],
            movie_providers: [],
          };

          queryClient.setQueryData<{ movies: MovieDetailsResponse[] }>(
            "movies",
            {
              movies: [optimisticMovie, ...previousMovies.movies],
            }
          );
        }

        // Return a context object with the snapshotted value
        return { previousMovies };
      },
      onError: (
        _err: unknown,
        _newMovie: { id: number; medium: string; streamData?: Stream },
        context?: { previousMovies?: { movies: MovieDetailsResponse[] } }
      ) => {
        // If the mutation fails, use the context returned from onMutate to roll back
        if (context?.previousMovies) {
          queryClient.setQueryData("movies", context.previousMovies);
        }
      },
      onSettled: () => {
        // Always refetch after error or success to ensure we have the correct server state
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
      providersAdded,
      providersToDelete,
    }: {
      providersAdded: string[];
      providersToDelete: string[];
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not logged in");
      }

      console.log("[g] mutate", providersAdded, providersToDelete);

      if (providersToDelete.length > 0) {
        await supabase
          .from("user_providers")
          .delete()
          .match({ id: user.id, provider_name: providersToDelete });
      }

      if (providersAdded.length > 0) {
        await supabase.from("user_providers").upsert(
          providersAdded.map((provider_name) => ({
            id: user.id,
            provider_name,
          }))
        );
      }
    },
    onMutate: async () => {},
    onError: (_err, _variables) => {},
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries("providers");
    },
  });
};

export const useGetAllAvailableProviders = () => {
  return useQuery({
    queryKey: ["allProviders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movie_providers")
        .select("provider_name")
        .not("provider_name", "is", null);

      if (error) {
        throw new Error(error.message);
      }

      // Get unique provider names and sort them
      const uniqueProviders = Array.from(
        new Set(data.map((p: { provider_name: string }) => p.provider_name))
      ).sort();

      return uniqueProviders;
    },
  });
};
