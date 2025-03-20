import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { EnhancedInitiative } from '../../types/initiatives';

interface CustomerDashboardProps {
  initiatives: EnhancedInitiative[];
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ initiatives }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [activeInitiative, setActiveInitiative] = useState<EnhancedInitiative | null>(null);
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Extract unique themes and companies
  const themes = ['All', ...Array.from(new Set(initiatives.map(i => i.theme).filter(Boolean)))];
  const companies = ['All', ...Array.from(new Set(initiatives.map(i => i["Virgin Company"]).filter(Boolean)))];
  
  // Filter initiatives based on search and filters
  const filteredInitiatives = initiatives.filter(initiative => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      (initiative.Initiaitive?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       initiative.theme?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       initiative["Virgin Company"]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       initiative.Challenge?.toLowerCase().includes(searchQuery.toLowerCase()));
       
    // Theme filter
    const matchesTheme = selectedTheme === 'All' || initiative.theme === selectedTheme;
    
    // Company filter
    const matchesCompany = selectedCompany === 'All' || initiative["Virgin Company"] === selectedCompany;
    
    return matchesSearch && matchesTheme && matchesCompany;
  });
  
  // Handle voting for an initiative
  const handleVote = (initiative: EnhancedInitiative) => {
    // In a real application, this would send a request to the backend
    setActiveInitiative(initiative);
    setShowVoteSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowVoteSuccess(false);
    }, 3000);
  };
  
  // Handle submitting feedback
  const handleSubmitFeedback = () => {
    // In a real application, this would send the feedback to the backend
    console.log('Submitting feedback:', {
      initiative: activeInitiative?.Initiaitive,
      email: userEmail,
      feedback: feedbackText
    });
    
    // Reset form and close modal
    setFeedbackText('');
    setUserEmail('');
    setShowModal(false);
    
    // Show success message
    setShowVoteSuccess(true);
    setTimeout(() => {
      setShowVoteSuccess(false);
    }, 3000);
  };
  
  // Featured initiative (first one after filtering)
  const featuredInitiative = filteredInitiatives[0];
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4 md:mb-0">Virgin Initiatives</h1>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
              onClick={() => {
                window.scrollTo({
                  top: document.getElementById('get-involved')?.offsetTop,
                  behavior: 'smooth'
                });
              }}
            >
              Get Involved
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors"
            >
              <Link href="/login">
                Customer Login
              </Link>
            </motion.button>
          </div>
        </div>
        
        {/* Success notification */}
        <AnimatePresence>
          {showVoteSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 shadow-md rounded-md z-50"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Thank you for your engagement with Virgin Initiatives!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search and filter bar */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search initiatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>
            </div>
            
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            >
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme || 'All Themes'}</option>
              ))}
            </select>
            
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            >
              {companies.map(company => (
                <option key={company} value={company}>{company || 'All Companies'}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Featured initiative */}
        {featuredInitiative && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md overflow-hidden mb-10"
          >
            <div className="md:flex">
              <div 
                className="md:w-1/2 h-64 md:h-auto bg-cover bg-center relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)), url(${
                    featuredInitiative["Virgin Company"]?.includes("Atlantic") ? "/images/plane.jpg" : 
                    featuredInitiative["Virgin Company"]?.includes("Galactic") ? "/images/rocket.jpg" : 
                    featuredInitiative["Virgin Company"]?.includes("Voyages") ? "/images/boat.jpg" : 
                    "/images/Virgin_Logo.png"
                  })`
                }}
              >
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {featuredInitiative.theme && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        {featuredInitiative.theme}
                      </span>
                    )}
                    {featuredInitiative.region && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {featuredInitiative.region}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{featuredInitiative.Initiaitive}</h2>
                  <p className="text-white/80 mb-2">{featuredInitiative["Virgin Company"]}</p>
                </div>
              </div>
              
              <div className="md:w-1/2 p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Challenge</h3>
                  <p className="text-gray-700">{featuredInitiative.Challenge}</p>
                </div>
                
                {featuredInitiative.impactScore && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(featuredInitiative.impactScore / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-red-600">Impact: {featuredInitiative.impactScore}</span>
                  </div>
                )}
                
                <div className="mt-6 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote(featuredInitiative)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
                  >
                    Support This Initiative
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveInitiative(featuredInitiative);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg shadow hover:bg-red-50 transition-colors"
                  >
                    Give Feedback
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Initiative grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredInitiatives.slice(1).map((initiative, index) => (
            <motion.div
              key={initiative.uid || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index % 6) }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden h-full"
            >
              <div 
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6)), url(${
                    initiative["Virgin Company"]?.includes("Atlantic") ? "/images/plane.jpg" : 
                    initiative["Virgin Company"]?.includes("Galactic") ? "/images/rocket.jpg" : 
                    initiative["Virgin Company"]?.includes("Voyages") ? "/images/boat.jpg" : 
                    initiative.theme?.includes("Environmental") ? "/images/solar.png" :
                    "/images/Virgin_Logo.png"
                  })`
                }}
              >
                <div className="p-4 flex items-end h-full">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {initiative.theme && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 bg-opacity-90">
                          {initiative.theme}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{initiative.Initiaitive}</h3>
                    <p className="text-sm text-white/90">{initiative["Virgin Company"]}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-gray-700 text-sm line-clamp-3 mb-4">{initiative.Challenge}</p>
                
                {initiative.impactScore && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-red-600 h-1.5 rounded-full" 
                        style={{ width: `${(initiative.impactScore / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-red-600">{initiative.impactScore}</span>
                  </div>
                )}
                
                <div className="flex justify-between mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote(initiative)}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
                  >
                    Support
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveInitiative(initiative);
                      setShowModal(true);
                    }}
                    className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Feedback
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Get involved section */}
        <div id="get-involved" className="bg-white rounded-xl shadow-md p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Get Involved</h2>
              <p className="text-gray-700 mb-6">
                At Virgin, we believe that collaboration is the key to creating a more sustainable and 
                equitable world. Our initiatives span across various sectors and regions, tackling some 
                of the most pressing challenges of our time.
              </p>
              <p className="text-gray-700 mb-6">
                As a customer, you can play a vital role in shaping the future of these initiatives. 
                Your feedback, support, and ideas can help us refine our approach and maximize our 
                positive impact.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Vote for initiatives that matter to you</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Provide feedback on ongoing initiatives</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Suggest new initiatives or improvements</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Track the progress and impact of initiatives you support</span>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 bg-red-100 rounded-full opacity-60 animate-pulse"></div>
              </div>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="relative z-10"
              >
                <Image
                  src="/images/tree.png"
                  alt="Impact Tree"
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Impact statistics */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl shadow-md p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Impact So Far</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{initiatives.length}</div>
              <div className="text-sm opacity-90">Total Initiatives</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {companies.length - 1 || 'N/A'}
              </div>
              <div className="text-sm opacity-90">Virgin Companies</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {new Set(initiatives.map(i => i.region).filter(Boolean)).size || 'N/A'}
              </div>
              <div className="text-sm opacity-90">Active Regions</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {Math.round(initiatives.reduce((sum, i) => sum + (i.peopleImpacted || 0), 0) / 1000)}K+
              </div>
              <div className="text-sm opacity-90">People Impacted</div>
            </div>
          </div>
        </div>
        
        {/* Feedback modal */}
        <AnimatePresence>
          {showModal && activeInitiative && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Share Your Feedback
                  </h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Initiative</div>
                  <div className="font-medium text-gray-800">{activeInitiative.Initiaitive}</div>
                  <div className="text-sm text-gray-500">{activeInitiative["Virgin Company"]}</div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Feedback
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Share your thoughts, suggestions, or questions about this initiative..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitFeedback}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
                    disabled={!feedbackText.trim() || !userEmail.trim()}
                  >
                    Submit Feedback
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomerDashboard;