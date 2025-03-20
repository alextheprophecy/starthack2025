"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Initiative = {
  company: string;
  initiative: string;
  challenge: string;
  solution: string;
  callToAction: string;
  links: string[];
};

type UserInitiative = {
  initiativeId: number;
  dateParticipated: string;
  pointsEarned: number;
  contribution: string;
};

type UserData = {
  email: string;
  points: number;
  participatedInitiatives: UserInitiative[];
};

type InitiativeWithParticipation = Initiative & {
  dateParticipated: string;
  pointsEarned: number;
  contribution: string;
};

export default function MyInitiatives() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userInitiatives, setUserInitiatives] = useState<InitiativeWithParticipation[]>([]);

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
            
            // Fetch and parse the CSV data
            fetch('/res/sample_initiatives.csv')
              .then(response => response.text())
              .then(csvText => {
                const lines = csvText.split('\n');
                const parsedInitiatives: Initiative[] = [];
                
                // Skip the header row (index 0)
                for (let i = 1; i < lines.length; i++) {
                  const line = lines[i].trim();
                  if (line) {
                    // Split by comma but handle commas within quotes
                    const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                    if (matches && matches.length >= 6) {
                      const initiative: Initiative = {
                        company: matches[0].replace(/"/g, ''),
                        initiative: matches[1].replace(/"/g, ''),
                        challenge: matches[2].replace(/"/g, ''),
                        solution: matches[3].replace(/"/g, ''),
                        callToAction: matches[4].replace(/"/g, ''),
                        links: matches[5].replace(/"/g, '').split('\n').map(link => link.trim()).filter(Boolean),
                      };
                      parsedInitiatives.push(initiative);
                    }
                  }
                }

                // Combine user participation data with initiative details
                const userInitiativesWithDetails = currentUser.participatedInitiatives.map((userInit: UserInitiative) => {
                  const initiativeDetails = parsedInitiatives[userInit.initiativeId - 1];
                  return {
                    ...initiativeDetails,
                    dateParticipated: userInit.dateParticipated,
                    pointsEarned: userInit.pointsEarned,
                    contribution: userInit.contribution,
                  };
                });
                setUserInitiatives(userInitiativesWithDetails);
              })
              .catch(error => console.error('Error loading initiatives:', error));
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
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-red-600">Virgin Initiatives</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
              >
                Browse All Initiatives
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Points Overview Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Points Display */}
              <div className="flex flex-col justify-center items-center p-6 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600 mb-2">{userData.points}</div>
                <div className="text-sm text-gray-600 font-medium">Total Points</div>
              </div>
              
              {/* Redeem Points Buttons */}
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => window.open("https://www.virgin.com/virgin-red", "_blank")}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg shadow-sm hover:from-red-700 hover:to-red-600 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Redeem in Virgin Red
                </button>
                <button 
                  onClick={() => window.open("https://www.virginhotels.com", "_blank")}
                  className="w-full sm:w-auto px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Use at Virgin Hotels
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Initiatives Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Initiatives</h2>
          </div>

          {userInitiatives.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">You haven&apos;t participated in any initiatives yet.</p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Browse Available Initiatives
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userInitiatives.map((initiative, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{initiative.company}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          +{initiative.pointsEarned} pts
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{initiative.initiative}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(initiative.dateParticipated).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-sm font-medium text-gray-900 mb-1">Your Contribution</div>
                      <p className="text-sm text-gray-600">{initiative.contribution}</p>
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