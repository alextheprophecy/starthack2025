"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingNavbar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
    setDropdownOpen(false);
  };

  const handleMyInitiatives = () => {
    router.push("/my-initiatives");
    setDropdownOpen(false);
  };

  return (
    <>
      {/* Floating navbar */}
      <div className="fixed top-4 left-0 right-0 z-50 mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.2)] py-1 px-3 flex items-center justify-between relative before:absolute before:content-[''] before:inset-[4px] before:rounded-[22px] before:border before:border-red-600 before:pointer-events-none">
          {/* Left section with Initiatives button */}
          <div className="w-1/3"></div>
          
          {/* Center section with clickable logo */}
          <div className="w-1/3 flex justify-center">
            <button 
              onClick={() => router.push("/")}
              className="focus:outline-none"
              aria-label="Go to home page"
            >
              <Image 
                src="/images/Virgin_Logo.png" 
                alt="Virgin Logo" 
                width={60} 
                height={25}
                className="object-contain"
              />
            </button>
          </div>
          
          {/* Right section */}
          <div className="w-1/3 flex justify-end items-center pr-2">
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center p-1 text-gray-700 hover:text-red-600 transition-colors"
                  aria-expanded={dropdownOpen}
                  aria-label="User profile menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      className="absolute left-0 top-full mt-6 w-40 bg-white dark:bg-white rounded-xl shadow-lg py-2 z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <button 
                        onClick={handleMyInitiatives}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        My Initiatives
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingNavbar; 