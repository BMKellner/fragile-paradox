'use client';

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, User, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  showNav?: boolean;
  currentPage?: 'dashboard' | 'profile' | 'upload' | 'templates' | 'preview' | 'customize';
}

export default function Header({ showNav = true, currentPage }: HeaderProps) {
  const router = useRouter();
  const info = useUser();
  const session = createClient();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const profileImageUrlRef = useRef<string | null>(null);

  const fetchProfileImage = async () => {
    if (!info.user) return;

    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/pfp`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (profileImageUrlRef.current) {
          URL.revokeObjectURL(profileImageUrlRef.current);
        }
        profileImageUrlRef.current = url;
        setProfileImageUrl(url);
      }
    } catch (error) {
      console.error("Failed to load profile picture:", error);
    }
  };

  useEffect(() => {
    if (info.user) {
      fetchProfileImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.user]);

  useEffect(() => {
    return () => {
      if (profileImageUrlRef.current) {
        URL.revokeObjectURL(profileImageUrlRef.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    await session.auth.signOut();
    router.push('/signin');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <header className="header-base sticky top-0 z-50">
      <div className="container-base">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
              <Leaf className="w-5 h-5 text-emerald-600" />
              <h1 className="text-xl font-bold gradient-text">Foliage</h1>
            </div>
            
            {/* Navigation Tabs */}
            {showNav && info.user && (
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  className={`gap-2 ${currentPage === 'dashboard' ? 'bg-emerald-50 text-emerald-900' : ''}`}
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className={`gap-2 ${currentPage === 'profile' ? 'bg-emerald-50 text-emerald-900' : ''}`}
                  onClick={() => handleNavigation('/profile')}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </nav>
            )}
          </div>

          {/* Right side - User info and actions */}
          {info.user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                  {profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-emerald-700" />
                  )}
                </div>
                <span className="text-sm font-medium text-emerald-900">{info.user.email?.split('@')[0]}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50">
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => router.push('/signin')} variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
