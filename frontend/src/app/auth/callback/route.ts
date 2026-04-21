import { NextResponse } from "next/server"

import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  // Extract search parameters and origin from the request URL
  const { searchParams, origin } = new URL(request.url)

  // On Vercel (and other proxied environments), request.url contains the internal
  // host (often localhost). Use x-forwarded-host to get the real public origin.
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https"
  const siteOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin

  // Get the authorization code and the 'next' redirect path
  const code = searchParams.get("code")
  const requestedNext = searchParams.get("next")
  const next =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard"

  if (code) {
    // Create a Supabase client
    const supabase = await createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If successful, redirect to the requested safe path or dashboard
      return NextResponse.redirect(`${siteOrigin}${next}`)
    }
  }

  // If there's no code or an error occurred, redirect to an error page
  return NextResponse.redirect(`${siteOrigin}/signin`)
}
