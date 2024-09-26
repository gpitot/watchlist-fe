create policy "Enable read access for authd users"
on "public"."user_push_subscriptions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "update for authed users"
on "public"."user_push_subscriptions"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));



