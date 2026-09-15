"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  email?: string;
  type: "individual" | "company"; // Физлицо или Юрлицо (B2B)
  companyName?: string;
  inn?: string;
  kpp?: string;
  city?: string;
  address?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (profile: UserProfile, token?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Восстановление профиля при первой загрузке из localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("abs_user_profile");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (e) {
      console.error("Ошибка при восстановлении сессии пользователя:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = (profile: UserProfile, token?: string) => {
    setUser(profile);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("abs_user_profile", JSON.stringify(profile));
        // Записываем куку сессии на 30 дней для сервера и SSR
        const authToken = token || `abs-session-${profile.id}`;
        document.cookie = `abs_auth_token=${authToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      } catch (e) {
        console.error("Ошибка сохранения профиля:", e);
      }
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("abs_user_profile");
        document.cookie = "abs_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch (e) {
        console.error("Ошибка при выходе:", e);
      }
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("abs_user_profile", JSON.stringify(updated));
      } catch (e) {
        console.error("Ошибка обновления профиля:", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
