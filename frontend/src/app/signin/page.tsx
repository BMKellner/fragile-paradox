"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Blocks, Globe, Sparkles, SwatchBook } from "lucide-react"

function SignInButton() {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const requestedNext = searchParams.get("next")
  const next = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/dashboard"

  async function signInWithGoogle() {
    setIsGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error("Error during sign-in:", error)
      setIsGoogleLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={signInWithGoogle}
      disabled={isGoogleLoading}
      variant="outline"
      size="lg"
      className="w-full gap-2 border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10"
    >
      {isGoogleLoading ? (
        <>
          <div className="spinner w-4 h-4" />
          Signing in...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  )
}

const capabilities = [
  {
    icon: Blocks,
    title: "Structured Content",
    description: "Resume data stays consistent from upload through preview.",
  },
  {
    icon: SwatchBook,
    title: "Design Controls",
    description: "Use templates and customization with a coherent visual system.",
  },
  {
    icon: Globe,
    title: "Publish Flow",
    description: "Save and manage portfolio versions from one workspace.",
  },
]

export default function SignInPage() {
  return (
    <div className="min-h-screen soft-surface relative overflow-x-clip">
      <div className="floating-orb floating-orb-1" aria-hidden />

      <main className="container-base py-12 sm:py-18 lg:py-20">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <section className="reveal-soft space-y-6">
            <Badge variant="secondary" className="border border-[var(--color-primary)]/30 bg-[var(--color-card)]/70">
              <Sparkles className="w-3 h-3 mr-1" />
              Authentication
            </Badge>

            <div>
              <h1 className="text-5xl sm:text-6xl leading-[0.94] tracking-tight">
                Continue where
                <span className="gradient-text block">you left off.</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-5 max-w-xl leading-relaxed">
                Sign in to access templates, profile edits, and portfolio publishing in a single workflow.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {capabilities.map((item, index) => (
                <article key={item.title} className={`panel-soft subtle-lift p-4 reveal-soft reveal-soft-delay-${Math.min(index + 1, 3)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className="w-4 h-4 text-[var(--color-primary)]" />
                    <h3 className="text-xl">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="reveal-soft reveal-soft-delay-2">
            <div className="panel-soft p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Workspace Access</p>
              <h2 className="text-4xl mt-2">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Authenticate with Google to continue building and managing your portfolio projects.
              </p>

              <div className="mt-6">
                <Suspense
                  fallback={
                    <Button variant="outline" size="lg" className="w-full" disabled>
                      <div className="spinner w-4 h-4" />
                      Loading...
                    </Button>
                  }
                >
                  <SignInButton />
                </Suspense>
              </div>

              <Link className="inline-flex items-center gap-1 text-sm mt-6 text-muted-foreground hover:text-foreground transition-colors" href="/home" aria-label="Return to home">
                Return to Home
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)]/80 py-6 bg-[var(--color-card)]/45">
        <div className="container-base text-center">
          <p className="text-sm text-muted-foreground">Foliage authentication portal</p>
        </div>
      </footer>
    </div>
  )
}
