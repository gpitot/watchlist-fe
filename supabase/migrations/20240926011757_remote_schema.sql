create table "public"."user_memories" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null default gen_random_uuid(),
    "memory" text
);


alter table "public"."user_memories" enable row level security;

CREATE UNIQUE INDEX user_memories_pkey ON public.user_memories USING btree (id);

alter table "public"."user_memories" add constraint "user_memories_pkey" PRIMARY KEY using index "user_memories_pkey";

alter table "public"."user_memories" add constraint "user_memories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_memories" validate constraint "user_memories_user_id_fkey";

grant delete on table "public"."user_memories" to "anon";

grant insert on table "public"."user_memories" to "anon";

grant references on table "public"."user_memories" to "anon";

grant select on table "public"."user_memories" to "anon";

grant trigger on table "public"."user_memories" to "anon";

grant truncate on table "public"."user_memories" to "anon";

grant update on table "public"."user_memories" to "anon";

grant delete on table "public"."user_memories" to "authenticated";

grant insert on table "public"."user_memories" to "authenticated";

grant references on table "public"."user_memories" to "authenticated";

grant select on table "public"."user_memories" to "authenticated";

grant trigger on table "public"."user_memories" to "authenticated";

grant truncate on table "public"."user_memories" to "authenticated";

grant update on table "public"."user_memories" to "authenticated";

grant delete on table "public"."user_memories" to "service_role";

grant insert on table "public"."user_memories" to "service_role";

grant references on table "public"."user_memories" to "service_role";

grant select on table "public"."user_memories" to "service_role";

grant trigger on table "public"."user_memories" to "service_role";

grant truncate on table "public"."user_memories" to "service_role";

grant update on table "public"."user_memories" to "service_role";


