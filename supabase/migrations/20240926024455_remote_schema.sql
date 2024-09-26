create table "public"."user_push_subscriptions" (
    "user_id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "endpoint" text not null,
    "p256dh" text not null,
    "auth" text not null
);


alter table "public"."user_push_subscriptions" enable row level security;

CREATE UNIQUE INDEX user_push_subscriptions_pkey ON public.user_push_subscriptions USING btree (user_id);

alter table "public"."user_push_subscriptions" add constraint "user_push_subscriptions_pkey" PRIMARY KEY using index "user_push_subscriptions_pkey";

alter table "public"."user_push_subscriptions" add constraint "public_user_push_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_push_subscriptions" validate constraint "public_user_push_subscriptions_user_id_fkey";

grant delete on table "public"."user_push_subscriptions" to "anon";

grant insert on table "public"."user_push_subscriptions" to "anon";

grant references on table "public"."user_push_subscriptions" to "anon";

grant select on table "public"."user_push_subscriptions" to "anon";

grant trigger on table "public"."user_push_subscriptions" to "anon";

grant truncate on table "public"."user_push_subscriptions" to "anon";

grant update on table "public"."user_push_subscriptions" to "anon";

grant delete on table "public"."user_push_subscriptions" to "authenticated";

grant insert on table "public"."user_push_subscriptions" to "authenticated";

grant references on table "public"."user_push_subscriptions" to "authenticated";

grant select on table "public"."user_push_subscriptions" to "authenticated";

grant trigger on table "public"."user_push_subscriptions" to "authenticated";

grant truncate on table "public"."user_push_subscriptions" to "authenticated";

grant update on table "public"."user_push_subscriptions" to "authenticated";

grant delete on table "public"."user_push_subscriptions" to "service_role";

grant insert on table "public"."user_push_subscriptions" to "service_role";

grant references on table "public"."user_push_subscriptions" to "service_role";

grant select on table "public"."user_push_subscriptions" to "service_role";

grant trigger on table "public"."user_push_subscriptions" to "service_role";

grant truncate on table "public"."user_push_subscriptions" to "service_role";

grant update on table "public"."user_push_subscriptions" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."user_memories"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));



