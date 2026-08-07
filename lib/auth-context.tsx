"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, getUserProfile, logoutUser, UserProfileData } from "./firebase";

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  authModalMessage: string;
  returnUrl: string | null;
  openAuthModal: (message?: string, returnUrl?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  authModalOpen: false,
  authModalMessage: "Please sign in or create an account to book this service.",
  returnUrl: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth modal state for purchase/booking guard
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState(
    "Please sign in or create an account to book this service."
  );
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProf = await getUserProfile(currentUser.uid);
        setProfile(userProf);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const openAuthModal = (message?: string, url?: string) => {
    if (message) setAuthModalMessage(message);
    if (url) setReturnUrl(url);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        authModalOpen,
        authModalMessage,
        returnUrl,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
