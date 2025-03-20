"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ImpactForest from '../../components/ImpactForest';

type ProfileUser = {
  id: number;
  email: string;
  points: number;
  participatedInitiatives: {
    initiativeId: number;
    dateParticipated: string;
    pointsEarned: number;
    contribution: string;
    type?: 'environmental' | 'social' | 'innovation';
  }[];
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setProfileUser(data.user);
        } else {
          setError(data.message || 'Failed to fetch user profile');
        }
      } catch (err) {
        setError('An error occurred while fetching user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [params.id, user, router]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Prepare the initiatives for the Impact Forest component
  // Assign random types for the forest visualization since the original data doesn't have types
  const prepareInitiativesForForest = (initiatives: ProfileUser['participatedInitiatives']) => {
    const types = ['environmental', 'social', 'innovation'] as const;
    
    return initiatives.map(initiative => ({
      ...initiative,
      company: 'Virgin',
      initiative: initiative.contribution,
      challenge: '',
      solution: '',
      callToAction: '',
      links: [],
      type: initiative.type || types[Math.floor(Math.random() * types.length)]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pb-16 pt-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : profileUser ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Banner and profile picture */}
            <div className="relative">
              {/* Banner */}
              <div className="h-48 bg-gradient-to-r from-red-500 to-red-700 rounded-t-xl w-full"></div>
              
              {/* Profile picture */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-red-100 flex items-center justify-center overflow-hidden">
                  <span className="text-red-600 text-4xl font-bold">
                    {profileUser.email.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* User details - with margin to clear the profile picture */}
            <div className="mt-20 text-center px-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{profileUser.email}</h1>
              <div className="inline-block bg-red-50 text-red-600 px-4 py-2 rounded-full text-lg font-medium mb-6">
                {profileUser.points} points
              </div>
              
              {/* Impact Forest */}
              {profileUser.participatedInitiatives.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Impact Forest</h2>
                  <ImpactForest 
                    initiatives={prepareInitiativesForForest(profileUser.participatedInitiatives)}
                    isProfileView={true}
                  />
                </div>
              )}
              
              {/* Initiatives */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Participated Initiatives</h2>
                
                {profileUser.participatedInitiatives.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-6 rounded-lg">
                    This user hasn&apos;t participated in any initiatives yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profileUser.participatedInitiatives.map((initiative, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 text-sm">{initiative.dateParticipated}</span>
                          <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                            {initiative.pointsEarned} points
                          </span>
                        </div>
                        <p className="text-gray-800">{initiative.contribution}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 text-gray-700 px-4 py-6 rounded-lg text-center shadow-md">
            User not found.
          </div>
        )}
      </div>
    </div>
  );
} 