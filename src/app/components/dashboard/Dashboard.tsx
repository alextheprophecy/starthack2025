import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import InitiativeCard from './InitiativeCard';
import InitiativeDetailModal from './InitiativeDetailModal';
import InitiativeFormModal from './InitiativeFormModal';
import ImpactOverviewPanel from './ImpactOverviewPanel';
import CollaborationHub from './CollaborationHub';
import AnalyticsPanel from './AnalyticsPanel';
import {
  DashboardSection,
  EnhancedInitiative,
  Initiative,
  PROJECT_PHASES,
  REGIONS,
  THEMES,
  COMPANIES,
  UserNotification
} from '../../types/initiatives';
import {
  enhanceInitiatives,
  getDashboardLayout,
  getUserNotifications,
  getUserPreferences,
  loadInitiatives,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  saveDashboardLayout,
  saveUserPreferences
} from '../../services/initiativeService';

// Dashboard view types
enum DashboardView {
  ProjectFeed = "Dashboard",
  Analytics = "Analytics & Insights",
  ImpactOverview = "Impact Overview",
  Collaboration = "Collaboration Hub",
  Settings = "Settings & Profile"
}

// Sidebar component
const SidebarNav: React.FC<{
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any;
  logout: () => void;
  router: any;
}> = ({ 
  activeView, 
  setActiveView, 
  sidebarOpen, 
  setSidebarOpen, 
  user, 
  logout, 
  router 
}) => {
  const viewColors = {
    [DashboardView.ProjectFeed]: {bg: 'from-red-500 to-red-600', icon: 'text-red-500'},
    [DashboardView.Analytics]: {bg: 'from-red-500 to-red-600', icon: 'text-red-500'},
    [DashboardView.ImpactOverview]: {bg: 'from-red-500 to-red-600', icon: 'text-red-500'},
    [DashboardView.Collaboration]: {bg: 'from-red-500 to-red-600', icon: 'text-red-500'},
    [DashboardView.Settings]: {bg: 'from-red-500 to-red-600', icon: 'text-red-500'},
  };
  
  return (
    <motion.div 
      initial={{ x: -100 }}
      animate={{ 
        x: 0,
        width: sidebarOpen ? 280 : 80
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        width: { duration: 0.3 }
      }}
      className="fixed top-0 left-0 h-full sidebar-fixed bg-white/95 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.07)] z-40 overflow-y-auto force-gpu"
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <motion.div 
          className="p-5 flex items-center justify-between border-b border-gray-100"
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 10
              }}
            >
              <Image 
                src="/images/Virgin_Logo.png" 
                alt="Virgin Logo" 
                width={48} 
                height={20}
                className="mr-3 object-contain"
              />
            </motion.div>
            <motion.span 
              className="font-bold text-red-600 text-lg tracking-tight"
              animate={{ 
                opacity: sidebarOpen ? 1 : 0,
                x: sidebarOpen ? 0 : -20
              }}
              transition={{ duration: 0.3 }}
            >
              Virgin Internal
            </motion.span>
          </div>
          <motion.button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {sidebarOpen ? (
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              )}
            </svg>
          </motion.button>
        </motion.div>
        
        {/* Navigation Links */}
        <div className="py-6 px-3 flex-grow overflow-y-auto">
          <div className="space-y-3">
            {Object.values(DashboardView).map(view => (
              <motion.button
                key={view}
                onClick={() => setActiveView(view)}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                  activeView === view 
                    ? `text-white` 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background for active item */}
                {activeView === view && (
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${viewColors[view]?.bg || 'from-red-500 to-red-600'} -z-10`}
                    initial={{ scale: 0, borderRadius: '100%' }}
                    animate={{ scale: 1, borderRadius: '0.75rem' }}
                    exit={{ scale: 0, borderRadius: '100%' }}
                    layoutId="activeNavBackground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Icon container with animated pulse for active item */}
                <div className={`rounded-lg ${sidebarOpen ? 'mr-3' : 'mx-auto'} transition-all ${
                  activeView === view 
                    ? 'text-white' 
                    : 'text-red-500 group-hover:text-red-600'
                }`}>
                  {/* Icon based on view type */}
                  {view === DashboardView.ProjectFeed && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {view === DashboardView.ImpactOverview && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {view === DashboardView.Analytics && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {view === DashboardView.Collaboration && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {view === DashboardView.Settings && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                
                {/* Text label */}
                <motion.span 
                  className="font-medium text-sm whitespace-nowrap"
                  animate={{ 
                    opacity: sidebarOpen ? 1 : 0,
                    x: sidebarOpen ? 0 : -10,
                    display: sidebarOpen ? 'block' : 'none'
                  }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    x: { duration: 0.2 },
                    display: { delay: sidebarOpen ? 0 : 0.2 }
                  }}
                >
                  {view}
                </motion.span>
                
                {/* Active indicator dot */}
                {activeView === view && !sidebarOpen && (
                  <motion.div 
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white" 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-auto border-t border-gray-100 p-4 fixed bottom-0 left-0 bg-white/90 backdrop-blur-sm z-10" style={{ width: sidebarOpen ? '280px' : '80px' }}>
          <motion.div 
            className="flex items-center"
            whileHover={{ x: 5 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-0.5 shadow-lg">
              <div className="bg-white w-full h-full rounded-full flex items-center justify-center text-red-600 font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <motion.div 
              className="ml-3"
              animate={{ 
                opacity: sidebarOpen ? 1 : 0,
                x: sidebarOpen ? 0 : -10,
                display: sidebarOpen ? 'block' : 'none'
              }}
              transition={{ 
                opacity: { duration: 0.2 },
                x: { duration: 0.2 },
                display: { delay: sidebarOpen ? 0 : 0.2 }
              }}
            >
              <p className="font-medium text-sm text-gray-800">{user?.firstName || user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-gray-500">Internal Team</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Top Navigation Bar
const TopNavBar: React.FC<{
  activeView: DashboardView;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  notifications: UserNotification[];
  unreadNotifications: number;
  notificationDropdownOpen: boolean;
  setNotificationDropdownOpen: (open: boolean) => void;
  handleNotificationClick: (id: string) => void;
  markAllAsRead: () => void;
  user: any;
  setActiveView: (view: DashboardView) => void;
  logout: () => void;
}> = ({
  activeView,
  sidebarOpen,
  setSidebarOpen,
  notifications,
  unreadNotifications,
  notificationDropdownOpen,
  setNotificationDropdownOpen,
  handleNotificationClick,
  markAllAsRead,
  user,
  setActiveView,
  logout
}) => {
  const viewColors = {
    [DashboardView.ProjectFeed]: {bg: 'from-red-500 to-red-600', text: 'text-red-600'},
    [DashboardView.Analytics]: {bg: 'from-red-500 to-red-600', text: 'text-red-600'},
    [DashboardView.ImpactOverview]: {bg: 'from-red-500 to-red-600', text: 'text-red-600'},
    [DashboardView.Collaboration]: {bg: 'from-red-500 to-red-600', text: 'text-red-600'},
    [DashboardView.Settings]: {bg: 'from-red-500 to-red-600', text: 'text-red-600'},
  };
  
  return (
    <motion.div 
      className="fixed top-0 z-30 w-full pointer-events-none force-gpu"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
    >
      <div className="h-16 bg-white/95 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.05)] border-b border-gray-100 fixed top-0 left-0 right-0 z-40 force-gpu">
        <div className="container mx-auto h-full flex justify-between items-center py-3 px-4 pointer-events-auto">
          {/* Left section with menu button and title */}
          <div className="flex items-center">
            <motion.button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-gray-100 mr-3 flex items-center justify-center"
              aria-label="Toggle sidebar"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
            
            {/* Page title removed as requested */}
          </div>
          
          {/* Right section with search, notifications, etc */}
          <div className="flex items-center space-x-3">
            {/* Search bar removed as requested */}
            
            {/* Quick action buttons */}
            <motion.button
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors hidden md:flex"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </motion.button>
            
            {/* Notifications */}
            <div className="relative">
              <motion.button 
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors relative"
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                aria-label="Notifications"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                
                {unreadNotifications > 0 && (
                  <motion.span 
                    className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {unreadNotifications}
                  </motion.span>
                )}
              </motion.button>
              
              {/* Notification dropdown */}
              <AnimatePresence>
                {notificationDropdownOpen && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-xl border border-gray-100 z-20 overflow-hidden"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">
                          {unreadNotifications} new
                        </span>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div>
                          {notifications.map(notification => (
                            <motion.div 
                              key={notification.id}
                              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-red-50/50' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification.id)}
                              whileHover={{ x: 5 }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-start">
                                <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${
                                  !notification.read ? 'bg-red-500' : 'bg-gray-300'
                                }`} />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800 font-medium">{notification.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.date).toLocaleString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 px-4 text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500 text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                      <motion.button 
                        className="text-sm text-gray-600 hover:text-gray-800"
                        onClick={() => setNotificationDropdownOpen(false)}
                        whileHover={{ scale: 1.05 }}
                      >
                        Close
                      </motion.button>
                      <motion.button 
                        className="text-sm text-red-600 hover:text-red-800"
                        onClick={markAllAsRead}
                        whileHover={{ scale: 1.05 }}
                      >
                        Mark all as read
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Create new button removed */}
            
            {/* Profile button */}
            <div className="relative">
              <motion.button 
                className="p-1 rounded-full border-2 border-gray-100 hover:border-gray-200 focus:outline-none transition-colors overflow-hidden"
                onClick={() => {
                  const isSettingsView = activeView === DashboardView.Settings;
                  if (isSettingsView) {
                    logout();
                  } else {
                    setActiveView(DashboardView.Settings);
                  }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab bar for breadcrumbs or sub-navigation - can be added later */}
    </motion.div>
  );
};

// Filter and search component
const FilterSearchBar: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedPhase: string;
  setSelectedPhase: (phase: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}> = ({
  searchQuery,
  setSearchQuery,
  selectedTheme,
  setSelectedTheme,
  selectedRegion,
  setSelectedRegion,
  selectedPhase,
  setSelectedPhase,
  sortBy,
  setSortBy
}) => (
  <div className="bg-white rounded-xl shadow-md p-4 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="md:col-span-2">
        <input
          type="text"
          placeholder="Search initiatives, companies, or challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <select 
        value={selectedTheme} 
        onChange={(e) => setSelectedTheme(e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
      >
        <option value="All">All Themes</option>
        {THEMES.map(theme => (
          <option key={theme} value={theme}>{theme}</option>
        ))}
      </select>
      
      <select 
        value={selectedRegion} 
        onChange={(e) => setSelectedRegion(e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
      >
        <option value="All">All Regions</option>
        {REGIONS.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>
      
      <select 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
      >
        <option value="recent">Most Recent</option>
        <option value="impact">Highest Impact</option>
        <option value="alphabetical">Alphabetical</option>
      </select>
    </div>
  </div>
);

// Dashboard Tabs component removed as requested

// Main Dashboard component
interface DashboardProps {
  initialView?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ initialView }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Data state
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [enhancedInitiativesData, setEnhancedInitiativesData] = useState<EnhancedInitiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const getInitialView = (): DashboardView => {
    if (initialView === 'analytics') {
      return DashboardView.Analytics;
    } else if (initialView === 'impact') {
      return DashboardView.ImpactOverview;
    } else if (initialView === 'collaboration') {
      return DashboardView.Collaboration;
    } else if (initialView === 'settings') {
      return DashboardView.Settings;
    }
    return DashboardView.ProjectFeed;
  };
  
  const [activeView, setActiveView] = useState<DashboardView>(getInitialView());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedPhase, setSelectedPhase] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  // Profile settings state
  const [profileFormData, setProfileFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    company: user?.company || "",
    position: user?.position || "",
    email: user?.email || "",
  });
  const [isFormEdited, setIsFormEdited] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'security'>('profile');
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);
  
  // Modal states
  const [selectedInitiative, setSelectedInitiative] = useState<EnhancedInitiative | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentInitiative, setCurrentInitiative] = useState<EnhancedInitiative | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    initiative: '',
    challenge: '',
    solution: '',
    callToAction: '',
    links: '',
    theme: THEMES[0],
    region: REGIONS[0],
    phase: PROJECT_PHASES[0],
    impactScore: 0
  });
  
  // PDF upload states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    // Auth check
    if (!user) {
      router.push("/login");
      return;
    } else if (user.userType !== 'internal') {
      router.push("/");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load initiatives
        const loadedInitiatives = await loadInitiatives();
        setInitiatives(loadedInitiatives);
        
        // Enhance initiatives with additional data
        const enhancedData = enhanceInitiatives(loadedInitiatives);
        setEnhancedInitiativesData(enhancedData);
        
        // Load user preferences
        const preferences = getUserPreferences();
        if (preferences) {
          setSelectedTheme(preferences.theme);
          setSelectedRegion(preferences.region);
          setSelectedPhase(preferences.phase);
          setSortBy(preferences.sortBy);
          setActiveView(preferences.view as DashboardView);
        }
        
        // Load notifications
        const userNotifications = getUserNotifications();
        setNotifications(userNotifications);
        setUnreadNotifications(userNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, router]);
  
  // Update profile form data when user changes
  useEffect(() => {
    if (user) {
      setProfileFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        company: user.company || "",
        position: user.position || "",
        email: user.email || "",
      });
    }
  }, [user]);
  
  // Profile form handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsFormEdited(true);
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSubmitting(true);
    
    try {
      if (!profileFormData.firstName || !profileFormData.lastName) {
        toast.error("First name and last name are required");
        setIsProfileSubmitting(false);
        return;
      }
      
      const success = await updateProfile({
        firstName: profileFormData.firstName,
        lastName: profileFormData.lastName,
        company: profileFormData.company,
        position: profileFormData.position
      });
      
      if (success) {
        toast.success("Profile updated successfully");
        setIsFormEdited(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsProfileSubmitting(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsProfileSubmitting(true);
    
    try {
      const success = await updateProfile({
        password: passwordData.newPassword
      });
      
      if (success) {
        toast.success("Password updated successfully");
        setPasswordData({
          newPassword: "",
          confirmPassword: ""
        });
        setIsPasswordFormVisible(false);
      } else {
        toast.error("Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating your password");
    } finally {
      setIsProfileSubmitting(false);
    }
  };
  
  // Save preferences when they change
  useEffect(() => {
    const preferences = getUserPreferences();
    saveUserPreferences({
      ...preferences,
      theme: selectedTheme,
      region: selectedRegion,
      phase: selectedPhase,
      sortBy,
      view: activeView
    });
  }, [selectedTheme, selectedRegion, selectedPhase, sortBy, activeView]);
  
  // Filter and sort initiatives based on user selections
  const filteredInitiatives = useMemo(() => {
    return enhancedInitiativesData
      .filter(initiative => {
        const matchesSearch = searchQuery === "" || 
          initiative["Initiaitive"].toLowerCase().includes(searchQuery.toLowerCase()) ||
          initiative["Virgin Company"].toLowerCase().includes(searchQuery.toLowerCase()) ||
          initiative["Challenge"].toLowerCase().includes(searchQuery.toLowerCase());
          
        const matchesTheme = selectedTheme === "All" || initiative.theme === selectedTheme;
        const matchesRegion = selectedRegion === "All" || initiative.region === selectedRegion;
        const matchesPhase = selectedPhase === "All" || initiative.phase === selectedPhase;
        
        return matchesSearch && matchesTheme && matchesRegion && matchesPhase;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "recent":
            return new Date(b.lastUpdated || "").getTime() - new Date(a.lastUpdated || "").getTime();
          case "impact":
            return (b.impactScore || 0) - (a.impactScore || 0);
          case "alphabetical":
            return a["Initiaitive"].localeCompare(b["Initiaitive"]);
          default:
            return 0;
        }
      });
  }, [enhancedInitiativesData, searchQuery, selectedTheme, selectedRegion, selectedPhase, sortBy]);
  
  // Handle notification click
  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadNotifications(prev => Math.max(0, prev - 1));
    setNotificationDropdownOpen(false);
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    markAllNotificationsAsRead();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadNotifications(0);
  };
  
  // initiativesByTheme aggregation removed as it was only used by Project Catalog
  
  // Calculate aggregated impact data
  const impactData = useMemo(() => {
    const totalInitiatives = initiatives.length;
    const initiativesByTheme = THEMES.map(theme => {
      const count = initiatives.filter(i => i.theme === theme).length;
      return { theme, count, percentage: totalInitiatives ? (count / totalInitiatives) * 100 : 0 };
    }).sort((a, b) => b.count - a.count);
    
    const averageImpactScore = initiatives.reduce((acc, curr) => acc + (curr.impactScore || 0), 0) / 
                              (initiatives.length || 1);
    
    const totalPeopleImpacted = initiatives.reduce(
      (acc, curr) => acc + (typeof curr.metrics?.peopleImpacted === 'number' ? curr.metrics.peopleImpacted : 0), 
      0
    );
    
    return {
      totalInitiatives,
      initiativesByTheme,
      averageImpactScore,
      totalPeopleImpacted
    };
  }, [initiatives]);
  
  // Dashboard View (formerly Project Feed)
  const ProjectFeedView = () => (
    <div>
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-2xl shadow-xl mb-8"
      >
        <div className="absolute top-0 right-0 w-2/3 h-full overflow-hidden opacity-20">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 1, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              repeatType: "mirror"
            }}
            className="w-full h-full"
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-white">
              <path d="M40.2,-65.4C50.7,-56.7,57.4,-43.4,63.2,-30C69,-16.6,73.9,-3.2,73.7,10.3C73.5,23.7,68.2,37.2,58.8,47.6C49.4,58,35.8,65.4,21.3,70.3C6.9,75.3,-8.4,77.9,-21.7,73.7C-35,69.6,-46.4,58.7,-54.4,46.4C-62.4,34.1,-67,20.4,-68.9,6.3C-70.8,-7.9,-69.9,-22.5,-63.1,-33.7C-56.2,-44.9,-43.4,-52.7,-30.8,-60.2C-18.2,-67.6,-5.7,-74.7,6.9,-75.5C19.5,-76.3,29.7,-74,40.2,-65.4Z" transform="translate(100 100)" />
            </svg>
          </motion.div>
        </div>

        <div className="px-8 py-10 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                  Welcome, {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-white/90 text-lg">
                  Track and manage initiatives across Virgin companies
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-3 gap-4 mt-8"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-white">{enhancedInitiativesData.length}</p>
                    <p className="text-sm text-white/80">Total Initiatives</p>
                  </motion.div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {enhancedInitiativesData.filter(i => i.status === 'active' || i.phase === 'Active').length}
                    </p>
                    <p className="text-sm text-white/80">Active Projects</p>
                  </motion.div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.round(impactData.averageImpactScore * 10) / 10}</p>
                    <p className="text-sm text-white/80">Avg. Impact Score</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center justify-center relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: 0.3
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-xl opacity-70"></div>
                <Image 
                  src="/images/Virgin_Logo.png" 
                  alt="Virgin Logo" 
                  width={250}
                  height={125}
                  className="relative z-10 drop-shadow-lg"
                />
              </motion.div>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                onClick={() => setIsAddModalOpen(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.98 }}
                className="absolute bottom-0 right-0 flex items-center gap-2 bg-white text-red-600 font-semibold py-3 px-5 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Initiative
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Initiatives */}
        <div className="lg:col-span-3 space-y-8">
          {/* Search and Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-5 border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search initiatives, companies, or challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>
              
              <select 
                value={selectedTheme} 
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                <option value="All">All Themes</option>
                {THEMES.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
              
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                <option value="All">All Regions</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="impact">Highest Impact</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </motion.div>
          
          {/* Featured Initiative */}
          {filteredInitiatives.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="grid md:grid-cols-2 gap-0">
                  <div 
                    className="h-64 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)), url(${filteredInitiatives[0]["Virgin Company"].includes("Atlantic") ? "/images/plane.jpg" : 
                        filteredInitiatives[0]["Virgin Company"].includes("Galactic") ? "/images/rocket.jpg" : "/images/Virgin_Logo.png"})`
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {filteredInitiatives[0].theme && (
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"
                          >
                            {filteredInitiatives[0].theme}
                          </motion.span>
                        )}
                        {filteredInitiatives[0].region && (
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                          >
                            {filteredInitiatives[0].region}
                          </motion.span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-white">{filteredInitiatives[0]["Initiaitive"]}</h2>
                      <p className="text-white/80">{filteredInitiatives[0]["Virgin Company"]}</p>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-gray-700 mb-4 line-clamp-3">{filteredInitiatives[0]["Challenge"]}</p>
                      {filteredInitiatives[0].impactScore && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${(filteredInitiatives[0].impactScore / 100) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-red-600">Impact: {filteredInitiatives[0].impactScore}</span>
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedInitiative(filteredInitiatives[0])}
                      className="mt-4 text-red-600 font-semibold py-2 px-4 rounded-lg border border-red-200 hover:bg-red-50 transition-colors self-start"
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Initiative Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInitiatives.slice(1).map((initiative, index) => (
              <motion.div
                key={initiative.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.05) }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <InitiativeCard 
                  initiative={initiative} 
                  enhanced={true}
                  onClick={() => setSelectedInitiative(initiative)}
                  className="h-full"
                />
              </motion.div>
            ))}
            
            {filteredInitiatives.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center p-12 bg-white rounded-xl shadow-lg col-span-full border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No initiatives found</h3>
                <p className="text-gray-500">Try adjusting your search filters or clear your search</p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTheme("All");
                    setSelectedRegion("All");
                    setSelectedPhase("All");
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Right Column - Sidebar Widgets */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Dashboard Insights
            </h3>
            
            <div className="space-y-6">
              {/* Recent Updates Widget */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-red-50 to-white p-5 rounded-xl border border-red-100"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Updates
                </h4>
                <div className="space-y-3">
                  {enhancedInitiativesData
                    .sort((a, b) => new Date(b.lastUpdated || "").getTime() - new Date(a.lastUpdated || "").getTime())
                    .slice(0, 3)
                    .map((initiative, idx) => (
                      <motion.div 
                        key={initiative.uid} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + (idx * 0.1) }}
                        whileHover={{ x: 2 }}
                        className="flex items-start hover:bg-red-50/50 p-2 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setSelectedInitiative(initiative)}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{initiative["Initiaitive"]}</p>
                          <p className="text-gray-500 text-xs">
                            Updated {initiative.lastUpdated ? new Date(initiative.lastUpdated).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
              
              {/* Impact Leaders Widget */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-100"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Impact Leaders
                </h4>
                <div className="space-y-3">
                  {enhancedInitiativesData
                    .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0))
                    .slice(0, 3)
                    .map((initiative, idx) => (
                      <motion.div 
                        key={initiative.uid} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + (idx * 0.1) }}
                        whileHover={{ x: 2 }}
                        className="flex items-center hover:bg-purple-50/50 p-2 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setSelectedInitiative(initiative)}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                          {idx + 1}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-gray-800 line-clamp-1">{initiative["Initiaitive"]}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-full bg-gray-200 h-1.5 rounded-full mr-2">
                              <div 
                                className="h-1.5 rounded-full bg-purple-500"
                                style={{ width: `${(initiative.impactScore || 0) / 100 * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                              {initiative.impactScore || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
              
              {/* Theme Filters Widget */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Quick Filters
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.slice(0, 6).map((theme, idx) => (
                    <motion.button
                      key={theme}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + (idx * 0.05) }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedTheme(selectedTheme === theme ? "All" : theme)}
                      className={`text-xs p-2 rounded-lg transition-all ${
                        selectedTheme === theme 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {theme.split(" ")[0]}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
              
              {/* Upcoming Milestones Widget */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upcoming Milestones
                </h4>
                <div className="space-y-3">
                  {enhancedInitiativesData
                    .flatMap(initiative => 
                      initiative.milestones?.filter(m => 
                        m.status !== 'completed' && 
                        new Date(m.dueDate) > new Date()
                      ).map(m => ({
                        ...m,
                        initiativeName: initiative["Initiaitive"],
                        initiativeId: initiative.uid,
                        initiative: initiative
                      })) || []
                    )
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 3)
                    .map((milestone, idx) => {
                      // Calculate days until due
                      const dueDate = new Date(milestone.dueDate);
                      const today = new Date();
                      const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      
                      let urgencyColor = "bg-green-500";
                      if (daysUntilDue < 3) urgencyColor = "bg-red-500";
                      else if (daysUntilDue < 7) urgencyColor = "bg-orange-500";
                      else if (daysUntilDue < 14) urgencyColor = "bg-yellow-500";

                      return (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 + (idx * 0.1) }}
                          whileHover={{ x: 2 }}
                          className="hover:bg-green-50/50 p-2 rounded-lg transition-colors cursor-pointer"
                          onClick={() => setSelectedInitiative(milestone.initiative)}
                        >
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${urgencyColor} mr-2`}></div>
                            <p className="font-medium text-gray-800 line-clamp-1">{milestone.title}</p>
                          </div>
                          <div className="mt-1 flex justify-between">
                            <p className="text-gray-500 text-xs line-clamp-1">
                              {milestone.initiativeName}
                            </p>
                            <p className="text-xs font-medium whitespace-nowrap">
                              {daysUntilDue === 0 ? (
                                <span className="text-red-600">Due today</span>
                              ) : daysUntilDue === 1 ? (
                                <span className="text-red-600">Due tomorrow</span>
                              ) : daysUntilDue < 0 ? (
                                <span className="text-red-600">Overdue</span>
                              ) : (
                                <span className="text-gray-600">In {daysUntilDue} days</span>
                              )}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
  
  // Project Catalog View removed as requested
  
  // Render function for active content
  const renderActiveContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }
    
    switch (activeView) {
      case DashboardView.ProjectFeed:
        return <ProjectFeedView />;
      case DashboardView.ImpactOverview:
        return <ImpactOverviewPanel initiatives={enhancedInitiativesData} impactData={impactData} />;
      // AddNew case removed
      case DashboardView.Analytics:
        return <AnalyticsPanel initiatives={enhancedInitiativesData} impactData={impactData} />;
      case DashboardView.Collaboration:
        return <CollaborationHub />;
      // ProjectSubmission case removed
      case DashboardView.Settings:
        // Generate user avatar initials
        const userInitials = user?.firstName && user?.lastName
          ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
          : user?.email?.[0]?.toUpperCase() || 'U';
        
        return (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {userInitials}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email.split('@')[0]}
                </h2>
                <p className="text-gray-600 flex items-center">
                  {user?.position && user?.company
                    ? `${user.position} at ${user.company}`
                    : user?.position || user?.company || 'Virgin Internal Team'}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            {/* Navigation tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex -mb-px">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`py-3 px-6 border-b-2 font-medium text-sm ${
                    activeSection === 'profile' 
                      ? 'border-red-600 text-red-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Personal Information
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className={`py-3 px-6 border-b-2 font-medium text-sm ${
                    activeSection === 'security' 
                      ? 'border-red-600 text-red-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Security
                  </div>
                </button>
              </div>
            </div>
            
            {/* Profile section */}
            {activeSection === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileFormData.firstName}
                      onChange={handleProfileChange}
                      placeholder="Enter your first name"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileFormData.lastName}
                      onChange={handleProfileChange}
                      placeholder="Enter your last name"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                
                  <div className="space-y-1">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Virgin Company
                    </label>
                    <select
                      id="company"
                      name="company"
                      value={profileFormData.company}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a company</option>
                      <option value="Virgin Atlantic">Virgin Atlantic</option>
                      <option value="Virgin Media O2">Virgin Media O2</option>
                      <option value="Virgin Voyages">Virgin Voyages</option>
                      <option value="Virgin Limited Edition">Virgin Limited Edition</option>
                      <option value="Virgin Unite">Virgin Unite</option>
                      <option value="Virgin Group">Virgin Group</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={profileFormData.position}
                      onChange={handleProfileChange}
                      placeholder="Enter your job title"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileFormData.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                  <button 
                    type="button"
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V9.5a1 1 0 10-2 0V15H4V5h9.5a1 1 0 000-2H3z" clipRule="evenodd" />
                      <path d="M16 3a1 1 0 011 1v5.628a1 1 0 01-2 0V5.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 4H10a1 1 0 010-2h5a1 1 0 011 1z" />
                    </svg>
                    Logout
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isProfileSubmitting || !isFormEdited}
                    className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                      isProfileSubmitting || !isFormEdited
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-md'
                    }`}
                  >
                    {isProfileSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {/* Security section */}
            {activeSection === 'security' && (
              <div className="p-1">
                {!isPasswordFormVisible ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Password Security
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Enhance your account security by updating your password regularly</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPasswordFormVisible(true)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-md transition-all duration-300 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l2.257-2.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                        Change Password
                      </button>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h5 className="ml-2 font-medium text-gray-800">Strong Password</h5>
                        </div>
                        <p className="text-xs text-gray-600">Use a combination of letters, numbers, and special characters</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h5 className="ml-2 font-medium text-gray-800">Regular Updates</h5>
                        </div>
                        <p className="text-xs text-gray-600">Change your password regularly for enhanced security</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                          </div>
                          <h5 className="ml-2 font-medium text-gray-800">Unique Passwords</h5>
                        </div>
                        <p className="text-xs text-gray-600">Avoid using the same password for multiple accounts</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <h4 className="font-medium text-red-800">Password Requirements</h4>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1 pl-4">
                        <li>At least 8 characters long</li>
                        <li>Include at least 3 of the following: uppercase letters, lowercase letters, numbers, special characters</li>
                        <li>Should not be a commonly used password</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                            passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                          required
                        />
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Passwords don't match
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPasswordFormVisible(false);
                          setPasswordData({
                            newPassword: "",
                            confirmPassword: ""
                          });
                        }}
                        className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isProfileSubmitting || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                        className={`px-5 py-3 rounded-lg transition-all duration-300 ${
                          isProfileSubmitting || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-md'
                        }`}
                      >
                        {isProfileSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating
                          </span>
                        ) : "Update Password"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        );
      default:
        return <ProjectFeedView />;
    }
  };

  if (!user || user.userType !== 'internal') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white force-gpu">
      <Toaster position="top-right" />
      {/* Sidebar Navigation */}
      <SidebarNav 
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
        router={router}
      />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main Content Area */}
      <motion.div 
        className="min-h-screen w-full"
        style={{ 
          paddingLeft: sidebarOpen ? '280px' : '80px',
          paddingTop: '4rem'
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30
        }}
      >
        {/* Top Navigation Bar */}
        <TopNavBar 
          activeView={activeView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          unreadNotifications={unreadNotifications}
          notificationDropdownOpen={notificationDropdownOpen}
          setNotificationDropdownOpen={setNotificationDropdownOpen}
          handleNotificationClick={handleNotificationClick}
          markAllAsRead={markAllAsRead}
          user={user}
          setActiveView={setActiveView}
          logout={logout}
        />
        
        {/* Main Content */}
        <motion.main 
          className="container mx-auto px-6 py-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
          key={activeView} // This forces re-animation when view changes
          layoutId="mainContent"
        >
          {/* Render active content */}
          {renderActiveContent()}
        </motion.main>
      </motion.div>
      
      {/* Initiative Detail Modal */}
      <AnimatePresence>
        {selectedInitiative && (
          <InitiativeDetailModal 
            initiative={selectedInitiative} 
            onClose={() => setSelectedInitiative(null)} 
            onEdit={() => {
              setCurrentInitiative(selectedInitiative);
              setFormData({
                company: selectedInitiative["Virgin Company"],
                initiative: selectedInitiative["Initiaitive"],
                challenge: selectedInitiative["Challenge"],
                solution: selectedInitiative["What Virgin is doing"],
                callToAction: selectedInitiative["Call to Action"],
                links: selectedInitiative["Links"],
                theme: selectedInitiative.theme || THEMES[0],
                region: selectedInitiative.region || REGIONS[0],
                phase: selectedInitiative.phase || PROJECT_PHASES[0],
                impactScore: selectedInitiative.impactScore || 0
              });
              setSelectedInitiative(null);
              setIsEditModalOpen(true);
            }}
            onDelete={() => {
              setCurrentInitiative(selectedInitiative);
              setSelectedInitiative(null);
              setIsDeleteModalOpen(true);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Initiative Form Modal (for both Add and Edit) */}
      <InitiativeFormModal 
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setCurrentInitiative(null);
        }}
        mode={isAddModalOpen ? 'create' : 'edit'}
        initialData={isEditModalOpen && currentInitiative ? {
          company: currentInitiative["Virgin Company"],
          initiative: currentInitiative["Initiaitive"],
          challenge: currentInitiative["Challenge"],
          solution: currentInitiative["What Virgin is doing"],
          callToAction: currentInitiative["Call to Action"],
          links: currentInitiative["Links"],
          theme: currentInitiative.theme || THEMES[0],
          region: currentInitiative.region || REGIONS[0],
          phase: currentInitiative.phase || PROJECT_PHASES[0],
          impactScore: currentInitiative.impactScore || 0
        } : undefined}
        onSubmit={(formData) => {
          if (isAddModalOpen) {
            // Create new initiative
            const newInitiative: Initiative = {
              uid: `init-${Date.now()}`,
              "Virgin Company": formData.company,
              "Initiaitive": formData.initiative,
              "Challenge": formData.challenge,
              "What Virgin is doing": formData.solution,
              "Call to Action": formData.callToAction,
              "Links": formData.links,
              theme: formData.theme,
              region: formData.region,
              phase: formData.phase,
              impactScore: formData.impactScore,
              lastUpdated: new Date().toISOString()
            };
            
            // Add to initiatives state
            setInitiatives([...initiatives, newInitiative]);
            
            // Create an enhanced initiative
            const enhanced = enhanceInitiatives([newInitiative])[0];
            setEnhancedInitiativesData([...enhancedInitiativesData, enhanced]);
            
            // Reset form and close modal
            setPdfFile(null);
            setIsAddModalOpen(false);
          } else if (isEditModalOpen && currentInitiative) {
            // Update initiative data
            const updatedInitiative: Initiative = {
              ...currentInitiative,
              "Virgin Company": formData.company,
              "Initiaitive": formData.initiative,
              "Challenge": formData.challenge,
              "What Virgin is doing": formData.solution,
              "Call to Action": formData.callToAction,
              "Links": formData.links,
              theme: formData.theme,
              region: formData.region,
              phase: formData.phase,
              impactScore: formData.impactScore,
              lastUpdated: new Date().toISOString()
            };
            
            // Update initiatives state
            setInitiatives(initiatives.map(i => i.uid === currentInitiative.uid ? updatedInitiative : i));
            
            // Update enhanced initiatives state
            const updatedEnhanced = enhanceInitiatives([updatedInitiative])[0];
            setEnhancedInitiativesData(
              enhancedInitiativesData.map(i => i.uid === currentInitiative.uid ? updatedEnhanced : i)
            );
            
            // Reset current initiative and close modal
            setCurrentInitiative(null);
            setIsEditModalOpen(false);
          }
        }}
      />
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && currentInitiative && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Initiative</h2>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete &quot;{currentInitiative["Initiaitive"]}&quot;? This action cannot be undone.
                </p>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setCurrentInitiative(null);
                      setIsDeleteModalOpen(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Delete from initiatives state
                      const filteredInitiatives = initiatives.filter(
                        i => i.uid !== currentInitiative.uid
                      );
                      setInitiatives(filteredInitiatives);
                      
                      // Delete from enhanced initiatives
                      const filteredEnhanced = enhancedInitiativesData.filter(
                        i => i.uid !== currentInitiative.uid
                      );
                      setEnhancedInitiativesData(filteredEnhanced);
                      
                      // Reset and close modal
                      setCurrentInitiative(null);
                      setIsDeleteModalOpen(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;