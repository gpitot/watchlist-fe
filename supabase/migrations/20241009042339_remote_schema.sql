create table "public"."movie_videos" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "type" text not null,
    "url" text not null,
    "movie_id" bigint not null
);


alter table "public"."movie_videos" enable row level security;

CREATE UNIQUE INDEX movie_videos_pkey ON public.movie_videos USING btree (id);

alter table "public"."movie_videos" add constraint "movie_videos_pkey" PRIMARY KEY using index "movie_videos_pkey";

alter table "public"."movie_videos" add constraint "public_movie_videos_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."movie_videos" validate constraint "public_movie_videos_movie_id_fkey";

grant delete on table "public"."movie_videos" to "anon";

grant insert on table "public"."movie_videos" to "anon";

grant references on table "public"."movie_videos" to "anon";

grant select on table "public"."movie_videos" to "anon";

grant trigger on table "public"."movie_videos" to "anon";

grant truncate on table "public"."movie_videos" to "anon";

grant update on table "public"."movie_videos" to "anon";

grant delete on table "public"."movie_videos" to "authenticated";

grant insert on table "public"."movie_videos" to "authenticated";

grant references on table "public"."movie_videos" to "authenticated";

grant select on table "public"."movie_videos" to "authenticated";

grant trigger on table "public"."movie_videos" to "authenticated";

grant truncate on table "public"."movie_videos" to "authenticated";

grant update on table "public"."movie_videos" to "authenticated";

grant delete on table "public"."movie_videos" to "service_role";

grant insert on table "public"."movie_videos" to "service_role";

grant references on table "public"."movie_videos" to "service_role";

grant select on table "public"."movie_videos" to "service_role";

grant trigger on table "public"."movie_videos" to "service_role";

grant truncate on table "public"."movie_videos" to "service_role";

grant update on table "public"."movie_videos" to "service_role";


