import React, { useMemo } from 'react';
import Image from 'next/image';

type ImpactForestProps = {
  initiatives: number;  // Number of initiatives to show trees for
};

export default function ImpactForest({ initiatives }: ImpactForestProps) {
  // Generate tree positions based on initiatives count
  const trees = useMemo(() => {
    // Define the four corner trees that form our trapezium
    const cornerTrees = [
      { x: 5, y: 2, size: 1, adjustedY: 0 },    // Top left
      { x: 12, y: 52, size: 1, adjustedY: 52 },  // Bottom left
      { x: 88, y: 2, size: 1, adjustedY: 0 },   // Top right
      { x: 85, y: 52, size: 1, adjustedY: 52 }   // Bottom right
    ];
    
    // Initialize empty result array (no corner trees)
    const result = [];
    
    // Define grid dimensions
    const gridCols = 10;
    const gridRows = 6;
    
    // Create a grid of potential tree locations
    const grid = [];
    
    // Fill the grid with coordinates
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        // Calculate vertical position (y) with non-linear distribution
        // This creates more space between rows as we move toward the bottom
        const verticalRatio = Math.pow(row / (gridRows - 1), 0.8); // Non-linear distribution
        const yPos = verticalRatio * 52;
        
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
    const treesToPlace = Math.min(200, shuffledGrid.length);
    
    // Add trees to the result
    for (let i = 0; i < treesToPlace; i++) {
      // Calculate size based on y position - trees closer to the viewer (higher y) are larger
      const baseSize = 0.8;
      const sizeVariation = 0.2;
      const proximityFactor = 1 - (shuffledGrid[i].y / 52); // 1 at bottom (y=0), 0 at top (y=52)
      const sizeBoost = proximityFactor * 0.4; // Up to 0.4 size increase for closest trees
      
      // Calculate perspective-adjusted y position
      // This will make trees that are further away (higher y) appear higher up
      const adjustedY = shuffledGrid[i].y;
      
      // Add subtle random offsets to make the forest look more natural
      const xOffset = (Math.random() - 0.5) * 5; // -1 to +1 percent offset
      const yOffset = (Math.random() - 0.5) * 2 // -1 to +1 percent offset
      
      result.push({
        x: shuffledGrid[i].x + xOffset,
        y: shuffledGrid[i].y + yOffset,
        adjustedY: adjustedY + yOffset,
        size: baseSize + sizeVariation * Math.random() + sizeBoost
      });
    }
    
    return result;
  }, [initiatives]);

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Impact Forest</h2>
      </div>
     <div className="p-6">
        <div className="relative w-full" style={{ paddingBottom: "30%" }}>
            <div className="absolute inset-0 overflow-hidden">
                {/* Perspectived Grid */}
                <div 
                    className="absolute inset-0 bg-red-50"
                    style={{
                    background: "linear-gradient(to bottom, #fef2f2 0%, #fee2e2 100%)",
                    transform: "perspective(700px) rotateX(30deg)",
                    transformOrigin: "center bottom",
                    }}
                >                    
                </div>
                {/* Trees */}
        {trees.map((tree, index) => (
          <div 
            key={index}
            className="absolute pointer-events-none "
            style={{
              left: `${tree.x}%`,
              bottom: `${tree.adjustedY}%`,
              transform: `translateX(-50%) scale(${tree.size})`,
              transformOrigin: 'center bottom',
              width: '80px',
              height: '100px',
              zIndex: Math.floor(100 - tree.y),
            }}
          >
            <Image
              src="/images/tree2.png"
              alt="Tree"
              width={80}
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
            </div>
        </div>
        
        
    </div>
    </div>
  );
} 