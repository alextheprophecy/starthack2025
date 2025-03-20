import React from 'react';
import Image from 'next/image';
import { EnhancedInitiative, Initiative } from '../../types/initiatives';

interface InitiativeCardProps {
  initiative: Initiative;
  enhanced?: boolean;
  onClick?: () => void;
  className?: string;
}

// Function to get color based on theme
const getThemeColor = (theme: string) => {
  const colors: {[key: string]: string} = {
    "Environmental Sustainability": "bg-green-100 text-green-800",
    "Digital Inclusion": "bg-blue-100 text-blue-800",
    "Social Activism": "bg-purple-100 text-purple-800",
    "Community Support": "bg-orange-100 text-orange-800",
    "Climate Action": "bg-teal-100 text-teal-800",
    "Health & Wellbeing": "bg-pink-100 text-pink-800",
    "Education": "bg-indigo-100 text-indigo-800",
    "Economic Development": "bg-yellow-100 text-yellow-800",
    "Disaster Relief": "bg-red-100 text-red-800",
    "Space Innovation": "bg-violet-100 text-violet-800",
  };
  return colors[theme] || "bg-gray-100 text-gray-800";
};

// Get image based on company
const getCompanyImage = (company: string): string => {
  if (company.includes("Atlantic")) return "/images/plane.jpg";
  if (company.includes("Voyages")) return "/images/boat.jpg";
  if (company.includes("Media")) return "/images/solar.png";
  if (company.includes("Unite")) return "/images/balloon.jpeg";
  if (company.includes("Limited Edition")) return "/images/tree.png";
  if (company.includes("Galactic")) return "/images/rocket.jpg";
  return "/images/Virgin_Logo.png";
};

// Format date for display
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const InitiativeCard: React.FC<InitiativeCardProps> = ({ 
  initiative, 
  enhanced = false,
  onClick,
  className = ''
}) => {
  const enhancedInitiative = initiative as EnhancedInitiative;
  const isEnhanced = enhanced && 'teamMembers' in initiative;

  return (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Card Header with Image */}
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7)), url(${getCompanyImage(initiative["Virgin Company"])})`
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {initiative.theme && (
              <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getThemeColor(initiative.theme)}`}>
                {initiative.theme}
              </span>
            )}
            {initiative.region && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                {initiative.region}
              </span>
            )}
            {initiative.phase && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                {initiative.phase}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white line-clamp-2">{initiative["Initiaitive"]}</h3>
          <p className="text-white/90 text-sm">{initiative["Virgin Company"]}</p>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-5">
        <p className="text-gray-700 line-clamp-3 mb-4">
          {initiative["Challenge"]}
        </p>
        
        {/* Enhanced Details */}
        {isEnhanced && (
          <div className="mt-3 space-y-3">
            {/* Status and Timeline */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className="font-medium capitalize">
                {enhancedInitiative.status || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Started:</span>
              <span className="font-medium">
                {formatDate(enhancedInitiative.startDate)}
              </span>
            </div>
            
            {/* Team Members */}
            {enhancedInitiative.teamMembers && enhancedInitiative.teamMembers.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Team:</p>
                <div className="flex -space-x-2 overflow-hidden">
                  {enhancedInitiative.teamMembers.slice(0, 4).map((member, index) => (
                    <div 
                      key={index} 
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-xs flex items-center justify-center text-gray-700 font-medium overflow-hidden"
                      title={`${member.name} - ${member.role}`}
                    >
                      {member.avatar ? (
                        <span>{member.name[0]}{member.name.split(' ')[1]?.[0]}</span>
                      ) : (
                        <span>{member.name[0]}{member.name.split(' ')[1]?.[0]}</span>
                      )}
                    </div>
                  ))}
                  {enhancedInitiative.teamMembers.length > 4 && (
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-300 text-xs flex items-center justify-center text-gray-700 font-medium">
                      +{enhancedInitiative.teamMembers.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Milestones Progress */}
            {enhancedInitiative.milestones && enhancedInitiative.milestones.length > 0 && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress:</span>
                  <span>
                    {enhancedInitiative.milestones.filter(m => m.status === 'completed').length}/
                    {enhancedInitiative.milestones.length} Milestones
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-red-600 h-1.5 rounded-full" 
                    style={{ 
                      width: `${(enhancedInitiative.milestones.filter(m => m.status === 'completed').length / 
                        enhancedInitiative.milestones.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Footer with Metrics and Call-to-Action */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center bg-red-50 px-2 py-1 rounded-md">
            <span className="text-xs font-medium text-red-600">
              Impact Score: {initiative.impactScore || 'N/A'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {initiative.lastUpdated ? formatDate(initiative.lastUpdated) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InitiativeCard;