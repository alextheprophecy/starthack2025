"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Dashboard from "../components/dashboard/Dashboard";
import { useSearchParams } from 'next/navigation';

export default function InternalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const view = searchParams.get('view');

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    } else if (user.userType !== 'internal') {
      router.push("/");
      return;
    }
    
    setIsLoading(false);
  }, [user, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Don't render the page content if not authenticated or not internal user
  if (!user || user.userType !== 'internal') {
    return null;
  }
  
  return <Dashboard initialView={view} />;
}