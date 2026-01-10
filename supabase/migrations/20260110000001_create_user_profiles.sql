-- Create user_profiles table
create table "public"."user_profiles" (
    "id" uuid not null,
    "email" text,
    "name" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);

-- Enable RLS
alter table "public"."user_profiles" enable row level security;

-- Create primary key
alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY ("id");

-- Create foreign key to auth.users
alter table "public"."user_profiles" add constraint "user_profiles_id_fkey"
    FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

-- Grant permissions
grant delete on table "public"."user_profiles" to "anon";
grant insert on table "public"."user_profiles" to "anon";
grant references on table "public"."user_profiles" to "anon";
grant select on table "public"."user_profiles" to "anon";
grant trigger on table "public"."user_profiles" to "anon";
grant truncate on table "public"."user_profiles" to "anon";
grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";
grant insert on table "public"."user_profiles" to "authenticated";
grant references on table "public"."user_profiles" to "authenticated";
grant select on table "public"."user_profiles" to "authenticated";
grant trigger on table "public"."user_profiles" to "authenticated";
grant truncate on table "public"."user_profiles" to "authenticated";
grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";
grant insert on table "public"."user_profiles" to "service_role";
grant references on table "public"."user_profiles" to "service_role";
grant select on table "public"."user_profiles" to "service_role";
grant trigger on table "public"."user_profiles" to "service_role";
grant truncate on table "public"."user_profiles" to "service_role";
grant update on table "public"."user_profiles" to "service_role";

-- Create function to handle user profile creation/update
create or replace function public.handle_auth_user_change()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        insert into public.user_profiles (id, email, name)
        values (
            new.id,
            new.email,
            coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name')
        );
        return new;
    elsif (TG_OP = 'UPDATE') then
        update public.user_profiles
        set
            email = new.email,
            name = coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
            updated_at = now()
        where id = new.id;
        return new;
    elsif (TG_OP = 'DELETE') then
        delete from public.user_profiles where id = old.id;
        return old;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_auth_user_change();

create trigger on_auth_user_updated
    after update on auth.users
    for each row execute procedure public.handle_auth_user_change();

create trigger on_auth_user_deleted
    after delete on auth.users
    for each row execute procedure public.handle_auth_user_change();

-- Backfill existing users
insert into public.user_profiles (id, email, name, created_at, updated_at)
select
    id,
    email,
    coalesce(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name') as name,
    created_at,
    updated_at
from auth.users
on conflict (id) do nothing;
