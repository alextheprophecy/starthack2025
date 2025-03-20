'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CustomerDashboard from '../components/customer/CustomerDashboard';
import { EnhancedInitiative } from '../types/initiatives';
import { loadInitiatives, enhanceInitiatives } from '../services/initiativeService';

export default function CustomerPage() {
  const [initiatives, setInitiatives] = useState<EnhancedInitiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const rawInitiatives = await loadInitiatives();
        const enhanced = enhanceInitiatives(rawInitiatives);
        setInitiatives(enhanced);
      } catch (error) {
        console.error('Error loading initiatives:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-16 h-16 border-t-4 border-red-600 border-solid rounded-full"
          />
        </div>
      ) : (
        <CustomerDashboard initiatives={initiatives} />
      )}
    </div>
  );
}