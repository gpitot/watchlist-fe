create table "public"."movies_users" (
    "movie_id" bigint not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "rating" smallint,
    "watched" boolean,
    "notes" text
);


alter table "public"."movies_users" enable row level security;

CREATE UNIQUE INDEX movies_users_pkey ON public.movies_users USING btree (movie_id, user_id);

alter table "public"."movies_users" add constraint "movies_users_pkey" PRIMARY KEY using index "movies_users_pkey";

alter table "public"."movies_users" add constraint "movies_users_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES movies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."movies_users" validate constraint "movies_users_movie_id_fkey";

alter table "public"."movies_users" add constraint "movies_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."movies_users" validate constraint "movies_users_user_id_fkey";

grant delete on table "public"."movies_users" to "anon";

grant insert on table "public"."movies_users" to "anon";

grant references on table "public"."movies_users" to "anon";

grant select on table "public"."movies_users" to "anon";

grant trigger on table "public"."movies_users" to "anon";

grant truncate on table "public"."movies_users" to "anon";

grant update on table "public"."movies_users" to "anon";

grant delete on table "public"."movies_users" to "authenticated";

grant insert on table "public"."movies_users" to "authenticated";

grant references on table "public"."movies_users" to "authenticated";

grant select on table "public"."movies_users" to "authenticated";

grant trigger on table "public"."movies_users" to "authenticated";

grant truncate on table "public"."movies_users" to "authenticated";

grant update on table "public"."movies_users" to "authenticated";

grant delete on table "public"."movies_users" to "service_role";

grant insert on table "public"."movies_users" to "service_role";

grant references on table "public"."movies_users" to "service_role";

grant select on table "public"."movies_users" to "service_role";

grant trigger on table "public"."movies_users" to "service_role";

grant truncate on table "public"."movies_users" to "service_role";

grant update on table "public"."movies_users" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."movies"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Enable update for users based on user_id"
on "public"."movies"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



