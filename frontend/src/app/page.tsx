"use client"

import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
export default function Home() {
  const session = createClient()

  const info = useUser()

  const handleSignOut = async () => {
    await session.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div>Home page</div>
      {
        info.user ? <div>
          <p>Welcome, {info.user.email}</p>
          <button onClick={() => handleSignOut()}>Sign Out</button>
        </div> : <div>
          <Link
            href={"/signin"}
          >
            login
          </Link>
        </div>
      }
    </div>
  );
}
