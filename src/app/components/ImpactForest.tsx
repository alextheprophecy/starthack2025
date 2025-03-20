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
      { x: 5, y: 0, size: 1 },    // Top left
      { x: 12, y: 52, size: 1 },  // Bottom left
      { x: 95, y: 0, size: 1 },   // Top right
      { x: 88, y: 52, size: 1 }   // Bottom right
    ];
    
    const result = [...cornerTrees];
    
    // Generate additional random trees within the trapezium
    for (let i = 0; i < 50; i++) {
      // Get a random point along both the top and bottom edges
      const topEdgeRatio = Math.random();
      const bottomEdgeRatio = Math.random();
      
      // Calculate points on top and bottom edges using linear interpolation
      const topX = cornerTrees[0].x + topEdgeRatio * (cornerTrees[2].x - cornerTrees[0].x);
      const bottomX = cornerTrees[1].x + bottomEdgeRatio * (cornerTrees[3].x - cornerTrees[1].x);
      
      // Get a random point between these vertical positions
      const verticalRatio = Math.random();
      const finalX = topX + verticalRatio * (bottomX - topX);
      const finalY = 0 + verticalRatio * (52);
      
      // Add the tree with some size variation
      result.push({ 
        x: finalX, 
        y: finalY, 
        size: Math.random() * 0.3 + 1 
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
              bottom: `${tree.y}%`,
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