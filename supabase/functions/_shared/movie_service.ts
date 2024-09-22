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

  public async searchByTitle(
    title: string,
    type: Medium
  ): Promise<{ id: number; name: string } | undefined> {
    const movieQuery = encodeURI(title);
    const res = await this.myfetch<{
      total_results: number;
      results: { id: number; name?: string; title: string }[];
    }>(`/search/${type}?query=${movieQuery}&language=en-US&page=1`);
    if (res.total_results === 0) return undefined;
    console.log(res.results[0]);
    return {
      id: res.results[0].id,
      name: res.results[0].name ?? res.results[0].title,
    };
  }
}
