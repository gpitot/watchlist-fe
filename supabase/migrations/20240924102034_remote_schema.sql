create policy "Enable delete for users based on user_id"
on "public"."user_providers"
as permissive
for delete
to public
using ((auth.uid() = id));


create policy "Enable insert for authenticated users only"
on "public"."user_providers"
as permissive
for insert
to authenticated
with check ((auth.uid() = id));


create policy "Enable read access for own data"
on "public"."user_providers"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "User Providers Update"
on "public"."user_providers"
as permissive
for update
to authenticated
using ((auth.uid() = id));



