create policy "Enable insert for authenticated users only"
on "public"."movies_genres"
as permissive
for insert
to authenticated
with check (true);



