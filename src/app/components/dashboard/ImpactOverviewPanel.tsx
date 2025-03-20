import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EnhancedInitiative } from '../../types/initiatives';
import Image from 'next/image';

interface ImpactOverviewPanelProps {
  initiatives: EnhancedInitiative[];
  impactData: {
    totalInitiatives: number;
    initiativesByTheme: { theme: string; count: number; percentage: number }[];
    averageImpactScore: number;
    totalPeopleImpacted: number;
  };
}

// Get theme color for initiatives
const getThemeColor = (theme: string): string => {
  const colors: { [key: string]: string } = {
    "Environmental Sustainability": "#10b981", // green-500
    "Digital Inclusion": "#3b82f6", // blue-500
    "Social Activism": "#8b5cf6", // violet-500
    "Community Support": "#f97316", // orange-500
    "Climate Action": "#14b8a6", // teal-500
    "Health & Wellbeing": "#ec4899", // pink-500
    "Education": "#6366f1", // indigo-500
    "Economic Development": "#eab308", // yellow-500
    "Disaster Relief": "#ef4444", // red-500
    "Space Innovation": "#8b5cf6", // violet-500
  };
  return colors[theme] || "#ef4444"; // red-500 default
};

// Interactive World Map component with actual initiative locations
const WorldMap: React.FC<{
  initiatives: EnhancedInitiative[]
}> = ({ initiatives }) => {
  const [activeInitiative, setActiveInitiative] = useState<EnhancedInitiative | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Pre-defined coordinates for major regions (longitude, latitude)
  const getCoordinatesForRegion = (region: string): [number, number] => {
    const coordinates: { [key: string]: [number, number] } = {
      "North America": [-100, 40],
      "United States": [-98, 39.5],
      "Canada": [-106, 56],
      "Mexico": [-102, 23],
      "South America": [-58, -20],
      "Brazil": [-53, -10],
      "Argentina": [-64, -38],
      "Europe": [10, 50],
      "United Kingdom": [-1, 52],
      "France": [2, 46],
      "Germany": [10, 51],
      "Italy": [12, 43],
      "Spain": [-4, 40],
      "Africa": [20, 0],
      "South Africa": [25, -30],
      "Kenya": [38, 0],
      "Nigeria": [8, 9],
      "Asia": [100, 30],
      "China": [105, 35],
      "India": [80, 22],
      "Japan": [138, 36],
      "Australia": [134, -25],
      "New Zealand": [172, -41],
      "Middle East": [45, 25],
      "UAE": [54, 24],
      "Russia": [100, 60],
      "Global": [0, 0], // Default for global initiatives
    };
    
    return coordinates[region] || [0, 0];
  };
  
  // Calculate pixel position from longitude and latitude
  const getPixelPosition = (longitude: number, latitude: number): { x: number, y: number } => {
    // World map is typically 360° wide (longitude) and 180° tall (latitude)
    // Convert from -180~180 longitude to 0~100% of map width
    // Convert from 90~-90 latitude to 0~100% of map height (note the inversion)
    const x = ((longitude + 180) / 360) * 100;
    const y = ((90 - latitude) / 180) * 100;
    
    return { x, y };
  };
  
  // Generate random offset to prevent markers from stacking exactly
  const getRandomOffset = (): { x: number, y: number } => {
    return {
      x: (Math.random() - 0.5) * 3,
      y: (Math.random() - 0.5) * 3
    };
  };
  
  // Convert initiative to map marker data
  const initiativeMarkers = initiatives.map(initiative => {
    // Use region or company location for positioning
    const location = initiative.region || initiative["Virgin Company"] || "Global";
    const [longitude, latitude] = getCoordinatesForRegion(location);
    const offset = getRandomOffset();
    const position = getPixelPosition(longitude, latitude);
    
    return {
      initiative,
      position: {
        x: position.x + offset.x,
        y: position.y + offset.y
      },
      color: getThemeColor(initiative.theme || "")
    };
  });
  
  // Handle zoom functionality
  const handleZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapScale(prev => Math.max(0.8, Math.min(2.5, prev + delta)));
  };
  
  // Handle map dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - lastPosition.current.x;
    const dy = e.clientY - lastPosition.current.y;
    
    setMapPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  
  // Reset view to default
  const resetView = () => {
    setMapScale(1);
    setMapPosition({ x: 0, y: 0 });
  };
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Determine marker size based on impact score or a default value
  const getMarkerSize = (initiative: EnhancedInitiative, isActive: boolean) => {
    const baseSize = isActive ? 24 : 12;
    if (initiative.impactScore) {
      // Normalize impact score to a reasonable size range
      return Math.max(baseSize, Math.min(baseSize * 1.5, baseSize * (initiative.impactScore / 5)));
    }
    return baseSize;
  };
  
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <button 
          onClick={() => setMapScale(prev => Math.min(2.5, prev + 0.2))}
          className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={() => setMapScale(prev => Math.max(0.8, prev - 0.2))}
          className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={resetView}
          className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Initiative count legend */}
      <div className="absolute top-4 left-4 z-20 bg-white/80 p-2 rounded-md shadow-md">
        <div className="text-sm font-semibold text-gray-700">
          {initiatives.length} Global Initiatives
        </div>
      </div>
      
      {/* Map container */}
      <div 
        ref={mapRef}
        className="relative flex-1 overflow-hidden cursor-grab"
        onWheel={handleZoom}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ touchAction: 'none' }}
      >
        {/* World map image */}
        <div 
          className="absolute w-full h-full"
          style={{
            transform: `scale(${mapScale}) translate(${mapPosition.x / mapScale}px, ${mapPosition.y / mapScale}px)`,
            transformOrigin: 'center center',
            transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* World map backdrop */}
          <div className="absolute inset-0 bg-blue-50">
            <div className="w-full h-full relative">
              <svg
                className="w-full h-full"
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Simplified world map SVG paths */}
                <path
                  d="M191,106 l-4,1 l-5,-1 l-11,3 l-13,4 l-10,5 l-10,2 l-8,2 l-9,2 l-8,-2 l-16,-2 v5 l-2,4 l0,5 l-2,3 l0,5 l-2,5 l-2,13 l2,2 l2,3 l-1,4 l1,5 l-2,7 l-2,5 l2,5 l5,3 l6,0 l1,2 l4,1 l1,3 l3,2 l1,4 l4,3 l7,2 l7,5 l5,1 l6,1 l6,-1 l5,-2 l6,2 l6,0 l7,-8 l6,-3 l7,-2 l3,1 l4,2 l8,1 l9,3 l10,1 l5,-1 l7,-2 l9,-2 l9,0 l5,1 l-3,3 l1,3 l5,3 l6,2 l7,3 l8,1 l9,0 l8,-2 l0,9 l0,13 l2,11 l6,10 l10,12 l8,10 l5,11 l4,13 l3,9 l4,5 l5,4 l6,2 v5 l8,12 l9,15 l6,12 l8,9 l8,9 l8,1 l9,-1 l10,-5 l11,-1 l9,-4 l-2,-2 l-7,-2 l-7,-4 l-2,-5 l-2,-7 l2,-5 l6,-5 l9,-4 l8,-4 l9,-9 l8,-14 l8,-9 l9,-6 l9,-4 l10,-9 l9,-10 l5,-11 l4,-11 l5,-19 l5,-20 l5,-10 l8,-10 l7,-11 l3,-12 l5,-15 l9,-12 l10,-10 l8,-8 l4,-15 l5,-14 l6,-12 l8,-5 l8,2 l8,11 l9,10 l8,6 l6,6 l6,12 l5,14 l5,5 l5,-1 l8,-6 l4,1 l0,4 l0,5 l7,7 l8,3 l3,3 l-2,5 l-6,3 l-3,3 l-3,6 l-8,12 l-5,13 l-3,13 l1,12 l1,14 l0,12 l-1,11 l-3,13 l-8,13 l-1,12 l3,5 l5,6 l8,8 l3,5 l2,6 l3,13 l6,10 l8,8 l10,9 l9,7 l8,3 l2,11 l-2,12 l-5,15 l-5,23 l-2,13 l-1,24 l-1,22 l1,5 l1,13 l1,12 l0,10 l-4,15 l-4,15 l-3,11 l-8,10 l-13,10 l-8,5 l-7,3 l-3,8 l-4,11 l-4,12 l-9,0 l-8,-1 l-7,2 l-7,2 l-7,3 l-5,6 l-3,6 l-3,14 l-2,9 l-4,18 l0,13 l0,14 l1,5 l2,3 l-1,5 l-3,5 l-9,8 l-3,5 l-4,9 l-7,8 l-8,9 l-9,2 l-8,1 l-9,-1 l-9,-2 l-5,-10 l-3,-9 l-2,-10 l-4,-5 l-5,-4 l-9,-7 l-6,-6 l-5,-3 l-11,-2 l-8,0 l-8,3 l-9,3 l-10,0 l-9,-1 l-7,-2 l-9,0 l-8,3 l-7,4 l-5,6 l-1,5 l-2,13 l0,10 l-3,9 l-8,6 l-8,2 l-6,3 l-5,4 l-5,2 l-8,3 l-8,2 l-9,1 l-8,-2 l-8,-2 l-9,-1 l-9,1 l-8,4 l-9,3 l-7,5 l-5,6 l-7,5 l-8,1 l-7,-2 l-9,-2 l-5,-6 l-3,-10 l-1,-12 l0,-15 l-4,-10 l-9,-7 l-9,-9 l-9,-8 l-6,-9 l-3,-10 l-4,-12 l-8,-9 l-8,-5 l-7,-4 l-8,-5 l-8,-4 l-9,-3 l-11,-4 l-12,-3 l-11,-4 l-6,-6 l-1,-6 l0,-6 l-3,-6 l-6,-5 l-9,-2 l-7,0 l-8,4 l-8,5 l-7,3 l-9,1 l-7,2 l-6,3 l-6,5 l-4,5 l-6,4 l-9,1 l-12,-2 l-11,-2 l-13,-2 l-12,-4 l-11,-4 l-8,-4 l-6,-6 l-4,-8 l-6,-14 l-4,-8 l-5,-6 l-5,-3 l-8,-4 l-10,-3 l-13,-1 l-13,0 l-10,2 l-5,2 l-6,5 l-5,4 l-5,4 l-14,3 l-15,1 l-15,0 l-13,-2 l-8,-3 l-8,-6 l-8,-5 l-7,-5 l-3,-13 l-4,-14 l-5,-10 l-7,-10 l-9,-8 l-12,-9 l-9,-6 l-6,-11 l-2,-5 l-3,-5 l-1,-8 l-3,-14 l-3,-8 l-4,-4 l-8,-2 l-8,0 l-9,1 l-13,-1 l-11,-2 l-5,-3 l-8,-8 l-8,-7 l-7,-5 l-4,-4 l-5,-7 l-7,-6 l-5,-7 l-3,-10 l-1,-15 l0,-22 l-3,-24 l-6,-19 l-7,-14 l-4,-11 l0,-13 l2,-14 l5,-16 l6,-10 l7,-8 l9,-5 l10,-2 l9,-1 v-7 l2,-7 l0,-9 l-2,-9 l-4,-10 l-4,-7 l-6,-5 l-5,-5 l-2,-5 l-2,-6 l-4,-9 l-8,-7 l-3,-3"
                  fill="#D6EAF8"
                  stroke="#85C1E9"
                  strokeWidth="1"
                />
                <path
                  d="M516,128 l1,-3 l-3,-8 l-2,-9 l-6,-4 l-8,-2 l-7,2 l-5,5 l-4,6 l-2,8 l-5,7 l-7,8 l-5,3 l-3,5 l-5,7 l-8,2 l-10,4 l-10,3 l-9,5 l-5,7 l-3,9 l-2,10 l-1,10 l1,9 l3,8 l6,7 l4,4 l3,6 l0,6 l-2,6 l-8,9 l-2,6 l1,5 l3,7 l6,6 l7,2 l7,1 l7,2 l6,5 l4,6 l3,8 l1,9 l1,11 l3,10 l5,8 l7,6 l8,7 l8,3 l8,2 l8,2 l7,4 l8,3 l11,2 l11,2 l10,3 l7,6 l5,7 l3,9 l1,11 l0,12 l-2,14 l-5,13 l-9,11 l-9,6 l-9,8 l-6,11 l-3,11 l-1,16 l0,13 l2,12 l3,12 l2,10 l3,10 l4,10 l7,7 l6,7 l5,9 l3,10 l1,12 l-2,13 l-5,9 l-6,8 l-8,7 l-7,6 l-8,6 l-8,6 l-10,3 l-10,3 l-9,3 l-10,3 l-9,2 l-10,4 l-11,3 l-10,4 l-8,5 l-5,9 l-6,10 l-8,7 l-9,3 l-7,2 l-7,4 l-6,5 l-10,2 l-13,0 l-14,-2 l-11,-5 l-6,-4 l-5,-5 l-8,-4 l-8,-5 l-8,-5 l-8,-2 l-9,1 l-11,5 l-8,8 l-2,3 l-1,5 l-5,7 l-8,5 l-8,3 l-8,1 l-11,0 l-11,0 l-8,0 l-8,3 l-9,4 l-9,5 l-8,4 l-16,2 l-14,1 l-11,2 l-7,5 l-4,6 l-2,9 l-1,11 l-2,11 l-7,8 l-8,2 l-9,3 l-9,2 l-11,3 l-11,2 l-9,3 l-8,4 l-8,3 l-7,5 l-6,5 l-7,3 l-9,2 l-9,1 l-10,2 l-8,3 l-8,4 l-9,4 l-8,4 l-9,4 l-9,3 l-10,2 l-8,2 l-9,2 l-10,1 l-10,0 l-10,-1 l-6,-1 l-7,-7 l-5,-9 l-3,-10 l-1,-12 l3,-12 l5,-12 l8,-11 l8,-10 l9,-11 l10,-8 l9,-8 l9,-7 l0,-9 l-3,-9 l-9,-7 l-18,-4 l-14,-1 l-12,-1 l-9,-2 l-8,-5 l-7,-12 l-5,-10 l-2,-11 l1,-10 l-1,-7 l-3,-6 l-8,-5 l-9,-2 l-10,0 l-11,0 l-11,0 l-10,-2 l-11,-4 l-5,-5 l-4,-6 l-5,-6 l-7,-5 l-8,-4 l-14,-2 l-7,1 l-8,2 l-8,3 l-10,4 l-9,2 l-10,1 l-10,0 l-10,-1 l-11,-2 l-9,-6 l-7,-8 l-5,-9 l-3,-11 l-1,-12 l0,-10 l2,-10 l5,-7 l-1,-8 l-5,-7 l-7,-5 l-9,-4 l-9,-6 l-5,-9 l-3,-11 l-1,-10 l0,-11 l-1,-12 l-3,-10 l-6,-7 l-9,-8 l-9,-5 l-5,-8 l-2,-8 l-1,-14 l-3,-9 l-7,-8 l-9,-7 l-9,-6 l-9,-3 l-9,-1 l-13,1 l-15,4 l-11,2 l-8,0 l-10,-3 l-8,-7 l-5,-9 l-3,-11 l-4,-12 l-9,-8 l-12,-7 l-10,-8 l-6,-8 l-3,-11 l-1,-11 l-1,-12 l0,-11 l2,-9 l4,-8 l9,-9 l10,-9 l11,-8 l9,-6 l8,-8 l9,-8 l8,-6 l7,-7 l5,-9 l4,-11 l3,-11 l1,-4"
                  fill="#D6EAF8"
                  stroke="#85C1E9"
                  strokeWidth="1"
                />
                <path
                  d="M656,285 l5,-8 l3,-9 l1,-12 l-3,-13 l-5,-8 l-7,-6 l-9,-3 l-11,-1 l-10,2 l-9,3 l-10,6 l-10,5 l-10,4 l-8,4 l-8,4 l-8,5 l-8,3 l-9,1 l-12,0 l-11,-1 l-9,-3 l-8,-3 l-8,-4 l-9,-3 l-9,-3 l-10,-3 l-11,-2 l-11,-2 l-8,-3 l-9,-7 l-8,-8 l-6,-8 l-5,-8 l-3,-9 l-2,-10 l0,-6 l-1,-9 l-3,-12 l-6,-8 l-8,-8 l-7,-8 l-2,-6 l2,-6 l8,-9 l1,-7 l-2,-10 l-3,-7 l-6,-6 l-8,-3 l-9,-2 l-10,-1 l-10,0 l-10,1 l-9,3 l-9,2 l-9,0 l-9,-2 l-9,-2 l-8,-2 l-8,-4 l-8,-4 l-9,-3 l-9,-5 l-5,-7 l-3,-10 l-1,-12 l1,-10 l3,-11 l6,-10 l11,-8 l11,-3 l11,-2 l11,0 l10,0 l11,-2 l10,-2 l10,-2 l10,-3 l10,-4 l10,-2 l10,-1 l12,0 l12,1 l11,1 l9,4 l6,8 l2,5 l2,5 l5,7 l6,5 l6,4 l7,3 l9,0 l10,-1 l10,-2 l12,-1 l11,0 l10,2 l9,3 l9,3 l9,2 l9,2 l10,2 l10,3 l10,3 l10,3 l10,3 l9,2 l9,3 l9,3 l9,2 l9,3 l9,3 l9,3 l9,3 l10,2 l10,2 l10,4 l9,4 l9,5 l8,5 l7,8 l5,9 l2,11 l0,11 l-1,11 l-3,11 l-6,10 l-8,10 l-9,9 l-10,8 l-10,7"
                  fill="#D6EAF8"
                  stroke="#85C1E9"
                  strokeWidth="1"
                />
                <path 
                  d="M770,390 l6,-7 l3,-9 l0,-10 l-3,-10 l-8,-7 l-10,-7 l-10,-3 l-10,0 l-10,3 l-8,5 l-7,8 l-6,8 l-5,9 l-2,9 l0,10 l3,9 l7,8 l11,4 l10,4 l10,-1 l11,-3 l10,-5 l8,-6"
                  fill="#D6EAF8"
                  stroke="#85C1E9"
                  strokeWidth="1"
                />

                {/* Grid lines for longitude */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <line
                    key={`long-${i}`}
                    x1={(i * 143) + 85}
                    y1="0"
                    x2={(i * 143) + 85}
                    y2="500"
                    stroke="#AED6F1"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                ))}

                {/* Grid lines for latitude */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <line
                    key={`lat-${i}`}
                    x1="0"
                    y1={(i * 100) + 50}
                    x2="1000"
                    y2={(i * 100) + 50}
                    stroke="#AED6F1"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                ))}
              </svg>
            </div>
          </div>
          
          {/* Initiative markers */}
          {initiativeMarkers.map((marker, index) => {
            const isActive = activeInitiative?.uid === marker.initiative.uid;
            const markerSize = getMarkerSize(marker.initiative, isActive);
            
            return (
              <div
                key={`marker-${index}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${marker.position.x}%`,
                  top: `${marker.position.y}%`,
                  zIndex: isActive ? 10 : 1
                }}
              >
                {/* Marker */}
                <motion.div
                  className="rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    width: `${markerSize}px`,
                    height: `${markerSize}px`,
                    backgroundColor: marker.color,
                    boxShadow: isActive 
                      ? `0 0 0 4px rgba(255,255,255,0.8), 0 0 0 ${markerSize/2}px rgba(${marker.color.replace(/^#/, '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(',')},0.2)`
                      : '0 0 10px rgba(0,0,0,0.3)',
                  }}
                  animate={{
                    scale: isActive ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isActive ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                  onMouseEnter={() => setActiveInitiative(marker.initiative)}
                  onMouseLeave={() => setActiveInitiative(null)}
                />
                
                {/* Tooltip for active marker */}
                {isActive && (
                  <motion.div
                    className="absolute z-50 bg-white rounded-md shadow-lg p-3 text-sm min-w-[200px] max-w-[280px]"
                    style={{
                      left: `${markerSize + 10}px`,
                      top: 0,
                      transformOrigin: 'left center'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="font-bold text-gray-800 mb-1">{marker.initiative["Initiaitive"] || 'Unnamed Initiative'}</div>
                    <div className="text-xs text-gray-500 mb-2">{marker.initiative["Virgin Company"] || 'Virgin Group'}</div>
                    
                    <div className="flex space-x-1 items-center mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: marker.color }}></div>
                      <span className="text-xs text-gray-600">{marker.initiative.theme || 'General'}</span>
                    </div>
                    
                    {marker.initiative.region && (
                      <div className="text-xs text-gray-600">
                        Region: {marker.initiative.region}
                      </div>
                    )}
                    
                    {marker.initiative.impactScore && (
                      <div className="mt-2 bg-gray-100 rounded-md px-2 py-1 text-xs">
                        Impact Score: <span className="font-semibold text-red-600">{marker.initiative.impactScore}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Caption */}
      <div className="mt-2 text-center text-xs text-gray-500 pb-1">
        Interactive map showing global distribution of Virgin initiatives
      </div>
    </div>
  );
};

// Main component
const ImpactOverviewPanel: React.FC<ImpactOverviewPanelProps> = ({ initiatives, impactData }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-[550px]">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Global Initiative Map</h2>
      
      {/* World Map */}
      <div className="h-[470px]">
        <WorldMap initiatives={initiatives} />
      </div>
    </div>
  );
};

export default ImpactOverviewPanel;