drop policy "Enable delete for users based on user_id" on "public"."movies";

drop policy "Enable update for users based on user_id" on "public"."movies";

alter table "public"."movies" drop constraint "movies_user_id_fkey";

alter table "public"."movies" drop column "user_id";

alter table "public"."movies_users" alter column "watched" set not null;


