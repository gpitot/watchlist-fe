alter table "public"."movies" add column "movie_db_id" bigint;

alter table "public"."movies" add column "rating" smallint;

alter table "public"."movies" add column "watched" boolean not null default false;


