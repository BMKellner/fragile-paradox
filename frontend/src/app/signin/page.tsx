"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import { createClient } from "@/utils/supabase/client"

export default function SignInPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)
  const supabase = createClient()

  const searchParams = useSearchParams()

  const next = searchParams.get("next")

  async function signInWithGoogle() {
    setIsGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""
            }`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error during sign-in:", error)
      setIsGoogleLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <div>loading...</div>
      ) : (
        null
      )}{" "}
      Sign in with Google
    </button>
  )
}
