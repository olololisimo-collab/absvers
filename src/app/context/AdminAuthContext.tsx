"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AdminCredentials {
  login: string;
  passwordHash: string;
  pinCode: string;
}

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminCredentials: AdminCredentials;
  verifyCredentials: (loginOrPin: string, password?: string) => boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  updateAdminCredentials: (newCreds: { login?: string; password?: string; pinCode?: string }) => { success: boolean; message: string };
}

const DEFAULT_CREDENTIALS: AdminCredentials = {
  login: "Admin",
  passwordHash: "Admin", // default password
  pinCode: "1234",      // default pin
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  adminCredentials: DEFAULT_CREDENTIALS,
  verifyCredentials: () => false,
  loginAdmin: () => {},
  logoutAdmin: () => {},
  updateAdminCredentials: () => ({ success: false, message: "" }),
});

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(DEFAULT_CREDENTIALS);

  // Восстановление сессии и кастомных учетных данных из localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // Загрузка настроек учетных данных
        const storedCreds = localStorage.getItem("abs_admin_creds");
        if (storedCreds) {
          const parsed = JSON.parse(storedCreds);
          if (parsed.login && (parsed.passwordHash || parsed.password) && parsed.pinCode) {
            setAdminCredentials({
              login: parsed.login,
              passwordHash: parsed.passwordHash || parsed.password,
              pinCode: parsed.pinCode,
            });
          }
        }

        // Проверка сохраненной сессии администратора (24 часа)
        const sessionExpiry = localStorage.getItem("abs_admin_session_expiry");
        if (sessionExpiry && Number(sessionExpiry) > Date.now()) {
          setIsAdminAuthenticated(true);
        } else {
          localStorage.removeItem("abs_admin_session_expiry");
        }
      }
    } catch (e) {
      console.error("Ошибка инициализации админ-авторизации:", e);
    }
  }, []);

  // Проверка логина/пароля или PIN-кода
  const verifyCredentials = (loginOrPin: string, password?: string): boolean => {
    const trimmedInput = loginOrPin.trim();

    // 1. Проверка по PIN-коду
    if (!password) {
      return trimmedInput === adminCredentials.pinCode;
    }

    // 2. Проверка по логину и паролю (регистронезависимо по логину)
    const isLoginMatch = trimmedInput.toLowerCase() === adminCredentials.login.trim().toLowerCase();
    const isPasswordMatch = password === adminCredentials.passwordHash;

    return isLoginMatch && isPasswordMatch;
  };

  const loginAdmin = () => {
    setIsAdminAuthenticated(true);
    if (typeof window !== "undefined") {
      try {
        // Запоминаем сессию на 24 часа
        const expiry = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem("abs_admin_session_expiry", expiry.toString());
      } catch (e) {
        console.error("Ошибка сохранения админ-сессии:", e);
      }
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("abs_admin_session_expiry");
      } catch (e) {
        console.error("Ошибка выхода из админки:", e);
      }
    }
  };

  const updateAdminCredentials = ({
    login,
    password,
    pinCode,
  }: {
    login?: string;
    password?: string;
    pinCode?: string;
  }): { success: boolean; message: string } => {
    try {
      const updated: AdminCredentials = {
        login: login?.trim() ? login.trim() : adminCredentials.login,
        passwordHash: password ? password : adminCredentials.passwordHash,
        pinCode: pinCode?.trim() ? pinCode.trim() : adminCredentials.pinCode,
      };

      setAdminCredentials(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("abs_admin_creds", JSON.stringify(updated));
      }

      return { success: true, message: "Данные администратора успешно сохранены!" };
    } catch (e) {
      console.error("Ошибка сохранения учетных данных:", e);
      return { success: false, message: "Не удалось сохранить учетные данные." };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminCredentials,
        verifyCredentials,
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
