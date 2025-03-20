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

type InitiativeWithCount = {
  name: string;
  count: number;
};

type CompanyInitiatives = {
  company: string;
  initiatives: InitiativeWithCount[];
};

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [companyInitiatives, setCompanyInitiatives] = useState<CompanyInitiatives[]>([]);
  
  // Background images for cards
  const backgroundImages = [
    "/images/balloon.jpeg",
    "/images/plane.jpg",
    "/images/rocket.jpg",
    "/images/boat.jpg"
  ];

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.userType === 'internal') {
      router.push("/internal");
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
          
          // Create a map to deduplicate and count initiatives
          const initiativeMap = new Map<string, Map<string, number>>();
          
          // Count initiatives by company and name
          parsedInitiatives.forEach(initiative => {
            if (!initiativeMap.has(initiative.company)) {
              initiativeMap.set(initiative.company, new Map());
            }
            
            const companyMap = initiativeMap.get(initiative.company)!;
            const currentCount = companyMap.get(initiative.initiative) || 0;
            companyMap.set(initiative.initiative, currentCount + 1);
          });
          
          // Convert map to the expected format
          const groupedInitiatives: CompanyInitiatives[] = [];
          
          initiativeMap.forEach((initiatives, company) => {
            const initiativeList: InitiativeWithCount[] = [];
            
            initiatives.forEach((count, name) => {
              initiativeList.push({ name, count });
            });
            
            groupedInitiatives.push({
              company,
              initiatives: initiativeList
            });
          });
          
          console.log('Grouped initiatives:', JSON.stringify(groupedInitiatives, null, 2));
          setCompanyInitiatives(groupedInitiatives);
        })
        .catch(error => console.error('Error loading initiatives:', error));
    }
  }, [user, router]);

  // Don't render the page content if not authenticated or if internal user
  if (!user || user.userType === 'internal') {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {companyInitiatives.map((company, index) => (
            <div 
              key={index} 
              className="rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-96"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)), url(${backgroundImages[index % backgroundImages.length]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="h-full flex flex-col p-6">
                <h3 className="text-5xl font-extrabold text-white mb-8 tracking-tight">{company.company}</h3>
                <div className="flex-grow overflow-y-auto px-2">
                  <ul className="space-y-3">
                    {company.initiatives.map((initiative, i) => (
                      <li 
                        key={i} 
                        className="text-xl font-semibold text-white hover:text-red-300 transition-colors cursor-pointer"
                        onClick={() => router.push(`/initiative/${encodeURIComponent(company.company)}/${encodeURIComponent(initiative.name)}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            router.push(`/initiative/${encodeURIComponent(company.company)}/${encodeURIComponent(initiative.name)}`);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${initiative.name}`}
                      >
                        {initiative.name} {initiative.count > 1 && `(${initiative.count})`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
