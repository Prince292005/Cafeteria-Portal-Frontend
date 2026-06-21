"use client";

import {
  loginUser,
  registerUser,
  sendOtp, // ✅ Import
  verifyOtp, // ✅ Import
} from "../services/authService";
import {
  createContext,
  useEffect,
  useContext,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  studentId: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
}

interface DecodedToken {
  exp: number;
}

// ✅ Update Interface to include OTP functions
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: object) => Promise<void>;
  logout: () => void;
  register: (userData: object) => Promise<any>;
  sendOtp: (email: string) => Promise<string>; // ✅ New
  verifyOtp: (email: string, otp: string) => Promise<string>; // ✅ New
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser && storedUser !== "undefined") {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          if (decoded.exp * 1000 > Date.now()) {
            setUser(JSON.parse(storedUser));
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Failed to parse token or user", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (credentials: object) => {
    const { token, studentId, role } = await loginUser(credentials);
    const user: User = { studentId, role };

    if (user && token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } else {
      throw new Error("Login successful but no user data received.");
    }
  };

  const register = async (userData: object) => {
    return registerUser(userData);
  };

  // ✅ Pass-through function for Sending OTP
  const handleSendOtp = async (email: string) => {
    return await sendOtp(email);
  };

  // ✅ Pass-through function for Verifying OTP
  const handleVerifyOtp = async (email: string, otp: string) => {
    return await verifyOtp(email, otp);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        sendOtp: handleSendOtp, // ✅ Exposed
        verifyOtp: handleVerifyOtp, // ✅ Exposed
      }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
