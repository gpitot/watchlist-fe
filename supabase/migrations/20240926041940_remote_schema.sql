alter table "public"."user_push_subscriptions" drop constraint "user_push_subscriptions_pkey";

drop index if exists "public"."user_push_subscriptions_pkey";

CREATE UNIQUE INDEX user_push_subscriptions_pkey ON public.user_push_subscriptions USING btree (user_id, endpoint);

alter table "public"."user_push_subscriptions" add constraint "user_push_subscriptions_pkey" PRIMARY KEY using index "user_push_subscriptions_pkey";

create policy "Enable insert for authenticated users only"
on "public"."user_push_subscriptions"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));



