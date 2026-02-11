'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Leaf, User, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  showNav?: boolean;
  currentPage?: 'home' | 'dashboard' | 'profile' | 'upload' | 'templates' | 'preview' | 'customize';
}

const profileImageCache = new Map<string, string>();
const profileImageRequests = new Map<string, Promise<string | null>>();

function setCachedProfileImage(userId: string, nextUrl: string) {
  const previousUrl = profileImageCache.get(userId);
  if (previousUrl && previousUrl !== nextUrl) {
    URL.revokeObjectURL(previousUrl);
  }
  profileImageCache.set(userId, nextUrl);
}

function clearCachedProfileImage(userId?: string) {
  if (userId) {
    const cachedUrl = profileImageCache.get(userId);
    if (cachedUrl) {
      URL.revokeObjectURL(cachedUrl);
      profileImageCache.delete(userId);
    }
    profileImageRequests.delete(userId);
    return;
  }

  profileImageCache.forEach((cachedUrl) => URL.revokeObjectURL(cachedUrl));
  profileImageCache.clear();
  profileImageRequests.clear();
}

export default function Header({ showNav = true, currentPage }: HeaderProps) {
  const router = useRouter();
  const info = useUser();
  const session = createClient();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const fetchProfileImage = async (userId: string): Promise<string | null> => {
    const existingRequest = profileImageRequests.get(userId);
    if (existingRequest) return existingRequest;

    const request = (async () => {
      try {
        const supabaseSession = await session.auth.getSession();
        const token = supabaseSession.data.session?.access_token;
        if (!token) return null;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/pfp`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setCachedProfileImage(userId, url);
          return url;
        }
      } catch (error) {
        console.error("Failed to load profile picture:", error);
      }
      return null;
    })();

    profileImageRequests.set(userId, request);
    request.finally(() => {
      profileImageRequests.delete(userId);
    });

    return request;
  };

  useEffect(() => {
    const userId = info.user?.id;
    if (!userId) {
      setProfileImageUrl(null);
      return;
    }

    const cachedUrl = profileImageCache.get(userId);
    if (cachedUrl) {
      setProfileImageUrl(cachedUrl);
    }

    let isCancelled = false;
    void fetchProfileImage(userId).then((nextUrl) => {
      if (!isCancelled && nextUrl) {
        setProfileImageUrl(nextUrl);
      }
    });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.user?.id]);

  const handleSignOut = async () => {
    clearCachedProfileImage(info.user?.id);
    await session.auth.signOut();
    router.push('/signin');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const signInPath = currentPage && currentPage !== 'home'
    ? `/signin?next=/${currentPage}`
    : "/signin?next=/dashboard";

  const dashboardPath = info.user ? '/dashboard' : '/signin?next=/dashboard';
  const profilePath = info.user ? '/profile' : '/signin?next=/profile';

  return (
    <header className="header-base sticky top-0 z-50">
      <div className="container-base">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Logo */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0"
              onClick={() => router.push('/home')}
              aria-label="Go to homepage"
            >
              <Leaf className="w-7 h-7 text-[var(--color-primary)]" />
              <h1 className="text-3xl leading-[1.3] font-bold gradient-text">Foliage</h1>
            </button>
            
            {/* Navigation Tabs */}
            {showNav && (
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  className={`gap-2 ${currentPage === 'dashboard' ? 'bg-[var(--color-primary)]/15 text-[var(--color-foreground)]' : ''}`}
                  onClick={() => handleNavigation(dashboardPath)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className={`gap-2 ${currentPage === 'profile' ? 'bg-[var(--color-primary)]/15 text-[var(--color-foreground)]' : ''}`}
                  onClick={() => handleNavigation(profilePath)}
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
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-secondary)]/75">
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/18 flex items-center justify-center overflow-hidden">
                  {profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-[var(--color-primary)]" />
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--color-foreground)]">{info.user.email?.split('@')[0]}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-[var(--color-border)] hover:bg-[var(--color-accent)]">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button onClick={() => router.push(signInPath)} variant="outline" size="sm" className="border-[var(--color-border)] hover:bg-[var(--color-accent)]">
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
