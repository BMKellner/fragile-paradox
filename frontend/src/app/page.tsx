"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Sparkles, 
  Users, 
  Layout, 
  Zap, 
  Shield, 
  TrendingUp,
  ArrowRight
} from "lucide-react";
export default function Home() {
  const [resumeData, setResumeData] = useState<object | null>(null);

  const handleError = (error: string) => {
    console.error('Upload error:', error);
  };

  const session = createClient();
  const router = useRouter();
  const info = useUser();
  useEffect(() => {
    if (!info.loading && info.user) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    }
  }, [info.loading, info.user, router]);

  const handleUploadComplete = (data: object) => {
    // store the parsed resume so the next route can read it
    try {
      sessionStorage.setItem("resumeData", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save resumeData to sessionStorage", e);
    }
    setResumeData(data);
    router.push('/tabbedresume')
  };

  const handleSignOut = async () => {
    await session.auth.signOut();
    window.location.reload();
  }

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
      icon: FileText,
      value: "2.5K+",
      label: "Resumes Parsed",
      color: "text-blue-600"
    },
    {
      icon: Layout,
      value: "50+",
      label: "Templates Available",
      color: "text-purple-600"
    },
    {
      icon: Users,
      value: "10K+",
      label: "Active Users",
      color: "text-pink-600"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Parsing",
      description: "Advanced AI extracts all information from your resume accurately",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Layout,
      title: "Beautiful Templates",
      description: "Choose from professionally designed templates for your portfolio",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with industry-leading security",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Parse and generate your portfolio in seconds, not hours",
      color: "bg-amber-50 text-amber-600"
    },
    {
      icon: TrendingUp,
      title: "SEO Optimized",
      description: "Built-in SEO best practices to help you get discovered",
      color: "bg-rose-50 text-rose-600"
    },
    {
      icon: Users,
      title: "Share Easily",
      description: "Get a unique link to share your portfolio with anyone",
      color: "bg-indigo-50 text-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-base sticky top-0 z-50 backdrop-blur-sm bg-background/80">
        <div className="container-base">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Resume Parser</h1>
              <p className="text-sm text-muted-foreground">Your Personal Portfolio Builder</p>
            </div>
            <Button onClick={() => router.push('/signin')} variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-muted/20">
        <div className="container-base">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wide">
              Your Personal Portfolio Builder
            </p>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Transform Your Resume into a{" "}
              <span className="gradient-text">Stunning Portfolio</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Upload your resume and let our AI parse it into a beautiful, professional portfolio website in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => router.push('/signin')} size="lg" className="gap-2 h-12 px-8">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => router.push('/signin')} variant="outline" size="lg" className="h-12 px-8">
                Sign In
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${stat.color === 'text-blue-600' ? 'bg-blue-100' : stat.color === 'text-purple-600' ? 'bg-purple-100' : 'bg-pink-100'}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
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
      <section className="py-16 bg-muted/30">
        <div className="container-base">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Everything You Need to Build Your Portfolio
            </h3>
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
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button onClick={() => router.push('/signin')} size="lg" className="gap-2">
              Start Building Your Portfolio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container-base text-center text-sm text-muted-foreground">
          <p>© 2024 Resume Parser. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
