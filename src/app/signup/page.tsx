"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'external' | 'internal'>('external');
  
  const { signup, user } = useAuth();
  const router = useRouter();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.userType === 'internal') {
        router.push("/internal");
      } else {
        router.push("/");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      setError("");
      setLoading(true);
      const success = await signup(email, password, userType);
      
      if (success) {
        // Redirect based on user type
        if (userType === 'internal') {
          window.location.href = "/internal";
        } else {
          window.location.href = "/";
        }
      } else {
        setError("Failed to create an account. Email may already be in use.");
      }
    } catch (err) {
      setError("Failed to create account. The server may be unavailable.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleUserType = () => {
    setUserType(userType === 'external' ? 'internal' : 'external');
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">Sign Up</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>
        
        {error && <div className="p-3 bg-red-100 text-red-600 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between my-4">
            <label className="flex items-center">
              <span className="mr-2 text-sm text-gray-700">User Mode:</span>
              <div
                onClick={toggleUserType}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  userType === 'internal' ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    userType === 'internal' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {userType === 'internal' ? 'Internal Employee' : 'External User'}
              </span>
            </label>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 