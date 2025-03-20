import React from 'react';

type ImpactForestProps = {
  initiatives: number;  // Number of initiatives to show trees for
};

export default function ImpactForest({ initiatives }: ImpactForestProps) {
  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Impact Forest</h2>
      </div>
     <div className="p-6">
            <div className="relative w-full" style={{ paddingBottom: "40%" }}>
              <div className="absolute inset-0 overflow-hidden">
                {/* Perspectived Grid */}
                <div 
                  className="absolute inset-0 bg-red-50"
                  style={{
                    background: "linear-gradient(to bottom, #fef2f2 0%, #fee2e2 100%)",
                    transform: "perspective(1000px) rotateX(60deg)",
                    transformOrigin: "center bottom",
                  }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundSize: '40px 40px',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
    </div>
  );
} 