alter table "public"."resumes" add column "file_path" text;

alter table "public"."resumes" add column "title" text;

CREATE UNIQUE INDEX resumes_file_path_key ON public.resumes USING btree (file_path);

alter table "public"."resumes" add constraint "resumes_file_path_key" UNIQUE using index "resumes_file_path_key";


