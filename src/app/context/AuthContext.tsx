"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  email: string;
  userType: 'internal' | 'external';
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
};

type UserData = {
  email: string;
  password: string;
  userType?: 'internal' | 'external';
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, userType: 'internal' | 'external') => Promise<boolean>;
  signup: (email: string, password: string, userType: 'internal' | 'external') => Promise<boolean>;
  updateProfile: (userData: Partial<UserData>) => Promise<boolean>;
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

  const login = async (email: string, password: string, userType: 'internal' | 'external') => {
    try {
      // Get users from the API/JSON file
      const response = await fetch("/api/users");
      const data = await response.json();
      
      const foundUser = data.users.find(
        (u: UserData) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        // Use the stored userType if available, otherwise use the provided userType
        const actualUserType = foundUser.userType || userType;
        
        // Only allow login if the user is trying to login with the correct userType
        if (actualUserType !== userType) {
          console.error("User type mismatch");
          return false;
        }
        
        // Include additional profile information in the user object
        const userData = { 
          email: foundUser.email, 
          userType: actualUserType,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          company: foundUser.company,
          position: foundUser.position
        };
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

  const signup = async (email: string, password: string, userType: 'internal' | 'external' = 'external') => {
    try {
      // Create a new user through the API
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, userType }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Set the current user with specified userType
        const userData = { email, userType };
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
  
  const updateProfile = async (userData: Partial<UserData>) => {
    try {
      if (!user) return false;
      
      // Make sure we have the current user's email
      const updateData = {
        ...userData,
        email: user.email,
        isUpdate: true
      };
      
      // Update user through the API
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update the current user state with new profile data
        const updatedUser = {
          ...user,
          ...userData
        };
        setUser(updatedUser);
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, updateProfile, logout }}>
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