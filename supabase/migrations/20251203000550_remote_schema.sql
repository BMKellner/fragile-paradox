
  create table "public"."portfolios" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "template_id" text not null,
    "data" jsonb not null default '{}'::jsonb,
    "color" text default 'blue'::text,
    "display_mode" text default 'light'::text,
    "is_published" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."portfolios" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "email" text not null,
    "full_name" text,
    "phone" text,
    "location" text,
    "bio" text,
    "linkedin" text,
    "github" text,
    "website" text,
    "title" text,
    "company" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;

CREATE INDEX idx_portfolios_created_at ON public.portfolios USING btree (created_at DESC);

CREATE INDEX idx_portfolios_user_id ON public.portfolios USING btree (user_id);

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX portfolios_pkey ON public.portfolios USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);

alter table "public"."portfolios" add constraint "portfolios_pkey" PRIMARY KEY using index "portfolios_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."portfolios" add constraint "portfolios_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."portfolios" validate constraint "portfolios_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_key" UNIQUE using index "profiles_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."portfolios" to "anon";

grant insert on table "public"."portfolios" to "anon";

grant references on table "public"."portfolios" to "anon";

grant select on table "public"."portfolios" to "anon";

grant trigger on table "public"."portfolios" to "anon";

grant truncate on table "public"."portfolios" to "anon";

grant update on table "public"."portfolios" to "anon";

grant delete on table "public"."portfolios" to "authenticated";

grant insert on table "public"."portfolios" to "authenticated";

grant references on table "public"."portfolios" to "authenticated";

grant select on table "public"."portfolios" to "authenticated";

grant trigger on table "public"."portfolios" to "authenticated";

grant truncate on table "public"."portfolios" to "authenticated";

grant update on table "public"."portfolios" to "authenticated";

grant delete on table "public"."portfolios" to "service_role";

grant insert on table "public"."portfolios" to "service_role";

grant references on table "public"."portfolios" to "service_role";

grant select on table "public"."portfolios" to "service_role";

grant trigger on table "public"."portfolios" to "service_role";

grant truncate on table "public"."portfolios" to "service_role";

grant update on table "public"."portfolios" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


  create policy "Users can delete their own portfolios"
  on "public"."portfolios"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own portfolios"
  on "public"."portfolios"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own portfolios"
  on "public"."portfolios"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own portfolios"
  on "public"."portfolios"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can delete their own profile"
  on "public"."profiles"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


