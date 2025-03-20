"use client";

import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Initiative = {
  company: string;
  initiative: string;
  challenge: string;
  solution: string;
  callToAction: string;
  links: string[];
};

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
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
          setInitiatives(parsedInitiatives);
        })
        .catch(error => console.error('Error loading initiatives:', error));
    }
  }, [user, router]);

  // Don't render the page content if not authenticated
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-red-600">Virgin Initiatives</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user.email}</span>
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Our Initiatives</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initiatives.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-red-600 text-white p-3">
                <h3 className="font-bold">{item.company}</h3>
              </div>
              <div className="p-4">
                <h4 className="text-lg font-semibold text-red-600 mb-2">{item.initiative}</h4>
                
                <div className="mb-3">
                  <h5 className="text-sm font-semibold text-gray-700">Challenge:</h5>
                  <p className="text-sm text-gray-600">{item.challenge}</p>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-sm font-semibold text-gray-700">What Virgin is doing:</h5>
                  <p className="text-sm text-gray-600">{item.solution}</p>
                </div>
                
                {item.callToAction && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700">Call to Action:</h5>
                    <p className="text-sm text-gray-600">{item.callToAction}</p>
                  </div>
                )}
                
                {item.links && item.links.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-semibold text-gray-700">Learn More:</h5>
                    <div className="flex flex-col gap-1 mt-1">
                      {item.links.map((link, i) => (
                        link && (
                          <a 
                            key={i} 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-red-600 hover:underline truncate"
                          >
                            {link}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
