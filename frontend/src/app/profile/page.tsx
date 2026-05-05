'use client';

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Loader2,
  UserCircle2,
  Camera,
} from "lucide-react";
import Header from "@/components/Header";
import { useState, useEffect, useRef } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const info = useUser();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [selectedPfpFile, setSelectedPfpFile] = useState<File | null>(null);
  const [pfpPreviewUrl, setPfpPreviewUrl] = useState<string | null>(null);
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const profileImageUrlRef = useRef<string | null>(null);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    linkedin: "",
    github: "",
    website: "",
    title: "",
    company: "",
  });

  const getAccessToken = async () => {
    if (info.session?.access_token) {
      return info.session.access_token;
    }

    const supabaseSession = await supabase.auth.getSession();
    return supabaseSession.data.session?.access_token ?? null;
  };

  const fetchProfileImage = async (token: string, signal?: AbortSignal) => {
    setProfileImageLoading(true);
    setProfileImageError(null);

    try {
      const response = await fetch(`/api/backend/users/pfp`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (profileImageUrlRef.current) {
          URL.revokeObjectURL(profileImageUrlRef.current);
        }
        profileImageUrlRef.current = url;
        setProfileImageUrl(url);
      } else if (response.status === 404) {
        setProfileImageUrl(null);
      } else if (response.status !== 404) {
        const text = await response.text();
        setProfileImageError(text || 'Failed to load profile picture');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error('Error fetching profile picture:', error);
      setProfileImageError('Failed to load profile picture');
    } finally {
      setProfileImageLoading(false);
    }
  };

  useEffect(() => {
    if (!info.loading && !info.user) {
      router.replace('/signin?next=/profile');
    }
  }, [info.loading, info.user, router]);

  useEffect(() => {
    if (!info.user) return;

    const authData = {
      fullName: info.user.user_metadata?.full_name || info.user.user_metadata?.name || "",
      email: info.user.email || "",
      phone: info.user.user_metadata?.phone || "",
      location: "",
      bio: "",
      linkedin: "",
      github: "",
      website: "",
      title: "",
      company: "",
    };

    setProfile(authData);

    const token = info.session?.access_token;
    if (!token) return;

    const controller = new AbortController();
    let isCancelled = false;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/backend/profiles/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok || isCancelled) return;

        const data = await response.json();
        if (!data || isCancelled) return;

        setProfile({
          fullName: data.full_name || authData.fullName,
          email: data.email || authData.email,
          phone: data.phone || authData.phone,
          location: data.location || authData.location,
          bio: data.bio || authData.bio,
          linkedin: data.linkedin || authData.linkedin,
          github: data.github || authData.github,
          website: data.website || authData.website,
          title: data.title || authData.title,
          company: data.company || authData.company,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error('Error fetching profile:', error);
      }
    };

    void fetchProfile();
    void fetchProfileImage(token, controller.signal);

    return () => {
      isCancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.user?.id, info.session?.access_token]);

  useEffect(() => {
    if (!selectedPfpFile) {
      setPfpPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedPfpFile);
    setPfpPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedPfpFile]);

  useEffect(() => {
    return () => {
      if (profileImageUrlRef.current) {
        URL.revokeObjectURL(profileImageUrlRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error('Not authenticated');
      }

      const profileData = {
        full_name: profile.fullName,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        linkedin: profile.linkedin,
        github: profile.github,
        website: profile.website,
        title: profile.title,
        company: profile.company,
      };

      const response = await fetch(`/api/backend/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', message: 'Profile saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePfpChange = (file: File | null) => {
    if (!file) {
      setSelectedPfpFile(null);
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setProfileImageError("Only JPG and PNG files are supported.");
      return;
    }
    setProfileImageError(null);
    setSelectedPfpFile(file);
  };

  const handleUploadPfp = async () => {
    if (!selectedPfpFile) {
      setProfileImageError("Please choose a JPG or PNG file first.");
      return;
    }

    setIsUploadingPfp(true);
    setProfileImageError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", selectedPfpFile);

      const response = await fetch(`/api/backend/users/pfp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to upload profile picture");
      }

      setSelectedPfpFile(null);
      await fetchProfileImage(token);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setProfileImageError(error instanceof Error ? error.message : "Failed to upload profile picture");
    } finally {
      setIsUploadingPfp(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  if (info.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    return null;
  }

  return (
    <div className="min-h-screen soft-surface relative overflow-x-clip">
      <div className="floating-orb floating-orb-2" aria-hidden />
      <Header currentPage="profile" />

      <main className="py-10">
        <div className="container-base max-w-5xl">
          <section className="mb-8 reveal-soft">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-1">Profile Settings</p>
            <h2 className="text-5xl leading-[0.9]">Profile & Identity</h2>
            <p className="text-muted-foreground mt-2">Update the details used across your portfolio and public profile.</p>
          </section>

          <div className="space-y-6">
            <Card className="panel-soft reveal-soft reveal-soft-delay-1">
              <CardHeader>
                <CardTitle className="text-3xl inline-flex items-center gap-2">
                  <UserCircle2 className="w-6 h-6 text-[var(--color-primary)]" />
                  Profile Picture
                </CardTitle>
                <CardDescription>Upload a JPG or PNG image used in your account header and profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="h-24 w-24 rounded-full bg-muted/50 border flex items-center justify-center overflow-hidden">
                    {pfpPreviewUrl || profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pfpPreviewUrl || profileImageUrl || ""}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <Label htmlFor="profilePicture">Upload new image</Label>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => handlePfpChange(e.target.files?.[0] || null)}
                      className="block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-[var(--color-primary-foreground)] hover:file:bg-[var(--color-primary)]/90"
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadPfp}
                        disabled={isUploadingPfp || !selectedPfpFile}
                        className="border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10"
                      >
                        {isUploadingPfp ? "Uploading..." : "Upload"}
                      </Button>
                      {profileImageLoading && <span className="text-xs text-muted-foreground">Loading current image...</span>}
                    </div>
                  </div>
                </div>

                {profileImageError && (
                  <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200 text-sm">{profileImageError}</div>
                )}
              </CardContent>
            </Card>

            <Card className="panel-soft reveal-soft reveal-soft-delay-2">
              <CardHeader>
                <CardTitle className="text-3xl">Personal Information</CardTitle>
                <CardDescription>These details help pre-fill your portfolio profile sections.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={profile.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="San Francisco, CA"
                        value={profile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">Brief description for your portfolio. Maximum 500 characters.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-soft reveal-soft reveal-soft-delay-3">
              <CardHeader>
                <CardTitle className="text-3xl">Professional Details</CardTitle>
                <CardDescription>Add current role and social links used in portfolio contact sections.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="Software Engineer"
                      value={profile.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="Tech Corp"
                      value={profile.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/username"
                      value={profile.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="github"
                      placeholder="https://github.com/username"
                      value={profile.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      value={profile.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {saveMessage && (
              <div
                className={`p-4 rounded-lg ${
                  saveMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {saveMessage.message}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)]"
              >
                {isSaving ? (
                  <>
                    <div className="spinner w-4 h-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
