create policy "Auth select"
on "public"."movie_videos"
as permissive
for select
to authenticated
using (true);



