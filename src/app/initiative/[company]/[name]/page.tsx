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

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto p-6">
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center text-red-600 hover:text-red-700"
          style={{ cursor: 'pointer' }}
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
                      className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-red-600 shadow-sm hover:bg-white hover:text-red-700" 
                      style={{ cursor: 'pointer' }}
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
                  
                  {initiative.callToAction && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Call to Action:</h3>
                      <p className="text-gray-600 whitespace-pre-line">{initiative.callToAction}</p>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Reward Category:</h3>
                    <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
                      {initiative.reward}
                    </span>
                  </div>
                  
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
                              className="text-red-600 hover:underline"
                              style={{ cursor: 'pointer' }}
                            >
                              {link}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 