"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Layout, 
  Shield, 
  Palette,
  Globe,
  Zap,
  Eye,
  Share2,
  Edit3
} from "lucide-react"

function SignInButton() {
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
    <Button
      type="button"
      onClick={signInWithGoogle}
      disabled={isGoogleLoading}
      variant="outline"
      size="lg"
      className="w-full"
    >
      {isGoogleLoading ? (
        <>
          <div className="spinner w-4 h-4"></div>
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

export default function SignInPage() {
  const features = [
    {
      icon: Zap,
      title: "Real-Time Updates",
      description: "Update your portfolio instantly and see changes live",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Palette,
      title: "Choose Your Style",
      description: "Select from 50+ professionally designed templates",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: Globe,
      title: "Custom Domain",
      description: "Get a unique portfolio link or use your own domain",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: Edit3,
      title: "Easy Customization",
      description: "Edit colors, fonts, and layouts without any coding",
      color: "bg-amber-50 text-amber-600"
    },
    {
      icon: Eye,
      title: "Live Preview",
      description: "Preview your portfolio before publishing it live",
      color: "bg-rose-50 text-rose-600"
    },
    {
      icon: Share2,
      title: "One-Click Sharing",
      description: "Share your portfolio with recruiters instantly",
      color: "bg-indigo-50 text-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sign In Section */}
      <section className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo/Title Section */}
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Resume Parser
            </Badge>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Resume Parser</span>
            </h1>
            <p className="text-muted-foreground">
              Transform your resume into a stunning portfolio website
            </p>
          </div>

          {/* Sign In Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Sign in to create your professional portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Suspense fallback={
                <Button variant="outline" size="lg" className="w-full" disabled>
                  <div className="spinner w-4 h-4"></div>
                  Loading...
                </Button>
              }>
                <SignInButton />
              </Suspense>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    What you&apos;ll get
                  </span>
                </div>
              </div>

              {/* Quick Feature List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-secondary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">AI-Powered</p>
                    <p className="text-xs text-muted-foreground">Intelligent resume parsing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-secondary">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">50+ Templates</p>
                    <p className="text-xs text-muted-foreground">Professional designs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-secondary">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Secure</p>
                    <p className="text-xs text-muted-foreground">Your data is protected</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-base">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Build Your Portfolio
            </h2>
            <p className="text-muted-foreground">
              Powerful features designed to help you create a standout professional portfolio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t mt-auto">
        <div className="container-base text-center">
          <p className="text-sm text-muted-foreground">
            Need help? <a href="#" className="underline hover:text-foreground">Contact support</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
