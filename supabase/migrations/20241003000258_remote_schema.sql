create extension if not exists "pg_cron" with schema "extensions";


create or replace view "public"."available_streams" as  SELECT users.email,
    movies.title,
    movie_providers.provider_name,
    movie_providers.provider_type,
    movie_providers.created_at
   FROM (((auth.users
     LEFT JOIN movies_users ON ((users.id = movies_users.user_id)))
     LEFT JOIN movies ON ((movies.id = movies_users.movie_id)))
     LEFT JOIN movie_providers ON ((movie_providers.movie_id = movies.id)))
  WHERE ((movie_providers.provider_name)::text IN ( SELECT user_providers.provider_name
           FROM user_providers
          WHERE (user_providers.id = users.id)));


create policy "Enable read access for authd users"
on "public"."user_memories"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));



