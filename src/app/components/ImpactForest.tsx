import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Constants for visual customization of different initiative types
const VISUAL_SETTINGS = {
  environmental: {
    scale: 1,
    xOffset: 0,
    yOffset: 6,
    width: 80,
    height: 100
  },
  social: {
    scale: 0.55, // Smaller scale for flowers
    xOffset: 0,
    yOffset: 7, // Lift flowers up a bit
    width: 70,
    height: 90
  },
  innovation: {
    scale: 0.9, // Slightly smaller scale for solar panels
    xOffset: 0,
    yOffset: 0, // Move solar panels down a bit
    width: 85,
    height: 85
  }
};

// Scale factor for profile view
const PROFILE_VIEW_SCALE = 0.8;

type Initiative = {
  company: string;
  initiative: string;
  challenge: string;
  solution: string;
  callToAction: string;
  links: string[];
  type: 'environmental' | 'social' | 'innovation';
  dateParticipated: string;
  pointsEarned: number;
  contribution: string;
};

type ImpactForestProps = {
  initiatives: Initiative[] | { 
    company: string;
    initiative: string; 
    challenge: string;
    solution: string;
    callToAction: string;
    links: string[];
    type: 'environmental' | 'social' | 'innovation';
    dateParticipated: string;
    pointsEarned: number;
    contribution: string;
  }[];  // Accept either Initiative[] or InitiativeWithParticipation[]
  isProfileView?: boolean; // New parameter to indicate if this is shown on a profile page
  seed?: number; // Optional seed for random number generation
};

type TreePosition = {
  x: number;
  y: number;
  adjustedY: number;
  size: number;
  type: 'environmental' | 'social' | 'innovation';
};

export default function ImpactForest({ initiatives, isProfileView = false, seed }: ImpactForestProps) {
  const [grownTrees, setGrownTrees] = useState<number[]>([]);
  const treesRef = useRef<TreePosition[]>([]);
  const hasInitialized = useRef(false);

  // New seededRandom function that uses an offset
  const seededRandom = (max: number, min: number = 0, offset: number = 0) => {
    if (!seed) return min + Math.random() * (max - min);
    const x = Math.sin(seed + offset) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

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
    
    // New grid shuffling using seeded random with offset
    const gridWithRand = grid.map((item, index) => ({ ...item, rand: seededRandom(1, 0, index) }));
    const shuffledGrid = gridWithRand.sort((a, b) => a.rand - b.rand).map(item => ({ x: item.x, y: item.y }));
    
    // Take as many positions as needed (or all if fewer than initiatives)
    const treesToPlace = Math.min(30, Math.max(initiatives.length, shuffledGrid.length));
    
    // Add trees to the result
    for (let i = 0; i < treesToPlace; i++) {
      // Calculate size based on y position - trees closer to the viewer (higher y) are larger
      const baseSize = 1;
      const proximityFactor = 1 - (shuffledGrid[i].y / 52); // 1 at bottom (y=0), 0 at top (y=52)
      const sizeBoost = proximityFactor * 0.4; // Up to 0.4 size increase for closest trees
      
      // Calculate perspective-adjusted y position
      // This will make trees that are further away (higher y) appear higher up
      const adjustedY = shuffledGrid[i].y;
      
      // New code for offsets and type using offset in seededRandom
      const xOffset = (seededRandom(1, 0, i + 1000) - 0.5) * 5; // -2.5 to +2.5 offset
      const yOffset = (seededRandom(1, 0, i + 2000) - 0.5) * 2; // -1 to +1 offset
      const type = i < initiatives.length 
        ? initiatives[i].type 
        : ['environmental', 'social', 'innovation'][Math.floor(seededRandom(3, 0, i + 3000))] as 'environmental' | 'social' | 'innovation';
      
      result.push({
        x: shuffledGrid[i].x + xOffset,
        y: shuffledGrid[i].y + yOffset,
        adjustedY: adjustedY + yOffset,
        size: baseSize + sizeBoost,
        type: type
      });
    }
    
    treesRef.current = result;
    hasInitialized.current = true;
    
    // Start animation after trees are positioned
    animateTrees();
  }, [initiatives, seed]);

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

  // Get the appropriate image source based on initiative type
  const getImageSrc = (type: 'environmental' | 'social' | 'innovation') => {
    switch (type) {
      case 'environmental':
        return '/images/tree2.png';
      case 'social':
        return '/images/sunflower.png';
      case 'innovation':
        return '/images/solar2.png';
      default:
        return '/images/tree2.png';
    }
  };

  // Get visual settings for the item based on its type
  const getVisualSettings = (type: 'environmental' | 'social' | 'innovation') => {
    return VISUAL_SETTINGS[type];
  };

  // Calculate actual scale based on whether this is a profile view
  const getActualScale = (baseScale: number) => {
    return isProfileView ? baseScale * PROFILE_VIEW_SCALE : baseScale;
  };

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
     <div className="p-6">
        {!isProfileView && (
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your Impact Forest</h2>
        )}
        <div className="relative w-full" style={{ paddingBottom: isProfileView ? "25%" : "30%" }}>
            <div className="absolute inset-0 overflow-hidden">
                {/* Perspectived Grid */}
                <div 
                    className="absolute inset-0 bg-green-50"
                    style={{
                    background: "linear-gradient(to bottom, #f0f9e4 0%, #d7efc2 60%, #c5e5a5 100%)",
                    transform: "perspective(700px) rotateX(30deg)",
                    transformOrigin: "center bottom",
                    }}
                >   
                  {/* Grid lines for perspective effect */}
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,128,0,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,128,0,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '5% 10%'
                  }}></div>             
                </div>
                {/* Initiative Items */}
        {treesRef.current.map((item, index) => {
          const visualSettings = getVisualSettings(item.type);
          const actualScale = getActualScale(item.size * visualSettings.scale);
          
          return (
          <div 
            key={index}
            className="absolute transition-all duration-500 group"
            style={{
              left: `${item.x + visualSettings.xOffset}%`,
              bottom: `${item.adjustedY}%`, // Base position without yOffset
              transform: `translateX(-50%) scale(${grownTrees.includes(index) ? actualScale : 0})`, // Apply adjusted scale
              transformOrigin: 'center bottom',
              width: `${visualSettings.width}px`,
              height: `${visualSettings.height}px`,
              zIndex: Math.floor(100 - item.y),
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
                zIndex: Math.floor(100 - item.y) - 1,
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
            
            <div 
              style={{ 
                transform: `translateY(${-visualSettings.yOffset}px)`, // Apply yOffset with absolute pixels
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end'
              }}
            >
              <Image
                src={getImageSrc(item.type)}
                alt={`${item.type} icon`}
                width={visualSettings.width}
                height={visualSettings.height}
                className="object-contain cursor-pointer hover:scale-110 transition-transform"
              />
            </div>
          </div>
        )})}
            </div>
        </div>        
       
    </div>
    </div>
  );
} 