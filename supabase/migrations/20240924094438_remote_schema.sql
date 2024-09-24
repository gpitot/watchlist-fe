create table "public"."user_providers" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "provider_name" text not null
);


alter table "public"."user_providers" enable row level security;

CREATE UNIQUE INDEX user_providers_pkey ON public.user_providers USING btree (id, provider_name);

alter table "public"."user_providers" add constraint "user_providers_pkey" PRIMARY KEY using index "user_providers_pkey";

alter table "public"."user_providers" add constraint "public_user_providers_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."user_providers" validate constraint "public_user_providers_id_fkey";

grant delete on table "public"."user_providers" to "anon";

grant insert on table "public"."user_providers" to "anon";

grant references on table "public"."user_providers" to "anon";

grant select on table "public"."user_providers" to "anon";

grant trigger on table "public"."user_providers" to "anon";

grant truncate on table "public"."user_providers" to "anon";

grant update on table "public"."user_providers" to "anon";

grant delete on table "public"."user_providers" to "authenticated";

grant insert on table "public"."user_providers" to "authenticated";

grant references on table "public"."user_providers" to "authenticated";

grant select on table "public"."user_providers" to "authenticated";

grant trigger on table "public"."user_providers" to "authenticated";

grant truncate on table "public"."user_providers" to "authenticated";

grant update on table "public"."user_providers" to "authenticated";

grant delete on table "public"."user_providers" to "service_role";

grant insert on table "public"."user_providers" to "service_role";

grant references on table "public"."user_providers" to "service_role";

grant select on table "public"."user_providers" to "service_role";

grant trigger on table "public"."user_providers" to "service_role";

grant truncate on table "public"."user_providers" to "service_role";

grant update on table "public"."user_providers" to "service_role";


