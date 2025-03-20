"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserData = {
  email: string;
  points: number;
  participatedInitiatives: {
    company: string;
    initiative: string;
    dateParticipated: string;
    pointsEarned: number;
    contribution: string;
  }[];
};

export default function MyInitiatives() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      // Fetch user data from users.json
      fetch('/users.json')
        .then(response => response.json())
        .then(data => {
          const currentUser = data.users.find((u: UserData) => u.email === user.email);
          if (currentUser) {
            setUserData(currentUser);
          }
        })
        .catch(error => console.error('Error loading user data:', error));
    }
  }, [user, router]);

  if (!user || !userData) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-red-600">Virgin Initiatives</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors text-sm"
          >
            Back to Home
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Initiatives</h2>
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="text-lg font-semibold text-red-600">{userData.points} Points</span>
            </div>
          </div>

          {userData.participatedInitiatives.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">You haven&apos;t participated in any initiatives yet.</p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Browse Initiatives
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {userData.participatedInitiatives.map((initiative, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-red-600 text-white p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{initiative.company}</h3>
                      <p className="text-red-100">{initiative.initiative}</p>
                    </div>
                    <div className="bg-white text-red-600 px-3 py-1 rounded-full font-semibold">
                      +{initiative.pointsEarned} pts
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-600">Your Contribution</h4>
                      <p className="text-gray-800">{initiative.contribution}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Participated on {new Date(initiative.dateParticipated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 