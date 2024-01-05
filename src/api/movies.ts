import { supabase } from "api/database";
import { useQuery } from "react-query";

export type MovieDetailsResponse = {
  id: number;
  title: string;
  created_at: string;
  description: string | null;
  release_date?: string | null;
  production?: string | null;
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
        .match({ user_id: userId });

      if (error) {
        throw new Error(error.message);
      }
      return { movies: data };
    },
  });
};
