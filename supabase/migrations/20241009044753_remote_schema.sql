alter table "public"."movie_videos" drop column "type";

alter table "public"."movie_videos" add column "published_at" timestamp with time zone not null;


