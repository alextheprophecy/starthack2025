"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImpactForest from "../components/ImpactForest";
import CountUp from "react-countup";
import { motion } from "framer-motion";

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
  const [isCountingActive, setIsCountingActive] = useState(false);
  const [categoryPoints, setCategoryPoints] = useState({
    environmental: 0,
    social: 0,
    innovation: 0
  });

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
                
                // Calculate points by category (simplified mock calculation)
                const environmental = Math.round(currentUser.points * 0.35); // 35% of total points
                const social = Math.round(currentUser.points * 0.40); // 40% of total points
                const innovation = Math.round(currentUser.points * 0.25); // 25% of total points
                
                setCategoryPoints({
                  environmental,
                  social,
                  innovation
                });
              })
              .catch(error => console.error('Error loading initiatives:', error));
          }
        })
        .catch(error => console.error('Error loading user data:', error));
    }
  }, [user, router]);

  // Add keyframes animation for the pulsing effect
  useEffect(() => {
    // Define the pulsing animation if it doesn't exist yet
    if (!document.querySelector('#count-pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'count-pulse-animation';
      style.innerHTML = `
        @keyframes countPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes countPulseCategory {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .count-pulse-active {
          animation: countPulse 0.8s ease-in-out infinite;
        }
        .count-pulse-category-active {
          animation: countPulseCategory 0.8s ease-in-out infinite;
        }
        .wave-shape {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          overflow: hidden;
          line-height: 0;
        }
        .wave-shape svg {
          position: relative;
          display: block;
          width: calc(100% + 1.3px);
          height: 24px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!user || !userData) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Points Overview with Redemption Options */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative">
            {/* Red background shape cutout */}
            <div className="absolute inset-0 bg-red-600 h-32 rounded-t-xl"></div>
            
            {/* Wave shape for curved edge */}
            <div className="wave-shape" style={{ bottom: '-1px', transform: 'rotate(180deg)' }}>
              <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#DC2626"></path>
              </svg>
            </div>
            
            <div className="relative p-6 sm:p-8 pt-16">
              {/* Virgin logo on the background */}
              <div className="absolute top-4 right-8 opacity-30">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L6 12L12 22L18 12L12 2Z" fill="white" />
                </svg>
              </div>
              
              {/* Total Points and Redemption Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Points Display - Larger, prominent */}
                <div className="flex flex-col justify-center items-center p-8 bg-white rounded-xl shadow-lg border-2 border-red-100 relative z-10">
                  <div 
                    className={`text-5xl font-bold mb-3 transition-all duration-300 ease-in-out ${
                      isCountingActive 
                        ? 'text-red-500 count-pulse-active' 
                        : 'text-red-600'
                    }`}
                  >
                    <CountUp 
                      end={userData.points} 
                      duration={2.5} 
                      separator="," 
                      onStart={() => setIsCountingActive(true)}
                      onEnd={() => setIsCountingActive(false)}
                      className="inline-block"
                      delay={0.2}
                      useEasing={true}
                    />
                  </div>
                  <div className="text-sm uppercase font-semibold tracking-wider text-gray-600">Community Points</div>
                </div>
                
                {/* Redeem Points Buttons - now stacked next to total points */}
                <div className="flex flex-col gap-4 justify-center">
                  <button 
                    onClick={() => window.open("https://www.virgin.com/virgin-red", "_blank")}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg shadow-sm hover:from-red-700 hover:to-red-600 transition-all flex items-center justify-center gap-2 font-medium transform hover:scale-105 border-2 border-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Redeem in Virgin Red
                  </button>
                  <button 
                    onClick={() => window.open("https://www.virginhotels.com", "_blank")}
                    className="w-full px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Use at Virgin Hotels
                  </button>
                </div>
                
                <div className="hidden md:block"></div>
              </div>
              
              {/* Category Points Section - Side by side under total points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 relative">
                {/* Environmental Points - Top layer */}
                <motion.div 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    y: {
                      delay: 0.3,
                      duration: 0.4,
                      type: "spring",
                      stiffness: 130,
                      damping: 15
                    },
                    opacity: {
                      duration: 0.15,
                      delay: 0.3,
                      ease: "easeIn"
                    }
                  }}
                  className="flex flex-col justify-center items-center p-6 bg-green-50 rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 border border-green-100 relative z-30"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <div 
                    className={`text-3xl font-bold mb-2 transition-all duration-300 ease-in-out ${
                      isCountingActive 
                        ? 'text-green-500 count-pulse-category-active' 
                        : 'text-green-600'
                    }`}
                  >
                    <CountUp 
                      end={categoryPoints.environmental} 
                      duration={2.5} 
                      separator="," 
                      delay={0.3}
                    />
                  </div>
                  <div className="text-sm uppercase font-medium tracking-wide text-green-800">Environmental</div>
                </motion.div>
                
                {/* Social Good Points - Middle layer */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    opacity: {
                      duration: 0.4,
                      delay: 0.6,
                    }
                  }}
                  className="flex flex-col justify-center items-center p-6 bg-amber-50 rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 border border-amber-100 relative z-20"
                  style={{ transform: "translateZ(10px)" }}
                >
                  <div 
                    className={`text-3xl font-bold mb-2 transition-all duration-300 ease-in-out ${
                      isCountingActive 
                        ? 'text-amber-500 count-pulse-category-active' 
                        : 'text-amber-600'
                    }`}
                  >
                    <CountUp 
                      end={categoryPoints.social} 
                      duration={2.5} 
                      separator="," 
                      delay={0.4}
                      useEasing={true}
                    />
                  </div>
                  <div className="text-sm uppercase font-medium tracking-wide text-amber-800">Social Impact</div>
                </motion.div>
                
                {/* Innovation Points - Bottom layer */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    opacity: {
                      duration: 0.4,
                      delay: 0.8,
                    }
                  }}
                  className="flex flex-col justify-center items-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 border border-blue-100 relative z-10"
                  style={{ transform: "translateZ(0px)" }}
                >
                  <div 
                    className={`text-3xl font-bold mb-2 transition-all duration-300 ease-in-out ${
                      isCountingActive 
                        ? 'text-blue-500 count-pulse-category-active' 
                        : 'text-blue-600'
                    }`}
                  >
                    <CountUp 
                      end={categoryPoints.innovation} 
                      duration={2.5} 
                      separator="," 
                      delay={0.5}
                      useEasing={true}
                    />
                  </div>
                  <div className="text-sm uppercase font-medium tracking-wide text-blue-800">Innovation</div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Forest Visualization Section */}
        <ImpactForest initiatives={userInitiatives.length} />

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