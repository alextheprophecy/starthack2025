"use client";

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(true);
  
  // Set rendering state based on path - hooks must be called unconditionally
  useEffect(() => {
    setShouldRender(pathname !== '/internal' && !pathname.includes('/dashboard'));
  }, [pathname]);
  
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
  
  const handleProfileClick = () => {
    router.push("/profile");
    setDropdownOpen(false);
  };

  // Don't render anything if we're on the internal page
  if (!shouldRender) {
    return null;
  }
  
  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 mx-auto force-gpu"
    >
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-lg shadow-[0_0_25px_rgba(0,0,0,0.12)] py-2 px-4 border-b border-gray-100 force-gpu">
        <div className="flex items-center justify-between">
          {/* Left section - quick actions */}
          <div className="flex items-center space-x-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              onClick={() => router.push("/")}
              aria-label="Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              onClick={() => router.push("/analytics")}
              aria-label="Analytics"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              onClick={() => router.push("/customer")}
              aria-label="Customer View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </motion.button>
          </div>
          
          {/* Center section with animated logo */}
          <motion.div 
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.button 
              onClick={() => router.push("/")}
              className="focus:outline-none relative group"
              aria-label="Go to home page"
              whileHover="hover"
            >
              <motion.div
                className="absolute -inset-3 rounded-full bg-gradient-to-tr from-red-600/20 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              />
              <div className="relative">
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 180 }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Image 
                    src="/images/Virgin_Logo.png" 
                    alt="Virgin Logo" 
                    width={70} 
                    height={30}
                    className="object-contain"
                  />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
          
          {/* Right section with user profile */}
          <div className="flex items-center space-x-2">
            {/* Notifications Bell */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all relative"
              aria-label="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center"
              >
                3
              </motion.span>
            </motion.button>
            
            {/* User profile dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <motion.button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-md transition-all"
                  aria-expanded={dropdownOpen}
                  aria-label="User profile menu"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex h-6 w-6 rounded-full items-center justify-center bg-white/20 text-white font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </motion.button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-10 border border-gray-100"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <div className="px-4 py-2 border-b border-gray-100 mb-2">
                        <p className="font-medium text-gray-800">{user?.firstName || user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {user.userType === 'internal' && (
                        <motion.button 
                          onClick={handleProfileClick}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                          whileHover={{ x: 5 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Profile
                        </motion.button>
                      )}
                      
                      {user.userType === 'external' && (
                        <motion.button 
                          onClick={handleMyInitiatives}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                          whileHover={{ x: 5 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                          </svg>
                          My Initiatives
                        </motion.button>
                      )}
                      
                      <motion.button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                        whileHover={{ x: 5 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2V2l5 5h-5z" clipRule="evenodd" />
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Logout
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingNavbar;