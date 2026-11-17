"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  MapPin,
  Sparkles,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  Lock,
  ChevronRight,
  Loader2,
  X,
  Plus,
  Trash2,
  Globe,
  Heart,
  Briefcase,
  AlertCircle,
  Upload,
  Share2,
  Calendar,
  Check,
  Eye,
  Award,
  Coffee,
  Film,
  Music,
  Compass,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  uploadAvatarMedia,
  uploadCoverMedia,
  removeCoverMedia,
  uploadGalleryMedia,
  removeGalleryMedia,
} from "@/lib/profile/profile-media";

const POPULAR_INTERESTS = [
  "Cinema & Premiere Nights",
  "Art & Exhibitions",
  "Boutique Shopping",
  "Artisan Coffee & Cafés",
  "Fine Dining & Wine",
  "Travel & Weekend Getaways",
  "Fitness & Yoga",
  "Live Music & Concerts",
  "Literature & Conversations",
  "Clubbing & Nightlife",
  "Museums & Heritage",
  "Photography & Architecture",
];

const POPULAR_LANGUAGES = [
  "English",
  "Hindi",
  "Punjabi",
  "Bengali",
  "Telugu",
  "Tamil",
  "Marathi",
  "French",
  "Spanish",
];

// High-end curated fallback visuals when user has not yet customized
const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920";
const DEFAULT_AVATAR_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800";
const SAMPLE_GALLERY_PHOTOS = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=900",
];

export default function CustomerProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Profile data states
  const [fullName, setFullName] = useState("Arvind Yadav");
  const [tagline, setTagline] = useState(
    "Cinema connoisseur, art gallery explorer & boutique dining companion"
  );
  const [bio, setBio] = useState(
    "Enthusiastic explorer with an appreciation for fine conversations, aesthetic boutique cafés, cinema premiere nights, and bespoke travel. Looking for engaging companions for social events and lifestyle journeys."
  );
  const [locationCity, setLocationCity] = useState("Kanpur, Uttar Pradesh");
  const [memberSince, setMemberSince] = useState("October 2024");
  const [interests, setInterests] = useState<string[]>([
    "Cinema & Premiere Nights",
    "Artisan Coffee & Cafés",
    "Fine Dining & Wine",
    "Travel & Weekend Getaways",
    "Live Music & Concerts",
  ]);
  const [languages, setLanguages] = useState<string[]>(["English", "Hindi"]);
  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [avatarPhoto, setAvatarPhoto] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);

  // UI States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "gallery" | "details">("about");
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editLanguages, setEditLanguages] = useState<string[]>([]);

  // Loading & Toast states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Sync real profile data if user is authenticated
  useEffect(() => {
    if (profile) {
      if (profile.fullName || user?.displayName) {
        setFullName(profile.fullName || user?.displayName || "");
      }
      if (profile.bio) {
        setBio(profile.bio);
      }
      if ((profile as any).tagline) {
        setTagline((profile as any).tagline);
      }
      if (profile.city || profile.customerLocation?.city || profile.location?.city) {
        const cityStr = profile.city || profile.customerLocation?.city || profile.location?.city || "";
        const stateStr = profile.state || profile.customerLocation?.state || "";
        setLocationCity(stateStr ? `${cityStr}, ${stateStr}` : cityStr);
      }
      if (profile.interests && profile.interests.length > 0) {
        setInterests(profile.interests);
      }
      if (profile.languages && profile.languages.length > 0) {
        setLanguages(profile.languages);
      }
      if (profile.coverPhotoURL) {
        setCoverPhoto(profile.coverPhotoURL);
      }
      if (profile.photoURL || user?.photoURL) {
        setAvatarPhoto(profile.photoURL || user?.photoURL || "");
      }
      if (profile.galleryPhotos && profile.galleryPhotos.length > 0) {
        setGallery(profile.galleryPhotos);
      } else if (!user) {
        setGallery(SAMPLE_GALLERY_PHOTOS);
      }
      if (profile.createdAt) {
        try {
          const d = new Date(profile.createdAt);
          setMemberSince(d.toLocaleDateString("en-US", { month: "long", year: "numeric" }));
        } catch {
          // keep default
        }
      }
    } else if (!user) {
      // Guest demo preview
      setGallery(SAMPLE_GALLERY_PHOTOS);
    }
  }, [profile, user]);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Edit Modal
  const openEditModal = () => {
    if (!user) {
      router.push("/login?redirect=/profile");
      return;
    }
    setEditName(fullName);
    setEditTagline(tagline);
    setEditBio(bio);
    setEditCity(locationCity);
    setEditInterests([...interests]);
    setEditLanguages([...languages]);
    setIsEditModalOpen(true);
  };

  // Save Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        fullName: editName.trim(),
        tagline: editTagline.trim(),
        bio: editBio.trim(),
        city: editCity.trim(),
        interests: editInterests,
        languages: editLanguages,
        updatedAt: new Date().toISOString(),
      });

      setFullName(editName.trim());
      setTagline(editTagline.trim());
      setBio(editBio.trim());
      setLocationCity(editCity.trim());
      setInterests(editInterests);
      setLanguages(editLanguages);

      setIsEditModalOpen(false);
      showToast("success", "Profile updated successfully!");
    } catch (err: any) {
      console.error("Profile save error:", err);
      showToast("error", err?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Avatar Upload
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatarMedia(user.uid, file, false);
      setAvatarPhoto(url);
      showToast("success", "Profile picture updated successfully!");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to upload avatar photo.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // Cover Upload
  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    setUploadingCover(true);
    try {
      const url = await uploadCoverMedia(user.uid, file, false);
      setCoverPhoto(url);
      showToast("success", "Cover photo updated successfully!");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to upload cover photo.");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Remove Cover
  const handleRemoveCover = async () => {
    if (!user) return;
    try {
      await removeCoverMedia(user.uid, false);
      setCoverPhoto("");
      showToast("success", "Cover photo removed.");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to remove cover photo.");
    }
  };

  // Gallery Upload
  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    if (gallery.length >= 8) {
      showToast("error", "Maximum limit of 8 photos reached.");
      return;
    }
    setUploadingGallery(true);
    try {
      const isProv = profile?.userType === "provider" || profile?.userType === "both";
      const updated = await uploadGalleryMedia(user.uid, file, gallery, isProv);
      setGallery(updated);
      showToast("success", "Photo added to your lifestyle gallery!");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to add photo to gallery.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  // Remove Gallery Photo
  const handleRemoveGalleryPhoto = async (photoUrl: string) => {
    if (!user) return;
    try {
      const isProv = profile?.userType === "provider" || profile?.userType === "both";
      const updated = await removeGalleryMedia(user.uid, photoUrl, gallery, isProv);
      setGallery(updated);
      showToast("success", "Photo removed from gallery.");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to remove photo.");
    }
  };

  // Share profile
  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("success", "Profile link copied to clipboard!");
    }
  };

  const displayedCover = coverPhoto || DEFAULT_COVER_IMAGE;
  const displayedAvatar = avatarPhoto || DEFAULT_AVATAR_IMAGE;

  return (
    <div className="min-h-screen bg-[#FCF9FA] text-[#2E1065] pb-24 font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border backdrop-blur-xl ${
              toastMessage.type === "success"
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/30"
                : "bg-rose-950/90 text-rose-100 border-rose-500/30"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarSelect}
        className="hidden"
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleCoverSelect}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleGallerySelect}
        className="hidden"
      />

      {/* Guest Preview Mode Banner if not authenticated */}
      {!user && (
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-pink-950 text-white text-xs py-2.5 px-4 text-center border-b border-pink-500/20">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="font-medium text-pink-100">
              You are viewing an interactive profile preview.
            </span>
            <Link
              href="/login?redirect=/profile"
              className="font-extrabold text-pink-300 hover:text-white underline ml-1"
            >
              Sign In
            </Link>
            <span className="text-pink-400/50">•</span>
            <Link
              href="/register?redirect=/profile"
              className="font-extrabold text-pink-300 hover:text-white underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 1: PANORAMIC COVER HERO WITH ROUNDED BOTTOM CORNERS         */}
      {/* ==================================================================== */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32">
        <div className="relative h-64 sm:h-80 md:h-[380px] w-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-purple-950/10 border border-pink-100/60 group">
          <Image
            src={displayedCover}
            alt="Profile Cover"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Luxury ambient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-purple-950/20 to-black/20" />

          {/* Top Bar on Cover */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between pointer-events-auto">
            {/* VIP Status Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>Verified Patron Member</span>
            </div>

            {/* Cover Action Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    router.push("/login?redirect=/profile");
                    return;
                  }
                  coverInputRef.current?.click();
                }}
                disabled={uploadingCover}
                className="px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-white/40 text-purple-950 text-xs font-extrabold hover:bg-white transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-500" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-pink-600" />
                )}
                <span>{coverPhoto ? "Change Cover" : "Add Cover Photo"}</span>
              </button>

              {coverPhoto && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  title="Remove Cover Photo"
                  className="w-9 h-9 rounded-full bg-white/85 backdrop-blur-md border border-white/40 text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 2: PROFILE HEADER (OVERLAPPING AVATAR + PROMINENT IDENTITY) */}
      {/* ==================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 -mt-16 sm:-mt-24 relative z-10">
        <div className="rounded-[2.5rem] bg-white/95 backdrop-blur-2xl border border-pink-100 shadow-xl shadow-purple-950/5 p-6 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-pink-100/80">
            {/* Avatar & Core Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              {/* Large Overlapping Avatar */}
              <div className="relative -mt-20 sm:-mt-28 w-36 h-36 sm:w-44 sm:h-44 rounded-full ring-4 ring-white shadow-2xl overflow-hidden bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 shrink-0 group">
                <Image
                  src={displayedAvatar}
                  alt={fullName}
                  fill
                  sizes="176px"
                  className="object-cover"
                />

                {/* Avatar Change Overlay Badge */}
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      router.push("/login?redirect=/profile");
                      return;
                    }
                    avatarInputRef.current?.click();
                  }}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-purple-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-extrabold cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-pink-300" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1 text-pink-300" />
                      <span>Update Photo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Name, Tagline & Core Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-purple-950 tracking-tight">
                    {fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
                    Verified Client
                  </span>
                </div>

                <p className="text-sm sm:text-base text-purple-900/75 font-medium max-w-2xl leading-relaxed">
                  {tagline}
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-purple-900/60 pt-1">
                  <span className="flex items-center gap-1.5 text-purple-950 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-pink-500" />
                    {locationCity}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Member since {memberSince}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Background Confirmed
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleShareProfile}
                className="px-4 py-2.5 rounded-full border border-pink-200 text-purple-950 text-xs font-extrabold hover:bg-pink-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Share Profile</span>
              </button>

              <button
                type="button"
                onClick={openEditModal}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black hover:opacity-95 shadow-md shadow-pink-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Quick Statistics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100/60 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-purple-900/60 uppercase tracking-wider block">
                Verification Tier
              </span>
              <span className="text-lg font-black text-purple-950">Pre-Screened</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-purple-900/60 uppercase tracking-wider block">
                Preferred Locality
              </span>
              <span className="text-lg font-black text-purple-950 truncate block">
                {locationCity.split(",")[0] || "Kanpur"}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100/60 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-purple-900/60 uppercase tracking-wider block">
                Curated Passions
              </span>
              <span className="text-lg font-black text-pink-600">{interests.length} Topics</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60 text-center space-y-0.5">
              <span className="text-[11px] font-bold text-purple-900/60 uppercase tracking-wider block">
                Languages Spoken
              </span>
              <span className="text-lg font-black text-purple-950">{languages.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 3: 2-COLUMN EDITORIAL CONTENT (ABOUT + LIFESTYLE GALLERY)   */}
      {/* ==================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: ABOUT ME & PASSIONS (5 Cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* About Me Narrative Card */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-pink-100 shadow-xl shadow-purple-950/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-950">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                Personal Biography
              </div>
              <button
                type="button"
                onClick={openEditModal}
                className="text-pink-600 hover:text-pink-700 text-xs font-bold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            <p className="text-sm sm:text-base text-purple-900/80 leading-relaxed font-normal whitespace-pre-line bg-pink-50/30 p-5 rounded-2xl border border-pink-100/60 italic">
              &ldquo;{bio}&rdquo;
            </p>

            <div className="pt-2 border-t border-pink-100/70 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-950 block">
                Companionship Expectations
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-purple-900/70 font-semibold">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-50/40 border border-pink-100/40">
                  <Film className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>Cinema & Events</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-50/40 border border-pink-100/40">
                  <Coffee className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>Coffee & Talks</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-50/40 border border-pink-100/40">
                  <Compass className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>Weekend Roadtrips</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-50/40 border border-pink-100/40">
                  <Music className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>Clubbing & Lounges</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interests & Passions Chips */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-pink-100 shadow-xl shadow-purple-950/5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-950">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Interests & Lifestyle Passions</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {interests.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200/80 text-purple-950 text-xs font-bold hover:scale-105 transition-transform shadow-2xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Languages & Locality Card */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-pink-100 shadow-xl shadow-purple-950/5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-950">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>Fluent Languages</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="px-4 py-2 rounded-full bg-purple-50 border border-purple-200/80 text-purple-950 text-xs font-bold"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MULTIPLE PHOTOS GALLERY (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-white border border-pink-100 shadow-xl shadow-purple-950/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-600 mb-1">
                  <Camera className="w-3.5 h-3.5" />
                  Lifestyle Photo Portfolio
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-purple-950">
                  Moments & Aesthetic Gallery
                </h2>
                <p className="text-xs text-purple-900/60 mt-0.5">
                  Visual previews showing companion events, coffee visits & travel memories ({gallery.length}/8).
                </p>
              </div>

              {gallery.length < 8 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      router.push("/login?redirect=/profile");
                      return;
                    }
                    galleryInputRef.current?.click();
                  }}
                  disabled={uploadingGallery}
                  className="px-5 py-2.5 rounded-full bg-purple-950 text-white text-xs font-black hover:bg-purple-900 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {uploadingGallery ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-pink-400" />
                  )}
                  <span>Upload Photo</span>
                </button>
              )}
            </div>

            {/* Asymmetric Editorial Gallery Grid */}
            {gallery.length === 0 ? (
              <div className="p-14 rounded-3xl border-2 border-dashed border-pink-200 text-center space-y-3 bg-pink-50/20">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-purple-950">No Gallery Photos Added Yet</h4>
                <p className="text-xs text-purple-900/60 max-w-sm mx-auto leading-relaxed">
                  Upload up to 8 authentic glimpses of coffee meetups, boutique visits, and premiere nights.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      router.push("/login?redirect=/profile");
                      return;
                    }
                    galleryInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-950 text-white text-xs font-black hover:bg-purple-900 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-pink-400" />
                  <span>Add First Photo</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {/* Feature First Photo (Spans 2 rows / 2 columns on sm) */}
                <div
                  onClick={() => setActivePreviewImage(gallery[0])}
                  className="col-span-2 row-span-2 relative h-72 sm:h-80 rounded-3xl overflow-hidden cursor-pointer group shadow-md"
                >
                  <Image
                    src={gallery[0]}
                    alt="Feature Lifestyle Moment"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> View Fullscreen
                    </span>
                    {user && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveGalleryPhoto(gallery[0]);
                        }}
                        className="w-8 h-8 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Remaining Photos */}
                {gallery.slice(1).map((photoUrl, idx) => (
                  <div
                    key={photoUrl}
                    onClick={() => setActivePreviewImage(photoUrl)}
                    className="relative h-36 sm:h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-sm bg-pink-100/30"
                  >
                    <Image
                      src={photoUrl}
                      alt={`Gallery Photo ${idx + 2}`}
                      fill
                      sizes="200px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-purple-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                      <Eye className="w-4 h-4" />
                      {user && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveGalleryPhoto(photoUrl);
                          }}
                          className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Photo Card if space available */}
                {gallery.length < 8 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        router.push("/login?redirect=/profile");
                        return;
                      }
                      galleryInputRef.current?.click();
                    }}
                    disabled={uploadingGallery}
                    className="h-36 sm:h-40 rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-400 bg-pink-50/30 hover:bg-pink-50/60 transition-all flex flex-col items-center justify-center text-purple-950 gap-2 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-pink-100 group-hover:bg-pink-200 text-pink-600 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold">Add Photo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* LIGHTBOX MODAL FOR GALLERY PREVIEW                                  */}
      {/* ==================================================================== */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          className="fixed inset-0 z-50 bg-purple-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setActivePreviewImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={activePreviewImage}
                alt="Enlarged Preview"
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* EDIT PROFILE MODAL (TABBED PROFESSIONAL DIALOG)                    */}
      {/* ==================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-pink-100 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border-b border-pink-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-purple-950">Customize Customer Profile</h3>
                <p className="text-xs text-purple-900/60 mt-0.5">
                  Update your display persona, passions, and background story.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white text-purple-950 hover:bg-pink-100 flex items-center justify-center transition-colors shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
              {/* Full Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-purple-950">Full Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-pink-50/30 border border-pink-200 text-xs font-semibold text-purple-950 focus:outline-none focus:border-pink-500"
                    placeholder="e.g. Arvind Yadav"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-purple-950">City & Location</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-pink-50/30 border border-pink-200 text-xs font-semibold text-purple-950 focus:outline-none focus:border-pink-500"
                    placeholder="e.g. Kanpur, Uttar Pradesh"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-purple-950">Personal Tagline</label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-pink-50/30 border border-pink-200 text-xs font-semibold text-purple-950 focus:outline-none focus:border-pink-500"
                  placeholder="e.g. Cinema connoisseur, art gallery explorer & boutique dining enthusiast"
                />
              </div>

              {/* Biography Narrative */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-purple-950">Biography & Lifestyle Story</label>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-pink-50/30 border border-pink-200 text-xs font-semibold text-purple-950 focus:outline-none focus:border-pink-500 leading-relaxed resize-none"
                  placeholder="Share a short introduction about your lifestyle passions, companionship preferences, and favorite activities..."
                />
              </div>

              {/* Selectable Interests */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-950 block">
                  Select Passions & Interests
                </label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                  {POPULAR_INTERESTS.map((tag) => {
                    const isSelected = editInterests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setEditInterests((prev) =>
                            isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs"
                            : "bg-pink-50/60 border border-pink-200 text-purple-950 hover:bg-pink-100"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selectable Languages */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-950 block">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_LANGUAGES.map((lang) => {
                    const isSelected = editLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setEditLanguages((prev) =>
                            isSelected ? prev.filter((l) => l !== lang) : [...prev, lang]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-purple-950 text-white shadow-xs"
                            : "bg-purple-50 border border-purple-200 text-purple-950 hover:bg-purple-100"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{lang}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-pink-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-pink-200 text-purple-950 text-xs font-bold hover:bg-pink-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
