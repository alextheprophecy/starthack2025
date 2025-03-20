"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast, Toaster } from 'react-hot-toast';
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const profileRef = useRef(null);
  const isProfileInView = useInView(profileRef, { once: true });

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    position: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);
  const [section, setSection] = useState<'profile' | 'security'>('profile');
  const [formEdited, setFormEdited] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Only allow internal users to access this page
    if (user.userType !== 'internal') {
      router.push("/");
      return;
    }

    // Populate form with existing user data
    setFormData(prevData => ({
      ...prevData,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      company: user.company || "",
      position: user.position || "",
      email: user.email
    }));
  }, [user, router]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setFormEdited(true);
  };

  // Handle profile update submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form inputs
      if (!formData.firstName || !formData.lastName) {
        toast.error("First name and last name are required");
        setIsSubmitting(false);
        return;
      }

      // Update profile with new data
      const success = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        position: formData.position
      });

      if (success) {
        toast.success("Profile updated successfully");
        setFormEdited(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password update submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumbers = /\d/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers) && !hasSpecialChar) {
      toast.error("Password must contain at least 3 of the following: uppercase letters, lowercase letters, numbers, or special characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update just the password
      const success = await updateProfile({
        password: formData.newPassword
      });

      if (success) {
        toast.success("Password updated successfully");
        // Reset password fields
        setFormData(prevData => ({
          ...prevData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        // Hide password form
        setIsPasswordFormVisible(false);
      } else {
        toast.error("Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating your password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // If not logged in or not an internal user, show nothing while redirecting
  if (!user || user.userType !== 'internal') {
    return null;
  }

  // Function to determine password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    return strength;
  };
  
  // Function to get color and text for password strength
  const getPasswordStrengthInfo = (password: string) => {
    if (!password) return { color: 'bg-gray-200', text: 'Password Strength' };
    
    const strength = calculatePasswordStrength(password);
    
    if (strength <= 2) return { color: 'bg-red-500', text: 'Weak' };
    if (strength === 3) return { color: 'bg-yellow-500', text: 'Moderate' };
    if (strength === 4) return { color: 'bg-green-400', text: 'Strong' };
    return { color: 'bg-green-600', text: 'Very Strong' };
  };
  
  // Get password strength info for current password
  const passwordStrength = getPasswordStrengthInfo(formData.newPassword);
  
  // Generate user avatar initials
  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  // Virgin brand color gradient
  const virginGradient = 'from-red-500 to-red-600';

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      
      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24">
        {/* Profile header with card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1.0, 0.22, 1.0] }}
          className="relative mb-10 mt-4"
        >
          <div className="absolute inset-0 h-40 bg-gradient-to-r from-red-500/90 to-red-600 rounded-2xl"></div>
          
          <div className="relative px-4 py-5 sm:px-6 flex justify-between items-start">
            <motion.div 
              className="flex space-x-6 items-center z-10"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex-shrink-0">
                <motion.div 
                  className="relative w-20 h-20 sm:w-24 sm:h-24 shadow-lg rounded-full bg-white p-1.5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl">
                    {userInitials}
                  </div>
                </motion.div>
              </div>
              
              <div className="text-white">
                <motion.h1 
                  className="text-2xl font-bold sm:text-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email.split('@')[0]}
                </motion.h1>
                <motion.p 
                  className="text-white/90 max-w-lg font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {user?.position && user?.company
                    ? `${user.position} at ${user.company}`
                    : user?.position || user?.company || 'Virgin Internal Team'}
                </motion.p>
                <motion.p 
                  className="text-white/70 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {user?.email}
                </motion.p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-3 z-10"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <button
                onClick={() => router.push("/internal")}
                className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </button>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center gap-1 bg-white/90 hover:bg-white text-red-600 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V9.5a1 1 0 10-2 0V15H4V5h9.5a1 1 0 000-2H3z" clipRule="evenodd" />
                  <path d="M16 3a1 1 0 011 1v5.628a1 1 0 01-2 0V5.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 4H10a1 1 0 010-2h5a1 1 0 011 1z" />
                </svg>
                Logout
              </button>
            </motion.div>
          </div>
           
          {/* Profile card */}
          <motion.div 
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="relative mx-auto bg-white rounded-xl shadow-lg -mt-8 sm:mt-0 p-6 sm:p-8 z-20 max-w-5xl"
          >
            {/* Navigation tabs */}
            <div className="mb-6 sm:mb-8 border-b border-gray-200">
              <div className="flex -mb-px">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSection('profile')}
                  className={`relative py-3 px-6 border-b-2 font-medium text-sm ${
                    section === 'profile' 
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
                  {section === 'profile' && (
                    <motion.span 
                      className="absolute inset-0 bg-red-50 rounded-t-lg -z-10"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSection('security')}
                  className={`relative py-3 px-6 border-b-2 font-medium text-sm ${
                    section === 'security' 
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
                  {section === 'security' && (
                    <motion.span 
                      className="absolute inset-0 bg-red-50 rounded-t-lg -z-10"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              </div>
            </div>
            
            {/* Section content */}
            <AnimatePresence mode="wait">
              {section === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  ref={profileRef}
                >
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <motion.div variants={itemVariants} className="space-y-1">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <div className="w-0.5 h-6 bg-red-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="space-y-1">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </motion.div>
                    
                      <motion.div variants={itemVariants} className="space-y-1">
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                          Virgin Company
                        </label>
                        <select
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
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
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="space-y-1">
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                          Position
                        </label>
                        <input
                          type="text"
                          id="position"
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          placeholder="Enter your job title"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="md:col-span-2 space-y-1">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
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
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className="flex justify-end"
                    >
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !formEdited}
                        className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                          isSubmitting || !formEdited
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                        whileHover={!isSubmitting && formEdited ? { scale: 1.02, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)" } : {}}
                        whileTap={!isSubmitting && formEdited ? { scale: 0.98 } : {}}
                      >
                        {isSubmitting ? (
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
                      </motion.button>
                    </motion.div>
                  </form>
                </motion.div>
              )}
              
              {section === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-1">
                    {!isPasswordFormVisible ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-6"
                      >
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
                          <motion.button
                            type="button"
                            onClick={() => setIsPasswordFormVisible(true)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-md transition-all duration-300 flex items-center gap-2"
                            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)" }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l2.257-2.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                            </svg>
                            Change Password
                          </motion.button>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <motion.div 
                            className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                            whileHover={{ y: -4, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                          >
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <h5 className="ml-2 font-medium text-gray-800">Strong Password</h5>
                            </div>
                            <p className="text-xs text-gray-600">Use a combination of letters, numbers, and special characters</p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                            whileHover={{ y: -4, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                          >
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <h5 className="ml-2 font-medium text-gray-800">Regular Updates</h5>
                            </div>
                            <p className="text-xs text-gray-600">Change your password regularly for enhanced security</p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                            whileHover={{ y: -4, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                          >
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                              </div>
                              <h5 className="ml-2 font-medium text-gray-800">Unique Passwords</h5>
                            </div>
                            <p className="text-xs text-gray-600">Avoid using the same password for multiple accounts</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
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
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                                required
                              />
                            </div>
                            
                            {formData.newPassword && (
                              <motion.div 
                                className="mt-3"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="mb-1 flex justify-between items-center">
                                  <p className="text-xs font-medium text-gray-700">{passwordStrength.text}</p>
                                  <p className="text-xs text-gray-600">
                                    {calculatePasswordStrength(formData.newPassword)}/5
                                  </p>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div 
                                    className={`h-full ${passwordStrength.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(calculatePasswordStrength(formData.newPassword) / 5) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                  ></motion.div>
                                </div>
                                
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <motion.div 
                                    className={`px-3 py-2 rounded-lg text-xs flex items-center ${
                                      formData.newPassword.length >= 8 
                                        ? "bg-green-50 text-green-700 border border-green-100" 
                                        : "bg-gray-50 text-gray-500 border border-gray-100"
                                    }`}
                                    animate={{ 
                                      backgroundColor: formData.newPassword.length >= 8 ? "#f0fdf4" : "#f9fafb",
                                      color: formData.newPassword.length >= 8 ? "#15803d" : "#6b7280",
                                    }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${
                                      formData.newPassword.length >= 8 ? "text-green-500" : "text-gray-400"
                                    }`} viewBox="0 0 20 20" fill="currentColor">
                                      {formData.newPassword.length >= 8 ? (
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      ) : (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      )}
                                    </svg>
                                    At least 8 characters
                                  </motion.div>
                                  
                                  <motion.div 
                                    className={`px-3 py-2 rounded-lg text-xs flex items-center ${
                                      /[A-Z]/.test(formData.newPassword) 
                                        ? "bg-green-50 text-green-700 border border-green-100" 
                                        : "bg-gray-50 text-gray-500 border border-gray-100"
                                    }`}
                                    animate={{ 
                                      backgroundColor: /[A-Z]/.test(formData.newPassword) ? "#f0fdf4" : "#f9fafb",
                                      color: /[A-Z]/.test(formData.newPassword) ? "#15803d" : "#6b7280",
                                    }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${
                                      /[A-Z]/.test(formData.newPassword) ? "text-green-500" : "text-gray-400"
                                    }`} viewBox="0 0 20 20" fill="currentColor">
                                      {/[A-Z]/.test(formData.newPassword) ? (
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      ) : (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      )}
                                    </svg>
                                    Uppercase letter
                                  </motion.div>
                                  
                                  <motion.div 
                                    className={`px-3 py-2 rounded-lg text-xs flex items-center ${
                                      /[a-z]/.test(formData.newPassword) 
                                        ? "bg-green-50 text-green-700 border border-green-100" 
                                        : "bg-gray-50 text-gray-500 border border-gray-100"
                                    }`}
                                    animate={{ 
                                      backgroundColor: /[a-z]/.test(formData.newPassword) ? "#f0fdf4" : "#f9fafb",
                                      color: /[a-z]/.test(formData.newPassword) ? "#15803d" : "#6b7280",
                                    }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${
                                      /[a-z]/.test(formData.newPassword) ? "text-green-500" : "text-gray-400"
                                    }`} viewBox="0 0 20 20" fill="currentColor">
                                      {/[a-z]/.test(formData.newPassword) ? (
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      ) : (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      )}
                                    </svg>
                                    Lowercase letter
                                  </motion.div>
                                  
                                  <motion.div 
                                    className={`px-3 py-2 rounded-lg text-xs flex items-center ${
                                      /\d/.test(formData.newPassword) 
                                        ? "bg-green-50 text-green-700 border border-green-100" 
                                        : "bg-gray-50 text-gray-500 border border-gray-100"
                                    }`}
                                    animate={{ 
                                      backgroundColor: /\d/.test(formData.newPassword) ? "#f0fdf4" : "#f9fafb",
                                      color: /\d/.test(formData.newPassword) ? "#15803d" : "#6b7280",
                                    }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${
                                      /\d/.test(formData.newPassword) ? "text-green-500" : "text-gray-400"
                                    }`} viewBox="0 0 20 20" fill="currentColor">
                                      {/\d/.test(formData.newPassword) ? (
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      ) : (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      )}
                                    </svg>
                                    Number
                                  </motion.div>
                                  
                                  <motion.div 
                                    className={`px-3 py-2 rounded-lg text-xs flex items-center ${
                                      /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) 
                                        ? "bg-green-50 text-green-700 border border-green-100" 
                                        : "bg-gray-50 text-gray-500 border border-gray-100"
                                    }`}
                                    animate={{ 
                                      backgroundColor: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? "#f0fdf4" : "#f9fafb",
                                      color: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? "#15803d" : "#6b7280",
                                    }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${
                                      /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? "text-green-500" : "text-gray-400"
                                    }`} viewBox="0 0 20 20" fill="currentColor">
                                      {/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? (
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      ) : (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      )}
                                    </svg>
                                    Special character
                                  </motion.div>
                                </div>
                              </motion.div>
                            )}
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
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                                  formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-200"
                                }`}
                                required
                              />
                              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                              <motion.p 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-1 text-xs text-red-500 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Passwords don't match
                              </motion.p>
                            )}
                          </div>
                          
                          <div className="flex justify-end space-x-3 pt-2">
                            <motion.button
                              type="button"
                              onClick={() => {
                                setIsPasswordFormVisible(false);
                                setFormData(prev => ({
                                  ...prev,
                                  newPassword: "",
                                  confirmPassword: ""
                                }));
                              }}
                              className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              type="submit"
                              disabled={isSubmitting || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                              className={`px-5 py-3 rounded-lg transition-all duration-300 ${
                                isSubmitting || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-md'
                              }`}
                              whileHover={!isSubmitting && formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? { scale: 1.02, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)" } : {}}
                              whileTap={!isSubmitting && formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? { scale: 0.98 } : {}}
                            >
                              {isSubmitting ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Updating
                                </span>
                              ) : "Update Password"}
                            </motion.button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Footer with Virgin branding */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Image 
              src="/images/Virgin_Logo.png" 
              alt="Virgin Logo" 
              width={90} 
              height={38}
              className="mx-auto mb-3"
            />
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Virgin Group. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}