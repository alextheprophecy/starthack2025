"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

type Friend = {
  id: number;
  email: string;
  points: number;
};

export default function SocialsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setFriends(data.friends);
        } else {
          setError(data.message || 'Failed to fetch friends');
        }
      } catch (err) {
        setError('An error occurred while fetching friends');
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

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-red-600 mb-8 text-center">My Social Network</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg shadow-sm">
            {error}
          </div>
        ) : friends.length === 0 ? (
          <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-8 rounded-lg text-center shadow-sm">
            <p className="text-lg mb-4">You don&apos;t have any friends yet.</p>
            <p className="text-gray-600">As you participate in initiatives and connect with others, your friends will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <div 
                key={friend.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div 
                      className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors"
                      onClick={() => navigateToProfile(friend.id)}
                    >
                      <span className="text-red-600 font-bold text-lg">
                        {friend.email.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-medium">
                      {friend.points} points
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{friend.email}</h3>
                  <div className="mt-5 flex justify-end">
                    <button 
                      className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium transition-colors duration-200 cursor-pointer"
                      onClick={() => navigateToProfile(friend.id)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 