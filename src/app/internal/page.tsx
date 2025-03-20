"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InternalPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.userType !== 'internal') {
      router.push("/");
    }
  }, [user, router]);

  // Don't render the page content if not authenticated or not internal user
  if (!user || user.userType !== 'internal') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-red-600">Virgin Initiatives - Internal Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user.email}</span>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-6 flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Internal Employee Portal</h2>
        </div>
      </main>
    </div>
  );
} 