import { corsHeaders } from "../_shared/cors.ts";
import { Database } from "../_shared/database.types.ts";
import { createClient } from "supabase";

// Minimum rating to consider a movie as "liked" by the user
const MIN_RATING_THRESHOLD = 4;

// Maximum number of recommendations to generate per user
const MAX_RECOMMENDATIONS = 20;

// Types for our recommendation engine
type PersonWeight = {
  name: string;
  weight: number;
  avgRating: number;
  appearances: number;
};

type MovieCandidate = {
  movieId: number;
  score: number;
  matches: {
    cast: string[];
    crew: string[];
    production: boolean;
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;

    // Check if this is a service role call with a specific user ID
    const scheduledUserId = req.headers.get("x-user-id");

    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    let userId: string;

    if (scheduledUserId) {
      // Called by service role with specific user ID (scheduled job)
      userId = scheduledUserId;
      console.log(`Scheduled generation for user: ${userId}`);
    } else {
      // Called by authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders,
        });
      }

      userId = user.id;
      console.log(`User-initiated generation for: ${userId}`);
    }

    console.log(`Generating recommendations for user: ${userId}`);

    // Step 1: Get all movies the user has watched with high ratings
    const { data: likedMovies, error: likedMoviesError } = await supabase
      .from("movies_users")
      .select(
        `
        movie_id,
        rating,
        movies (
          id,
          production,
          movie_credits (name, role)
        )
      `
      )
      .eq("user_id", userId)
      .eq("watched", true)
      .gte("rating", MIN_RATING_THRESHOLD);

    if (likedMoviesError) {
      throw new Error(`Error fetching liked movies: ${likedMoviesError.message}`);
    }

    if (!likedMovies || likedMovies.length === 0) {
      console.log("No liked movies found for user");
      return new Response(
        JSON.stringify({ message: "No liked movies found", recommendations: 0 }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${likedMovies.length} liked movies`);

    // Step 2: Extract and weight cast, crew, and production companies
    const castWeights = new Map<string, PersonWeight>();
    const crewWeights = new Map<string, PersonWeight>();
    const productionWeights = new Map<string, PersonWeight>();
    const likedMovieIds = new Set<number>();

    for (const movie of likedMovies) {
      if (!movie.movies) continue;

      likedMovieIds.add(movie.movie_id);
      const rating = movie.rating ?? MIN_RATING_THRESHOLD;

      // Process cast
      const cast = movie.movies.movie_credits.filter((c) => c.role === "cast");
      for (const person of cast) {
        const existing = castWeights.get(person.name);
        if (existing) {
          existing.appearances += 1;
          existing.avgRating = (existing.avgRating * (existing.appearances - 1) + rating) / existing.appearances;
          existing.weight = existing.appearances * existing.avgRating;
        } else {
          castWeights.set(person.name, {
            name: person.name,
            appearances: 1,
            avgRating: rating,
            weight: rating,
          });
        }
      }

      // Process crew
      const crew = movie.movies.movie_credits.filter((c) => c.role === "crew");
      for (const person of crew) {
        const existing = crewWeights.get(person.name);
        if (existing) {
          existing.appearances += 1;
          existing.avgRating = (existing.avgRating * (existing.appearances - 1) + rating) / existing.appearances;
          existing.weight = existing.appearances * existing.avgRating;
        } else {
          crewWeights.set(person.name, {
            name: person.name,
            appearances: 1,
            avgRating: rating,
            weight: rating,
          });
        }
      }

      // Process production company
      if (movie.movies.production) {
        const existing = productionWeights.get(movie.movies.production);
        if (existing) {
          existing.appearances += 1;
          existing.avgRating = (existing.avgRating * (existing.appearances - 1) + rating) / existing.appearances;
          existing.weight = existing.appearances * existing.avgRating;
        } else {
          productionWeights.set(movie.movies.production, {
            name: movie.movies.production,
            appearances: 1,
            avgRating: rating,
            weight: rating,
          });
        }
      }
    }

    console.log(`Extracted ${castWeights.size} cast, ${crewWeights.size} crew, ${productionWeights.size} production companies`);

    // Step 3: Find candidate movies based on matching cast/crew/production
    const candidateMovies = new Map<number, MovieCandidate>();

    // Query movies with matching cast
    for (const [name, weight] of castWeights) {
      const { data: matchingMovies } = await supabase
        .from("movie_credits")
        .select("movie_id")
        .eq("name", name)
        .eq("role", "cast");

      if (matchingMovies) {
        for (const { movie_id } of matchingMovies) {
          // Skip movies the user already has
          if (likedMovieIds.has(movie_id)) continue;

          const existing = candidateMovies.get(movie_id);
          if (existing) {
            existing.score += weight.weight;
            existing.matches.cast.push(name);
          } else {
            candidateMovies.set(movie_id, {
              movieId: movie_id,
              score: weight.weight,
              matches: {
                cast: [name],
                crew: [],
                production: false,
              },
            });
          }
        }
      }
    }

    // Query movies with matching crew
    for (const [name, weight] of crewWeights) {
      const { data: matchingMovies } = await supabase
        .from("movie_credits")
        .select("movie_id")
        .eq("name", name)
        .eq("role", "crew");

      if (matchingMovies) {
        for (const { movie_id } of matchingMovies) {
          if (likedMovieIds.has(movie_id)) continue;

          const existing = candidateMovies.get(movie_id);
          if (existing) {
            existing.score += weight.weight;
            existing.matches.crew.push(name);
          } else {
            candidateMovies.set(movie_id, {
              movieId: movie_id,
              score: weight.weight,
              matches: {
                cast: [],
                crew: [name],
                production: false,
              },
            });
          }
        }
      }
    }

    // Query movies with matching production companies
    for (const [name, weight] of productionWeights) {
      const { data: matchingMovies } = await supabase
        .from("movies")
        .select("id")
        .eq("production", name);

      if (matchingMovies) {
        for (const { id: movie_id } of matchingMovies) {
          if (likedMovieIds.has(movie_id)) continue;

          const existing = candidateMovies.get(movie_id);
          if (existing) {
            existing.score += weight.weight * 1.5; // Give production company matches a bit more weight
            existing.matches.production = true;
          } else {
            candidateMovies.set(movie_id, {
              movieId: movie_id,
              score: weight.weight * 1.5,
              matches: {
                cast: [],
                crew: [],
                production: true,
              },
            });
          }
        }
      }
    }

    // Also check if user already has any of these candidates in their watchlist
    const allCandidateIds = Array.from(candidateMovies.keys());
    const { data: existingUserMovies } = await supabase
      .from("movies_users")
      .select("movie_id")
      .eq("user_id", userId)
      .in("movie_id", allCandidateIds);

    if (existingUserMovies) {
      for (const { movie_id } of existingUserMovies) {
        candidateMovies.delete(movie_id);
      }
    }

    console.log(`Found ${candidateMovies.size} candidate movies`);

    // Step 4: Sort by score and take top N
    const topRecommendations = Array.from(candidateMovies.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RECOMMENDATIONS);

    console.log(`Selected top ${topRecommendations.length} recommendations`);

    // Step 5: Store recommendations in the database
    // First, delete old recommendations for this user
    await supabase
      .from("user_recommendations")
      .delete()
      .eq("user_id", userId);

    // Then insert new recommendations
    if (topRecommendations.length > 0) {
      const { error: insertError } = await supabase
        .from("user_recommendations")
        .insert(
          topRecommendations.map((rec) => ({
            user_id: userId,
            movie_id: rec.movieId,
            score: rec.score,
            reason: {
              matching_cast: rec.matches.cast,
              matching_crew: rec.matches.crew,
              matching_production: rec.matches.production,
            },
            generated_at: new Date().toISOString(),
          }))
        );

      if (insertError) {
        throw new Error(`Error inserting recommendations: ${insertError.message}`);
      }
    }

    console.log(`Successfully generated ${topRecommendations.length} recommendations`);

    return new Response(
      JSON.stringify({
        message: "Recommendations generated successfully",
        count: topRecommendations.length,
        recommendations: topRecommendations.map((r) => ({
          movieId: r.movieId,
          score: r.score,
          matches: r.matches,
        })),
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    console.error("Error generating recommendations:", err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
