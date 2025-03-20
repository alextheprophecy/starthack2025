import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface FriendCardProps {
  name: string;
  imageUrl: string;
}

const FriendCard = ({ name, imageUrl }: FriendCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="flex items-center bg-white rounded-full shadow-sm p-1.5 hover:shadow-md"
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ y: 0 }}
      animate={{ y: [0, -5, 0] }}
      transition={{ 
        repeat: Infinity, 
        duration: 2.5,
        ease: "easeInOut"
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className={`relative w-8 h-8 mr-2 overflow-hidden rounded-full border ${isHovered ? 'border-red-400' : 'border-gray-100'} transition-colors duration-300`}>
        <Image 
          src={imageUrl} 
          alt={`${name}'s profile`} 
          fill 
          className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
      </div>
      <span className={`text-sm font-medium transition-colors duration-300 ${isHovered ? 'text-red-600' : 'text-gray-700'}`}>
        {name}
      </span>
    </motion.div>
  );
};

export default FriendCard; 