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
  const [showAll, setShowAll] = useState(false);
  const [demoLoading, setDemoLoading] = useState(true);
  
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

  // Insert demo loading UI before the authentication check
  if (demoLoading) {
    return (
      <div tabIndex={0}
           onClick={() => setDemoLoading(false)}
           onKeyDown={() => setDemoLoading(false)}
           className="min-h-screen flex flex-col items-center justify-center bg-white cursor-pointer">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
        <p className="text-xl font-bold mt-4 text-red-600">Calculating your preferences...</p>
      </div>
    );
  }

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
        <h2 className="text-4xl font-bold mb-2 text-black text-center">Initiatives we think you'll love</h2>
        <p className="text-xl text-gray-600 mb-8 text-center">We recommend these initiatives based on your interests and preferences.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-72 cursor-pointer"
               style={{ 
                 backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)), url(/images/underwater.jpg)`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               }}>
            <div className="h-full flex flex-col p-6">
              <h3 className="text-6xl font-extrabold text-white mb-8 tracking-tight">Virgin Voyages</h3>
              <p className="text-xl text-white">Recycle ocean plastic waste into clothing</p>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-72 cursor-pointer"
               onClick={() => router.push('/initiative/Virgin%20Oceans/Saving%20the%20turtles%20initiative')}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { router.push('/initiative/Virgin%20Oceans/Saving%20the%20turtles%20initiative'); } }}
               tabIndex={0}
               role="button"
               aria-label="View saving the turtles initiative"
               style={{ 
                 backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)), url(/images/turtles.jpg)`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               }}>
            <div className="h-full flex flex-col p-6">
              <h3 className="text-6xl font-extrabold text-white mb-8 tracking-tight">Virgin Oceans</h3>
              <p className="text-xl text-white">Saving the turtles initiative</p>
            </div>
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-2 text-black text-center">More initiatives</h2>
        <p className="text-xl text-gray-600 mb-8 text-center">Personalized initiatives for you.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 grid-flow-dense">
          {(showAll ? orderedCompanies : orderedCompanies.slice(0, 3)).map((company, index) => {
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
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { router.push(`/initiative/${encodeURIComponent(company.company)}/${encodeURIComponent(initiative.initiative)}`); } }}
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
        {!showAll && (
          <div className="flex justify-center mt-10">
            <button onClick={() => setShowAll(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              View All Initiatives
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
