alter table "public"."movies" drop column "rating";

alter table "public"."movies" drop column "watched";

alter table "public"."movies" alter column "movie_db_id" set not null;

alter table "public"."movies" alter column "user_id" drop not null;


