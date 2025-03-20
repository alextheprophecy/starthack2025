"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

type Initiative = {
  company: string;
  initiative: string;
  challenge: string;
  solution: string;
  callToAction: string;
  links: string[];
};

export default function InitiativeDetails({
  params,
}: {
  params: { company: string; name: string };
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);

  const decodedCompany = decodeURIComponent(params.company);
  const decodedName = decodeURIComponent(params.name);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    } else if (user.userType === 'internal') {
      router.push("/internal");
      return;
    }

    setLoading(true);
    // Fetch and parse the CSV data
    fetch('/res/sample_initiatives.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        const parsedInitiatives: Initiative[] = [];
        
        // Skip the header row (index 0)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            // Split by comma but handle commas within quotes
            const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            if (matches && matches.length >= 6) {
              const initiative: Initiative = {
                company: matches[0].replace(/"/g, ''),
                initiative: matches[1].replace(/"/g, ''),
                challenge: matches[2].replace(/"/g, ''),
                solution: matches[3].replace(/"/g, ''),
                callToAction: matches[4].replace(/"/g, ''),
                links: matches[5].replace(/"/g, '').split('\n').map(link => link.trim()).filter(Boolean),
              };
              parsedInitiatives.push(initiative);
            }
          }
        }
        
        // Filter initiatives by company and name
        const filteredInitiatives = parsedInitiatives.filter(
          initiative => 
            initiative.company === decodedCompany && 
            initiative.initiative === decodedName
        );
        
        setInitiatives(filteredInitiatives);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading initiatives:', error);
        setLoading(false);
      });
  }, [decodedCompany, decodedName, router, user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-red-600">Virgin Initiatives</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user.email}</span>
          <button 
            onClick={() => router.push("/")}
            className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors text-sm"
          >
            All Initiatives
          </button>
          <button 
            onClick={() => router.push("/my-initiatives")}
            className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors text-sm"
          >
            My Initiatives
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center text-red-600 hover:text-red-700"
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
            <p className="text-gray-600">We couldn't find any initiative matching your criteria.</p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{decodedName}</h2>
              <p className="text-lg text-red-600">{decodedCompany}</p>
            </div>
            
            {initiatives.map((initiative, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Challenge:</h3>
                  <p className="text-gray-600">{initiative.challenge}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">What Virgin is doing:</h3>
                  <p className="text-gray-600">{initiative.solution}</p>
                </div>
                
                {initiative.callToAction && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Call to Action:</h3>
                    <p className="text-gray-600">{initiative.callToAction}</p>
                  </div>
                )}
                
                {initiative.links && initiative.links.length > 0 && (
                  <div>
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
        )}
      </main>
    </div>
  );
} 