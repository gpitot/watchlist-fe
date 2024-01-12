drop policy "Enable update for users based on user_id" on "public"."movies";

create policy "Enable delete for users based on user_id"
on "public"."movies_users"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Enable read access for all users"
on "public"."movies_users"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on email"
on "public"."movies_users"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Insert for current user"
on "public"."movies_users"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Enable update for users based on user_id"
on "public"."movies"
as permissive
for update
to authenticated
using (true)
with check ((auth.uid() = user_id));



