import { createClient } from "@/utils/supabase/server";
export default async function Home() {
  const supabase = await createClient();
  const { data: buckets, error: error } = await supabase.storage.getBucket('resumes');
  console.log("Buckets: ", buckets);
  console.log("Error: ", error);
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div>hello</div>
    </div>
  );
}
