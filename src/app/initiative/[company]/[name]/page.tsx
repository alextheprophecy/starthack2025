"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import FriendCard from "../../../components/FriendCard";
import { Friend } from "../../../../data/friends";
import { motion } from "framer-motion";

type Initiative = {
  company: string;
  initiative: string;
  challenge: string;
  whatVirginIsDoing: string;
  callToAction: string;
  links: string[];
  reward: string;
};

interface InitiativeDataItem {
  'Virgin Company': string;
  'Initiaitive': string;
  'Challenge': string;
  'What Virgin is doing': string;
  'Call to Action': string;
  'Links'?: string;
  'Reward'?: string;
}

export default function InitiativeDetails({
  params,
}: {
  params: { company: string; name: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const decodedCompany = decodeURIComponent(params.company);
  const decodedName = decodeURIComponent(params.name);

  // Hardcoded friends for UI demonstration
  const demoFriends: Friend[] = [
    {
      id: '1',
      name: 'John Paul',
      imageUrl: '/images/man1.jpg',
      participatedInitiatives: []
    },
    {
      id: '2',
      name: 'Zak Larib',
      imageUrl: '/images/woman1.webp',
      participatedInitiatives: []
    }
  ];

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    } else if (user.userType === 'internal') {
      router.push("/internal");
      return;
    }

    setLoading(true);
    // Fetch and parse the JSON data
    fetch('/res/sample_initiatives.json')
      .then(response => response.json())
      .then(data => {
        // Map JSON keys to our Initiative type
        const parsedInitiatives: Initiative[] = data.map((item: InitiativeDataItem) => ({
          company: item['Virgin Company'],
          initiative: item['Initiaitive'],
          challenge: item['Challenge'],
          whatVirginIsDoing: item['What Virgin is doing'],
          callToAction: item['Call to Action'],
          links: item['Links']
            ? item['Links'].split('\n').map((link: string) => link.trim()).filter(Boolean)
            : [],
          reward: item['Reward'] || 'sustainability'
        }));
        
        // Filter initiatives by company and name
        const filteredInitiatives = parsedInitiatives.filter(initiative => {
          const companies = initiative.company.split('&').map(c => c.trim());
          return companies.includes(decodedCompany) && initiative.initiative === decodedName;
        });
        
        setInitiatives(filteredInitiatives);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading initiatives:', error);
        setLoading(false);
      });
  }, [decodedCompany, decodedName, router, user]);

  if (!user) {
    return null;
  }

  const handleDonation = (amount: string) => {
    setDonationAmount(amount);
    setIsProcessingPayment(true);
    setPaymentSuccess(false);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setShowSuccessPopup(true);
      
      // Don't auto-close the popup, let the user close it
    }, 750);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setPaymentSuccess(false);
  };

  // Default view for other initiatives
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto p-6">
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center text-red-600 hover:text-red-700 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : initiatives.length === 0 ? (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Initiative Not Found</h2>
            <p className="text-gray-600">We couldn&apos;t find any initiative matching your criteria.</p>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center mb-2">
                <h2 className="text-5xl font-bold text-gray-800">{decodedName}</h2>                
                <div className="w-full bg-gradient-to-r from-white via-red-100 to-red-200 rounded-lg p-3 mt-4 md:mt-0 md:ml-6">
                  <div className="flex items-center gap-2 justify-end">
                    {demoFriends.map((friend) => (
                      <FriendCard 
                        key={friend.id}
                        name={friend.name}
                        imageUrl={friend.imageUrl}
                      />
                    ))}
                    <motion.div 
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-red-600 shadow-sm hover:bg-white hover:text-red-700 cursor-pointer" 
                      whileHover={{ 
                        backgroundColor: "#FFFFFF", 
                        color: "#DC2626",
                        transition: { duration: 0.2 } 
                      }}
                    >
                      6+
                    </motion.div>
                    <span className="ml-3 text-sm font-medium text-red-600">are participating...</span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-red-600 mb-4">{decodedCompany}</p>
            </div>
            
            <div className={`${initiatives.length > 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
              {initiatives.map((initiative, index) => (
                <div key={index} className="bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] p-6 mb-6 md:mb-0">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Challenge:</h3>
                    <p className="text-gray-600">{initiative.challenge}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">What Virgin is doing:</h3>
                    <p className="text-gray-600">{initiative.whatVirginIsDoing}</p>
                  </div>
                  
                  {/* Call to Action - show here only for non-turtle initiatives */}
                  {initiative.callToAction && decodedName.toLowerCase() !== "saving the turtles initiative" && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Call to Action:</h3>
                      <p className="text-gray-600 whitespace-pre-line">{initiative.callToAction}</p>
                    </div>
                  )}
                  
                  {initiative.links && initiative.links.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Learn More:</h3>
                      <div className="flex flex-col gap-2">
                        {initiative.links.map((link, i) => (
                          link && (
                            <a 
                              key={i} 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-red-600 hover:underline cursor-pointer"
                            >
                              {link}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  
                  
                  {/* Get Involved Section - Only show for Turtle Initiative */}
                  {decodedName.toLowerCase() === "saving the turtles initiative" && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-2xl font-bold text-red-600 mb-4">Get Involved</h3>
                      
                      <div className="flex flex-col md:flex-row gap-6">
                         {/* Left side - Map */}
                         <div className="w-full md:w-1/2">
                          <div className="mb-3">
                            <h4 className="text-lg font-semibold text-gray-700 mb-1">Beach Cleanup Events</h4>
                            <p className="text-gray-600">Join us every Wednesday at Nipos Grand Beach for our weekly cleanup initiative.</p>
                          </div>
                          <div className="relative w-full">
                            <img
                              src="/images/map.png"
                              alt="Meeting Point for Beach Cleanup"
                              className="rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer w-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="bg-white bg-opacity-75 text-red-600 font-bold px-2 py-1 rounded text-sm">
                                Beach Cleanup Location
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-col sm:flex-row items-center justify-between">
                            <p className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">
                              Volunteer for beach clean-ups
                            </p>
                            <button
                              onClick={() => {}}
                              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Contact Organizer
                            </button>
                          </div>
                        </div>
                        {/* Right side - Donation options */}
                        <div className="w-full md:w-1/2 flex flex-col justify-center md:h-full gap-6 md:py-6">
                          <div>
                            <h4 className="text-xl font-semibold text-gray-700 mb-4">Donate to the cause</h4>
                            {isProcessingPayment ? (
                              <div className="flex flex-col items-center justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mb-2"></div>
                                <p className="text-gray-700 font-medium">Processing payment...</p>
                              </div>
                            ) : paymentSuccess ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
                                <div className="flex items-center mb-2">
                                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  <span className="text-green-800 font-medium">Payment Successful!</span>
                                </div>
                                <p className="text-gray-700 text-center mb-3">Thanks for donating {donationAmount} to the &quot;Saving the turtles initiative&quot;</p>
                                <div className="flex items-center bg-red-50 px-3 py-2 rounded-lg">
                                  <span className="text-red-600 font-medium mr-2">My forest reward:</span>
                                  <img 
                                    src="/images/starfish.png" 
                                    alt="Reward Icon" 
                                    className="w-6 h-6 object-contain"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex gap-3 mb-4">
                                  <button
                                    onClick={() => handleDonation("5 CHF")}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded cursor-pointer flex-1"
                                  >
                                    5 CHF
                                  </button>
                                  <button
                                    onClick={() => handleDonation("10 CHF")}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded cursor-pointer flex-1"
                                  >
                                    10 CHF
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleDonation("Custom Amount")}
                                  className="border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-3 px-6 rounded cursor-pointer w-full"
                                >
                                  Custom Amount
                                </button>
                              </>
                            )}
                            <p className="text-sm text-gray-600 mt-3">
                              Your donation helps fund beach cleanups and turtle conservation efforts
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Payment Successful!</h2>
              <p className="text-lg text-gray-700 mb-6">
                Thanks for donating {donationAmount} to the &quot;Saving the turtles initiative&quot;
              </p>
              
              <div className="bg-red-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-red-600 mb-4">Starfish added to your forest!</h3>
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  >
                    <img 
                      src="/images/starfish.png" 
                      alt="Starfish Reward"
                      className="w-16 h-16 object-contain" 
                    />
                  </motion.div>
                </div>
              
              
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push("/my-initiatives")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer"
                >
                  Go to My Forest
                </button>
                <button
                  onClick={closeSuccessPopup}
                  className="text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 