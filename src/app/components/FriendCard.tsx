import Image from 'next/image';

interface FriendCardProps {
  name: string;
  imageUrl: string;
}

const FriendCard = ({ name, imageUrl }: FriendCardProps) => {
  return (
    <div className="flex items-center bg-white rounded-full shadow-sm p-2 hover:shadow-md transition-shadow">
      <div className="relative w-8 h-8 mr-2 overflow-hidden rounded-full border border-red-100">
        <Image 
          src={imageUrl} 
          alt={`${name}'s profile`} 
          fill 
          className="object-cover"
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{name}</span>
    </div>
  );
};

export default FriendCard; 