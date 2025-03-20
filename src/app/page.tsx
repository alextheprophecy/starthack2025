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
  initiative: string;
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
      // Fetch and parse the JSON data
      fetch('/res/sample_initiatives.json')
        .then(response => response.json())
        .then(data => {
          // Map JSON keys to our Initiative type
          const parsedInitiatives: Initiative[] = data.map((item: any) => ({
            company: item['Virgin Company'],
            initiative: item['Initiaitive'],
            challenge: item['Challenge'],
            whatVirginIsDoing: item['What Virgin is doing'],
            callToAction: item['Call to Action'],
            links: item['Links']
              ? item['Links'].split('\n').map((link: string) => link.trim()).filter(Boolean)
              : []
          }));

          setInitiatives(parsedInitiatives);

          // Create a map to deduplicate and count initiatives for each company
          const initiativeMap = new Map<string, Map<string, number>>();

          parsedInitiatives.forEach(initiative => {
            const companies = initiative.company.split('&').map(c => c.trim());
            companies.forEach(companyName => {
              if (!initiativeMap.has(companyName)) {
                initiativeMap.set(companyName, new Map());
              }
              const compInitiatives = initiativeMap.get(companyName)!;
              compInitiatives.set(
                initiative.initiative,
                (compInitiatives.get(initiative.initiative) || 0) + 1
              );
            });
          });

          const groupedInitiatives: CompanyInitiatives[] = [];
          initiativeMap.forEach((initiatives, company) => {
            const initiativeList: InitiativeWithCount[] = [];
            initiatives.forEach((count, initiativeName) => {
              initiativeList.push({ initiative: initiativeName, count });
            });
            groupedInitiatives.push({ company, initiatives: initiativeList });
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

  // Reorder companies so that the first row (first two cards) are small if possible
  const orderedCompanies = [...companyInitiatives];
  for (let pos = 0; pos < 2 && pos < orderedCompanies.length; pos++) {
    if (orderedCompanies[pos].initiatives.length > 5) {
      const swapIndex = orderedCompanies.findIndex((company, idx) => idx >= 2 && company.initiatives.length <= 5);
      if (swapIndex !== -1) {
        const temp = orderedCompanies[pos];
        orderedCompanies[pos] = orderedCompanies[swapIndex];
        orderedCompanies[swapIndex] = temp;
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto p-6 mt-10">
        <h2 className="text-4xl font-bold mb-6 text-gray-800 text-center">Our Initiatives</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 grid-flow-dense">
          {orderedCompanies.map((company, index) => {
            // Force first two cards to be small, others follow criteria
            const isLarge = index < 2 ? false : company.initiatives.length > 5;
            return (
              <div 
                key={index} 
                className={`rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-96 ${isLarge ? 'md:col-span-2' : ''}`}
                style={{ 
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)), url(${backgroundImages[index % backgroundImages.length]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="h-full flex flex-col p-6">
                  <h3 className="text-6xl font-extrabold text-white mb-8 tracking-tight">{company.company}</h3>
                  <div className="flex-grow overflow-y-auto px-2">
                    <ul className={`space-y-3 ${isLarge ? 'grid grid-cols-2 gap-x-4 gap-y-3 space-y-0' : ''}`}>
                      {company.initiatives.map((initiative, i) => (
                        <li
                          key={i}
                          className="text-xl text-white hover:text-red-300 transition-colors cursor-pointer flex items-start"
                          onClick={() => router.push(`/initiative/${encodeURIComponent(company.company)}/${encodeURIComponent(initiative.initiative)}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              router.push(`/initiative/${encodeURIComponent(company.company)}/${encodeURIComponent(initiative.initiative)}`);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View initiative ${initiative.initiative}`}
                        >
                          <span className="mr-2">•</span>
                          <span>{initiative.initiative} {initiative.count > 1 && `(${initiative.count})`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
