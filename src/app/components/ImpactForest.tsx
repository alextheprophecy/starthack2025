import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type ImpactForestProps = {
  initiatives: number;  // Number of initiatives to show trees for
  impactData?: {
    totalInitiatives: number;
    totalPeopleImpacted: number;
    regionsData: { name: string; count: number; impact: number }[];
    companiesCount: number;
  };
};

type TreePosition = {
  x: number;
  y: number;
  adjustedY: number;
  size: number;
  type: 'small' | 'medium' | 'large';
};

type GlobeHotspot = {
  x: number;
  y: number;
  size: number;
  region: string;
  initiatives: number;
  impact: number;
  angle: number;
};

// Helper for formatting large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export default function ImpactForest({ initiatives, impactData }: ImpactForestProps) {
  const [grownTrees, setGrownTrees] = useState<number[]>([]);
  const [activeView, setActiveView] = useState<'forest' | 'globe'>('forest');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [globeRotation, setGlobeRotation] = useState(0);
  const treesRef = useRef<TreePosition[]>([]);
  const hasInitialized = useRef(false);

  const defaultImpactData = {
    totalInitiatives: initiatives || 30,
    totalPeopleImpacted: 250000,
    regionsData: [
      { name: 'North America', count: 12, impact: 95000 },
      { name: 'Europe', count: 15, impact: 85000 },
      { name: 'Asia', count: 8, impact: 35000 },
      { name: 'Africa', count: 6, impact: 25000 },
      { name: 'South America', count: 5, impact: 20000 },
      { name: 'Australia', count: 3, impact: 15000 }
    ],
    companiesCount: 8
  };

  const data = impactData || defaultImpactData;

  // Generate tree positions based on initiatives count, but only once
  useEffect(() => {
    if (hasInitialized.current) return;
    
    // Define the four corner trees that form our trapezium
    const cornerTrees = [
      { x: 5, y: 2, size: 1, adjustedY: 0 },    // Top left
      { x: 12, y: 65, size: 1, adjustedY: 65 },  // Bottom left
      { x: 88, y: 2, size: 1, adjustedY: 0 },   // Top right
      { x: 85, y: 65, size: 1, adjustedY: 65 }   // Bottom right
    ];
    
    // Initialize empty result array (no corner trees)
    const result: TreePosition[] = [];
    
    // Define grid dimensions
    const gridCols = 10;
    const gridRows = 7;
    
    // Create a grid of potential tree locations
    const grid = [];
    
    // Fill the grid with coordinates
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        // Calculate vertical position (y) with non-linear distribution
        // This creates more space between rows as we move toward the bottom
        const verticalRatio = Math.pow(row / (gridRows - 1), 0.8); // Non-linear distribution
        const yPos = verticalRatio * 52 +3;
        
        // Calculate left edge x position at this y level
        const leftEdgeX = cornerTrees[0].x + verticalRatio * (cornerTrees[1].x - cornerTrees[0].x);
        // Calculate right edge x position at this y level
        const rightEdgeX = cornerTrees[2].x + verticalRatio * (cornerTrees[3].x - cornerTrees[2].x);
        
        // Calculate horizontal position (x) based on column
        const horizontalRatio = col / (gridCols - 1);
        // Add offset to alternating rows for better tree visibility
        const rowOffset = row % 2 === 0 ? 0 : (1 / gridCols) * 0.5;
        const xPos = leftEdgeX + (horizontalRatio + rowOffset) * (rightEdgeX - leftEdgeX);
        
        // Skip the exact corner positions
        const isCorner = (row === 0 && col === 0) || 
                        (row === 0 && col === gridCols - 1) ||
                        (row === gridRows - 1 && col === 0) ||
                        (row === gridRows - 1 && col === gridCols - 1);
                        
        if (!isCorner) {
          grid.push({ x: xPos, y: yPos });
        }
      }
    }
    
    // Shuffle the grid positions to randomly select positions
    const shuffledGrid = [...grid].sort(() => Math.random() - 0.5);
    
    // Take as many positions as needed (or all if fewer than initiatives)
    const treesToPlace = Math.min(30, shuffledGrid.length);
    
    // Add trees to the result
    for (let i = 0; i < treesToPlace; i++) {
      // Calculate size based on y position - trees closer to the viewer (higher y) are larger
      const baseSize = 1;
      const proximityFactor = 1 - (shuffledGrid[i].y / 52); // 1 at bottom (y=0), 0 at top (y=52)
      const sizeBoost = proximityFactor * 0.4; // Up to 0.4 size increase for closest trees
      
      // Calculate perspective-adjusted y position
      // This will make trees that are further away (higher y) appear higher up
      const adjustedY = shuffledGrid[i].y;
      
      // Add subtle random offsets to make the forest look more natural
      const xOffset = (Math.random() - 0.5) * 5; // -1 to +1 percent offset
      const yOffset = (Math.random() - 0.5) * 2 // -1 to +1 percent offset

      // Determine tree type
      const random = Math.random();
      const type = random < 0.33 ? 'small' : random < 0.66 ? 'medium' : 'large';
      
      result.push({
        x: shuffledGrid[i].x + xOffset,
        y: shuffledGrid[i].y + yOffset,
        adjustedY: adjustedY + yOffset,
        size: baseSize + sizeBoost,
        type
      });
    }
    
    treesRef.current = result;
    hasInitialized.current = true;
    
    // Start animation after trees are positioned
    animateTrees();
  }, [initiatives]);

  // Globe rotation effect
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setGlobeRotation(prev => (prev + 0.2) % 360);
    }, 50);

    return () => clearInterval(rotationInterval);
  }, []);

  // Generate globe hotspots
  const globeHotspots: GlobeHotspot[] = useMemo(() => {
    return data.regionsData.map((region, index) => {
      // Calculate position based on region
      let x, y;
      const impact = region.impact;
      const count = region.count;

      // Position hotspots around the globe
      const angle = (index / data.regionsData.length) * 360;
      const radius = 32; // Distance from center
      
      // Convert polar to cartesian coordinates
      const angleRad = (angle * Math.PI) / 180;
      x = 50 + radius * Math.cos(angleRad);
      y = 50 + radius * Math.sin(angleRad) * 0.5; // Flatten the circle for perspective

      // Size based on impact
      const maxImpact = Math.max(...data.regionsData.map(r => r.impact));
      const minSize = 7;
      const maxSize = 15;
      const size = minSize + ((impact / maxImpact) * (maxSize - minSize));

      return {
        x,
        y,
        size,
        region: region.name,
        initiatives: count,
        impact,
        angle
      };
    });
  }, [data.regionsData]);

  // Function to animate tree growth
  const animateTrees = () => {
    if (treesRef.current.length === 0) return;
    
    let delay = 100; // Initial delay
    
    treesRef.current.forEach((_, index) => {
      setTimeout(() => {
        setGrownTrees(prev => [...prev, index]);
      }, delay);
      delay += 150; // Increment delay for next tree
    });
  };

  return (
    <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Global Impact</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveView('forest')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeView === 'forest' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Impact Forest
            </button>
            <button 
              onClick={() => setActiveView('globe')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeView === 'globe' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Global View
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 pt-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total Initiatives</p>
          <p className="text-2xl font-bold text-red-600">{data.totalInitiatives}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">People Impacted</p>
          <p className="text-2xl font-bold text-red-600">{formatNumber(data.totalPeopleImpacted)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Companies</p>
          <p className="text-2xl font-bold text-red-600">{data.companiesCount}</p>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeView === 'forest' ? (
            <motion.div 
              key="forest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full" 
              style={{ paddingBottom: "30%" }}
            >
              <div className="absolute inset-0 overflow-hidden">
                {/* Perspectived Ground */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, #f0f7dc 0%, #e7f7d2 100%)",
                    transform: "perspective(700px) rotateX(30deg) translateZ(0)",
                    transformOrigin: "center bottom",
                    backfaceVisibility: "hidden",
                  }}
                >                    
                </div>

                {/* Trees */}
                {treesRef.current.map((tree, index) => (
                  <div 
                    key={index}
                    className="absolute transition-all duration-500 group"
                    style={{
                      left: `${tree.x}%`,
                      bottom: `${tree.adjustedY}%`,
                      transform: `translateX(-50%) scale(${grownTrees.includes(index) ? tree.size : 0})`,
                      transformOrigin: 'center bottom',
                      width: '80px',
                      height: '100px',
                      zIndex: Math.floor(100 - tree.y),
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring effect
                    }}
                  >
                    {/* Shadow */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 transition-all duration-500"
                      style={{
                        bottom: '-3px',
                        width: '70px',
                        height: '25px',
                        zIndex: Math.floor(100 - tree.y) - 1,
                        opacity: grownTrees.includes(index) ? 0.4 : 0,
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring effect
                      }}
                    >
                      <Image
                        src="/images/shadow.png"
                        alt="Shadow"
                        width={50}
                        height={15}
                        className="w-full h-full"
                      />
                    </div>
                    
                    <Image
                      src={`/images/${tree.type === 'small' ? 'tree.png' : tree.type === 'medium' ? 'tree2.png' : 'transparent-tree.png'}`}
                      alt="Tree"
                      width={80}
                      height={100}
                      className="w-full h-full object-contain cursor-pointer transition-transform hover:scale-105"
                    />

                    {/* Hover animation */}
                    <motion.div 
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-white px-2 py-1 rounded shadow-md text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-medium text-gray-700">Impact Tree</p>
                        <p className="text-red-600">+{Math.floor(Math.random() * 200) + 100} people</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="globe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full" 
              style={{ paddingBottom: "56%" }}
            >
              <div className="absolute inset-0 overflow-hidden">
                {/* Globe */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="relative w-[200px] h-[200px] rounded-full bg-gradient-to-b from-blue-200 to-blue-400"
                    animate={{ rotate: globeRotation }}
                    transition={{ duration: 0, ease: 'linear' }}
                  >
                    {/* Continents - using CSS instead of image */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-blue-400">
                        {/* Stylized continents with CSS */}
                        <div className="absolute w-[20%] h-[15%] bg-blue-100 rounded-full opacity-70" style={{ top: '25%', left: '30%' }} /> {/* North America */}
                        <div className="absolute w-[8%] h-[15%] bg-blue-100 rounded-full opacity-70" style={{ top: '35%', left: '45%' }} /> {/* Europe */}
                        <div className="absolute w-[20%] h-[20%] bg-blue-100 rounded-full opacity-70" style={{ top: '30%', left: '60%' }} /> {/* Asia */}
                        <div className="absolute w-[15%] h-[15%] bg-blue-100 rounded-full opacity-70" style={{ top: '55%', left: '45%' }} /> {/* Africa */}
                        <div className="absolute w-[8%] h-[15%] bg-blue-100 rounded-full opacity-70" style={{ top: '45%', left: '35%' }} /> {/* South America */}
                        <div className="absolute w-[8%] h-[8%] bg-blue-100 rounded-full opacity-70" style={{ top: '65%', left: '70%' }} /> {/* Australia */}
                      </div>
                    </div>

                    {/* Grid lines */}
                    <div className="absolute inset-0 rounded-full" style={{ 
                      border: '1px solid rgba(255,255,255,0.3)',
                      backgroundImage: 'radial-gradient(circle, transparent 0%, transparent 70%, rgba(255,255,255,0.2) 70%, rgba(255,255,255,0.2) 100%), linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                      backgroundSize: '100% 100%, 20px 20px, 20px 20px',
                      opacity: 0.4
                    }}></div>

                    {/* Reflection effect */}
                    <div className="absolute inset-0 rounded-full opacity-30" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, transparent 100%)'
                    }}></div>

                    {/* Impact hotspots */}
                    {globeHotspots.map((hotspot, index) => (
                      <motion.div
                        key={index}
                        className="absolute rounded-full bg-red-500 cursor-pointer"
                        style={{
                          left: `${hotspot.x}%`,
                          top: `${hotspot.y}%`,
                          width: `${hotspot.size}px`,
                          height: `${hotspot.size}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10
                        }}
                        animate={{
                          scale: activeHotspot === hotspot.region ? [1, 1.2, 1] : 1
                        }}
                        transition={{
                          repeat: activeHotspot === hotspot.region ? Infinity : 0,
                          duration: 1.5
                        }}
                        onMouseEnter={() => setActiveHotspot(hotspot.region)}
                        onMouseLeave={() => setActiveHotspot(null)}
                      >
                        {/* Pulse effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-red-500"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.7, 0, 0.7]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            delay: index * 0.3
                          }}
                        />

                        {/* Tooltip */}
                        {activeHotspot === hotspot.region && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full -mt-2 bg-white p-2 rounded shadow-lg text-xs whitespace-nowrap z-20"
                            style={{ top: '-15px', minWidth: '120px' }}
                          >
                            <p className="font-bold text-gray-800">{hotspot.region}</p>
                            <p className="text-red-600">{hotspot.initiatives} Initiatives</p>
                            <p className="text-gray-600">{formatNumber(hotspot.impact)} people impacted</p>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Region list */}
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2 flex justify-center space-x-2 text-xs">
                {data.regionsData.map((region, index) => (
                  <button
                    key={index}
                    className={`px-2 py-1 rounded ${
                      activeHotspot === region.name
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                    onMouseEnter={() => setActiveHotspot(region.name)}
                    onMouseLeave={() => setActiveHotspot(null)}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {activeView === 'forest' 
            ? 'Each tree represents an initiative making real-world impact'
            : 'Hotspots show regions where initiatives are making an impact'}
        </div>
      </div>

      {/* Regional Impact Details */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 mt-2">Regional Impact</h3>
        <div className="space-y-3">
          {data.regionsData.slice(0, 4).map((region, index) => (
            <div 
              key={index}
              className={`transition-colors ${
                activeHotspot === region.name ? 'bg-red-50' : ''
              }`}
              onMouseEnter={() => setActiveHotspot(region.name)}
              onMouseLeave={() => setActiveHotspot(null)}
            >
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{region.name}</span>
                <span className="text-sm text-gray-600">{region.count} initiatives</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(region.impact / data.totalPeopleImpacted) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                  className="h-2 rounded-full bg-red-500" 
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">{formatNumber(region.impact)} people</span>
                <span className="text-xs text-gray-500">
                  {((region.impact / data.totalPeopleImpacted) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}