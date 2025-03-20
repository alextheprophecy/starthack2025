export type Friend = {
  id: string;
  name: string;
  imageUrl: string;
  participatedInitiatives: string[];
};

export const friendsData: Friend[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    participatedInitiatives: ['Carbon Neutrality', 'Virgin Orbit', 'Space Tourism']
  },
  {
    id: '2',
    name: 'Emma Lee',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    participatedInitiatives: ['Sustainable Aviation', 'Clean Energy']
  },
  {
    id: '3',
    name: 'James Wilson',
    imageUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    participatedInitiatives: ['Virgin Orbit', 'Space Tourism']
  },
  {
    id: '4',
    name: 'Sophia Garcia',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    participatedInitiatives: ['Clean Energy', 'Carbon Neutrality', 'Digital Inclusion']
  },
  {
    id: '5',
    name: 'Noah Brown',
    imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
    participatedInitiatives: ['Digital Inclusion', 'Sustainable Aviation']
  },
  {
    id: '6',
    name: 'Olivia Martinez',
    imageUrl: 'https://randomuser.me/api/portraits/women/29.jpg',
    participatedInitiatives: ['Space Tourism', 'Carbon Neutrality']
  }
]; 