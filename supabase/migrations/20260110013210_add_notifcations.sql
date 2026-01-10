create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" text not null,
    "title" text not null,
    "message" text not null,
    "link" text,
    "read" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
);

alter table "public"."notifications" enable row level security;

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);

CREATE INDEX notifications_created_at_idx ON public.notifications USING btree (created_at DESC);

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

-- authenticated: read and update only (users view and mark as read)
grant select on table "public"."notifications" to "authenticated";
grant update on table "public"."notifications" to "authenticated";

-- service_role: full access (backend creates notifications)
grant all on table "public"."notifications" to "service_role";

create policy "Users can view their own notifications"
on "public"."notifications"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));

create policy "Users can update their own notifications"
on "public"."notifications"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));

create policy "Service role can insert notifications"
on "public"."notifications"
as permissive
for insert
to service_role
with check (true);
