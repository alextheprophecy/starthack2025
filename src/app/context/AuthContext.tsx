"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  email: string;
};

type UserData = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from sessionStorage on initial load
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Get users from the API/JSON file
      const response = await fetch("/api/users");
      const data = await response.json();
      
      const foundUser = data.users.find(
        (u: UserData) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        const userData = { email: foundUser.email };
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      // Create a new user through the API
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Set the current user
        const userData = { email };
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 