"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Sparkles, 
  Users, 
  Layout, 
  Zap, 
  Shield, 
  TrendingUp,
  ArrowRight,
  Leaf,
  TreePine,
  Sprout
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const info = useUser();
  
  useEffect(() => {
    if (!info.loading && info.user) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    }
  }, [info.loading, info.user, router]);

  if (info.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (info.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to upload...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Sprout,
      value: "2.5K+",
      label: "Portfolios Created",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      icon: TreePine,
      value: "50+",
      label: "Templates Available",
      color: "text-green-700",
      bg: "bg-green-50"
    },
    {
      icon: Leaf,
      value: "10K+",
      label: "Active Users",
      color: "text-teal-600",
      bg: "bg-teal-50"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Parsing",
      description: "Advanced AI extracts all information from your resume accurately",
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      icon: Layout,
      title: "Nature-Inspired Templates",
      description: "Choose from beautifully designed templates with organic aesthetics",
      color: "bg-green-50 text-green-700"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with industry-leading security",
      color: "bg-teal-50 text-teal-700"
    },
    {
      icon: Sprout,
      title: "Grow Your Brand",
      description: "Build and cultivate your professional presence organically",
      color: "bg-lime-50 text-lime-700"
    },
    {
      icon: TrendingUp,
      title: "SEO Optimized",
      description: "Built-in SEO best practices to help you get discovered",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: Users,
      title: "Share Easily",
      description: "Get a unique link to share your portfolio with anyone",
      color: "bg-green-50 text-green-600"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-base sticky top-0 z-50">
        <div className="container-base">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold gradient-text">Foliage</h1>
                <p className="text-xs text-muted-foreground">Grow Your Career Story</p>
              </div>
            </div>
            <Button onClick={() => router.push('/signin')} variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Canopy background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 opacity-60"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibGVhZiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIj48cGF0aCBkPSJNMCAzMHEyMC0yMCAzMCAwdDAgMzBxLTEwIDIwLTMwIDAgMC0yMCAwLTMweiIgZmlsbD0iIzRkOGI2ZiIgb3BhY2l0eT0iMC4wMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNsZWFmKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container-base relative">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 text-emerald-800 text-sm font-medium mb-6">
              <Sprout className="w-4 h-4" />
              <span>Plant the Seeds of Your Professional Growth</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Let Your Career Story{" "}
              <span className="gradient-text">Flourish</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Transform your resume into a living, breathing portfolio. Our AI cultivates your experience into beautiful, nature-inspired websites.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => router.push('/signin')} size="lg" className="gap-2 h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                Start Growing Free
                <Sprout className="w-4 h-4" />
              </Button>
              <Button onClick={() => router.push('/signin')} variant="outline" size="lg" className="h-12 px-8 border-emerald-200 hover:bg-emerald-50">
                View Templates
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="border border-emerald-100 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-2xl font-bold mb-1 text-emerald-900">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="container-base">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <TreePine className="w-8 h-8 text-emerald-600" />
              Rooted in Excellence
            </h3>
            <p className="text-muted-foreground">
              Everything you need to cultivate a standout professional presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border border-emerald-100/50 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-emerald-900">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button onClick={() => router.push('/signin')} size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
              Start Building Your Portfolio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-emerald-100 bg-white/50 backdrop-blur-sm">
        <div className="container-base">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">Foliage</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Foliage. Growing careers, naturally.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
