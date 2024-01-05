alter table "public"."movies" add column "user_id" uuid;

alter table "public"."movies" add constraint "movies_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."movies" validate constraint "movies_user_id_fkey";


