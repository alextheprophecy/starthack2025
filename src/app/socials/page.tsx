"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImpactForest from '../components/ImpactForest';

type Friend = {
  id: number;
  email: string;
  points: number;
  profileImage?: string;
  environmentalCount?: number; // Number of environmental initiatives
  socialCount?: number; // Number of social initiatives
  innovationCount?: number; // Number of innovation initiatives
};

type Initiative = {
  company: string;
  initiative: string;
  challenge: string;
  solution: string;
  callToAction: string;
  links: string[];
  type: 'environmental' | 'social' | 'innovation';
  dateParticipated: string;
  pointsEarned: number;
  contribution: string;
};

// Sample fake friends data
const fakeFriends: Friend[] = [
  { id: 999, email: 'johndoe@example.com', points: 1250, profileImage: '/images/man1.jpg', environmentalCount: 8, socialCount: 5, innovationCount: 5 },
  { id: 998, email: 'sarah.smith@example.com', points: 985, profileImage: '/images/woman1.webp', environmentalCount: 1, socialCount: 8, innovationCount: 4 },
  { id: 997, email: 'tech.guru@example.com', points: 2340, profileImage: '/images/man2.jpg', environmentalCount: 0, socialCount: 5, innovationCount: 10 },
  { id: 996, email: 'eco.warrior@example.com', points: 1780, profileImage: '/images/man3.jpg', environmentalCount: 7, socialCount: 0, innovationCount: 0 },
  { id: 995, email: 'mr.wordlwide@gmail.com', points: 150, profileImage: '/images/man4.jpg', environmentalCount: 2, socialCount: 2, innovationCount: 4 },
  { id: 994, email: 'ecology.org@gmail.com', points: 23, profileImage: '/images/woman2.jpg', environmentalCount: 8, socialCount: 8, innovationCount: 0 },
  { id: 993, email: 'mrs.cooks@gmail.com', points: 500, profileImage: '/images/man1.jpg', environmentalCount: 2, socialCount: 2, innovationCount: 2 },
  { id: 992, email: 'no.picture@gmail.com', points: 500, profileImage: '', environmentalCount: 1, socialCount: 1, innovationCount: 2 },
  { id: 991, email: 'nature.lover@gmail.com', points: 500, profileImage: '/images/man3.jpg', environmentalCount: 5, socialCount: 2, innovationCount: 2 },
];

// Generate initiatives for each friend with specific counts for each type
const generateInitiatives = (
  seed: number, 
  environmentalCount: number = 0, 
  socialCount: number = 0, 
  innovationCount: number = 0
): Initiative[] => {
  const companies = ['EcoTech', 'GreenFuture', 'SocialImpact', 'TechForGood', 'CleanEnergy'];
  
  // Use the seed to create a seeded random function
  const seededRandom = (max: number, offset: number = 0) => {
    const x = Math.sin((seed + offset) * 10000);
    return (x - Math.floor(x)) * max;
  };
  
  // Create arrays for each initiative type
  const environmentalInitiatives = Array.from({ length: environmentalCount }, (_, i) => ({
    company: companies[Math.floor(seededRandom(companies.length, i))],
    initiative: `Environmental Initiative ${i + 1}`,
    challenge: 'Environmental challenge description',
    solution: 'Our solution to the environmental challenge',
    callToAction: 'Join us in making a difference',
    links: ['https://example.com'],
    type: 'environmental' as const,
    dateParticipated: new Date(Date.now() - seededRandom(10000000000, i)).toISOString().split('T')[0],
    pointsEarned: 10 + Math.floor(seededRandom(90, i + 1000)),
    contribution: 'User contribution to the environmental initiative'
  }));
  
  const socialInitiatives = Array.from({ length: socialCount }, (_, i) => ({
    company: companies[Math.floor(seededRandom(companies.length, i + 100))],
    initiative: `Social Initiative ${i + 1}`,
    challenge: 'Social challenge description',
    solution: 'Our solution to the social challenge',
    callToAction: 'Join us in making a difference',
    links: ['https://example.com'],
    type: 'social' as const,
    dateParticipated: new Date(Date.now() - seededRandom(10000000000, i + 200)).toISOString().split('T')[0],
    pointsEarned: 10 + Math.floor(seededRandom(90, i + 2000)),
    contribution: 'User contribution to the social initiative'
  }));
  
  const innovationInitiatives = Array.from({ length: innovationCount }, (_, i) => ({
    company: companies[Math.floor(seededRandom(companies.length, i + 300))],
    initiative: `Innovation Initiative ${i + 1}`,
    challenge: 'Innovation challenge description',
    solution: 'Our solution to the innovation challenge',
    callToAction: 'Join us in making a difference',
    links: ['https://example.com'],
    type: 'innovation' as const,
    dateParticipated: new Date(Date.now() - seededRandom(10000000000, i + 400)).toISOString().split('T')[0],
    pointsEarned: 10 + Math.floor(seededRandom(90, i + 3000)),
    contribution: 'User contribution to the innovation initiative'
  }));
  
  // Combine all initiatives and return
  return [...environmentalInitiatives, ...socialInitiatives, ...innovationInitiatives];
};

