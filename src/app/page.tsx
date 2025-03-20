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

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto p-6 mt-10">
        <h2 className="text-4xl font-bold mb-6 text-gray-800 text-center">Our Initiatives</h2>
        
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
                        {initiative.initiative} {initiative.count > 1 && `(${initiative.count})`}
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
