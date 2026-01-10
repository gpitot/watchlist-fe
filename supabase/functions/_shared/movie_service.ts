import type { Database } from "./database.types.ts";

type MovieDetails = {
  name?: string; // for tv shows
  title: string;
  overview: string;
  release_date?: string;
  production_companies?: { name: string }[];
  genres: { name: string }[];
  credits: {
    cast: { name: string }[];
    crew: { name: string }[];
  };
  "watch/providers": {
    results?: {
      AU?: {
        ads: { provider_name: string }[];
        flatrate: { provider_name: string }[];
        rent: { provider_name: string }[];
        buy: { provider_name: string }[];
      };
    };
  };
};

type Video = {
  site?: string;
  type?: string;
  key?: string;
  published_at?: string;
};

export type MovieDetailsResponse = {
  id: number;
  title: string;
  description: string;
  release: Date | undefined;
  production?: string;
  genres: string[];
  credits: {
    cast: string[];
    crew: string[];
  };
  providers: { name: string; type: "free" | "rent" | "buy" }[];
};

export const isMedium = (medium: string): medium is Medium => {
  return medium === "movie" || medium === "tv";
};
export type Medium = "movie" | "tv";
export type TimeWindow = "day" | "week";
export class MovieAndShowService {
  private AUTH_TOKEN: string;

  constructor() {
    this.AUTH_TOKEN = `Bearer ${Deno.env.get("MOVIE_DB_TOKEN")}`;
  }

  private async myfetch<T>(url: string): Promise<T> {
    const options = {
      headers: {
        Authorization: this.AUTH_TOKEN,
        accept: "application/json",
      },
    };
    const res = await fetch(`https://api.themoviedb.org/3/${url}`, options);
    const json = await res.json();
    return json as T;
  }

  private parseCreditsResult(credits: MovieDetails["credits"]) {
    return {
      cast: credits.cast.slice(0, 5).map((item) => item.name),
      crew: credits.crew.slice(0, 5).map((item) => item.name),
    };
  }

  public parseStreamingProvidersResult(
    res: MovieDetails["watch/providers"]
  ): MovieDetailsResponse["providers"] {
    if (!res.results || !res.results.AU) {
      return [];
    }
    const auResults = res.results.AU;

    const freeProviders = [
      ...(auResults.flatrate ?? []),
      ...(auResults.ads ?? []),
    ];

    return [
      ...freeProviders.map((i) => {
        return {
          name: i.provider_name,
          type: "free" as const,
        };
      }),
      ...(auResults.rent ?? []).map((i) => {
        return {
          name: i.provider_name,
          type: "rent" as const,
        };
      }),
      ...(auResults.buy ?? []).map((i) => {
        return {
          name: i.provider_name,
          type: "buy" as const,
        };
      }),
    ];
  }

  public async getDetails(
    id: number,
    type: Medium
  ): Promise<MovieDetailsResponse> {
    const appended = encodeURI("credits,watch/providers");
    const res = await this.myfetch<MovieDetails>(
      `/${type}/${id}?append_to_response=${appended}&language=en-US`
    );
    return {
      id,
      title: res.name ?? res.title,
      description: res.overview,
      release: res.release_date ? new Date(res.release_date) : undefined,
      production: (res.production_companies?.[0] ?? {}).name,
      genres: res.genres.map((g) => g.name),
      credits: this.parseCreditsResult(res.credits),
      providers: this.parseStreamingProvidersResult(res["watch/providers"]),
    };
  }

  public async getProviders(id: number, type: Medium) {
    const res = await this.myfetch<MovieDetails["watch/providers"]>(
      `/${type}/${id}/watch/providers`
    );
    return this.parseStreamingProvidersResult(res);
  }

  public getFullPosterPath(posterPath?: string | null): string | undefined {
    if (!posterPath) {
      return undefined;
    }
    return `https://image.tmdb.org/t/p/w300${posterPath}`;
  }

  public async searchByTitle(
    title: string,
    type: Medium
  ): Promise<
    {
      id: number;
      name: string;
      backdrop_path?: string;
      release_date?: string;
    }[]
  > {
    const movieQuery = encodeURI(title);
    const res = await this.myfetch<{
      total_results: number;
      results: {
        id: number;
        name?: string;
        title: string;
        backdrop_path?: string | null;
        release_date?: string;
      }[];
    }>(`/search/${type}?query=${movieQuery}&language=en-US&page=1`);

    console.log(res.results[0]);
    return res.results.map((r) => {
      return {
        id: r.id,
        name: r.name ?? r.title,
        poster_path: this.getFullPosterPath(r.backdrop_path),
        release_date: r.release_date,
        medium: type,
      };
    });
  }

  public async getTrending(
    type: Medium,
    timeWindow: TimeWindow = "week"
  ): Promise<
    {
      id: number;
      name: string;
      poster_path?: string;
      release_date?: string;
      medium: Medium;
    }[]
  > {
    const res = await this.myfetch<{
      results: {
        id: number;
        name?: string;
        title?: string;
        poster_path?: string | null;
        release_date?: string;
        first_air_date?: string;
      }[];
    }>(`/trending/${type}/${timeWindow}`);

    return res.results.map((r) => {
      return {
        id: r.id,
        name: r.name ?? r.title ?? "",
        poster_path: this.getFullPosterPath(r.poster_path),
        release_date: r.release_date ?? r.first_air_date,
        medium: type,
      };
    });
  }

  public async getVideos(id: number, type: Medium) {
    const res = await this.myfetch<{ results: Video[] }>(
      `/${type}/${id}/videos`
    );
    return res.results;
  }

  public parseVideos(videos: Video[]): DBVideo[] {
    const createUrl = (video: Video) => {
      if (video.site === "YouTube") {
        return `https://www.youtube.com/watch?v=${video.key}`;
      }
      return undefined;
    };

    return videos
      .map((v) => ({
        published_at: v.published_at!,
        url: createUrl(v),
        video_type: v.type ?? null,
      }))
      .filter((v): v is DBVideo => Boolean(v.published_at && v.url));
  }
}

type DBVideo = Omit<
  Database["public"]["Tables"]["movie_videos"]["Row"],
  "created_at" | "id" | "movie_id"
>;