// Add initiatives to each friend
const friendsWithInitiatives = fakeFriends.map((friend, index) => ({
  ...friend,
  initiatives: generateInitiatives(
    friend.id + index, 
    friend.environmentalCount || 0, 
    friend.socialCount || 0, 
    friend.innovationCount || 0
  )
}));

export default function SocialsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<(Friend & { initiatives?: Initiative[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'garden'>('list');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch friends data
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/friends?email=${encodeURIComponent(user.email)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Combine real friends with fake friends
          setFriends([...friendsWithInitiatives]);
        } else {
          // If API fails but we still want to show fake friends
          setFriends(friendsWithInitiatives);
          setError(data.message || 'Failed to fetch real friends, showing demo data');
        }
      } catch (err) {
        // Show fake friends even if there's an error
        setFriends(friendsWithInitiatives);
        setError('Unable to fetch your connections, showing demo data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user, router]);

  const navigateToProfile = (id: number) => {
    router.push(`/profile/${id}`);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'garden' : 'list');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-red-600">My Friends</h1>
          <button 
            onClick={toggleViewMode}
            className="bg-white border border-red-300 hover:bg-red-50 text-red-600 font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-all duration-300 flex items-center cursor-pointer"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {viewMode === 'list' ? 'List View' : 'Forest View'}
          </button>
        </div>
        <p className="text-red-400 text-center mb-16 text-lg">Connect with friends and participate in initiatives together!</p>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        ) : friends.length === 0 ? (
          <div className="bg-white border border-red-100 rounded-xl p-10 text-center shadow-lg max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Friends Yet</h2>
            <p className="text-gray-600 mb-8">As you participate in initiatives and connect with others, your network will grow here.</p>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 cursor-pointer">
              Find People to Connect
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Connections</h2>
                <div className="ml-3 bg-red-600 text-white text-sm font-medium px-2.5 py-1 rounded-full">
                  {friends.length}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-200 cursor-pointer flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md cursor-pointer flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Friend
                </button>
              </div>
            </div>
            
            {viewMode === 'list' ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {friends.map((friend) => (
                  <div 
                    key={friend.id} 
                    className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                    onClick={() => navigateToProfile(friend.id)}
                  >
                    <div className="h-32 bg-gradient-to-r from-red-500 to-red-600 relative overflow-hidden">
                      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                        <div className="w-24 h-24 border-4 border-white rounded-full overflow-hidden bg-red-100 shadow-lg">
                          {friend.profileImage ? (
                            <Image 
                              src={friend.profileImage} 
                              alt={`${friend.email}'s profile`} 
                              width={96} 
                              height={96} 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-red-600 font-bold text-2xl">
                                {friend.email.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-16 pb-6 px-6">
                      <div className="text-center mb-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                          {friend.email.split('@')[0]}
                        </h3>
                        <p className="text-gray-500 text-sm">{friend.email}</p>
                      </div>
                      
                      <div className="flex justify-center mb-6 mt-4">
                        <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-medium flex items-center">
                          <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          {friend.points.toLocaleString()} points
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-3">
                        <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors cursor-pointer">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                        <button className="bg-red-50 hover:bg-red-100 p-2 rounded-full text-red-600 transition-colors cursor-pointer">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors cursor-pointer">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {friends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Friend Profile Section */}
                      <div className="md:w-1/3 bg-gradient-to-r from-red-50 to-white p-6">
                        <div className="flex flex-col items-center">
                          <div className="w-32 h-32 border-4 border-white rounded-full overflow-hidden bg-red-100 shadow-xl mb-4">
                            {friend.profileImage ? (
                              <Image 
                                src={friend.profileImage} 
                                alt={`${friend.email}'s profile`} 
                                width={128} 
                                height={128} 
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-red-600 font-bold text-4xl">
                                  {friend.email.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {friend.email.split('@')[0]}
                          </h3>
                          <p className="text-gray-500 text-sm mb-4">{friend.email}</p>
                          
                          <div className="bg-red-50 text-red-600 px-5 py-2 rounded-full text-sm font-bold flex items-center mb-6">
                            <svg className="h-5 w-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                            {friend.points.toLocaleString()} impact points
                          </div>
                          
                          <button 
                            onClick={() => navigateToProfile(friend.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-300 cursor-pointer"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                      
                      {/* Impact Forest Section */}
                      <div className="md:w-2/3 p-0">
                        <div className="relative h-full">
                          <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-md z-10">
                            <h4 className="text-lg font-bold text-gray-800">
                              {friend.email.split('@')[0]}&apos;s Impact Forest
                            </h4>
                          </div>
                          
                          {friend.initiatives && (
                            <ImpactForest 
                              initiatives={friend.initiatives} 
                              isProfileView={true}
                              seed={friend.id} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 