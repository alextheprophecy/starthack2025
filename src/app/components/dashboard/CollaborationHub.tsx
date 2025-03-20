import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: { type: string; url: string; name: string }[];
}

interface Channel {
  id: string;
  name: string;
  description: string;
  members: string[];
  isPrivate: boolean;
  messages: Message[];
  unreadCount: number;
  lastActivity: Date;
}

interface GroupChat {
  id: string;
  name: string;
  members: string[];
  messages: Message[];
  unreadCount: number;
  lastActivity: Date;
}

interface DirectChat {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userStatus: 'online' | 'away' | 'offline' | 'busy';
  messages: Message[];
  unreadCount: number;
  lastActivity: Date;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  title?: string;
  company?: string;
}

// Mock data for demonstration purposes
const mockUsers: User[] = [
  { id: '1', name: 'Alex Johnson', status: 'online', title: 'Innovation Lead', company: 'Virgin Atlantic' },
  { id: '2', name: 'Sarah Chen', status: 'online', title: 'Sustainability Director', company: 'Virgin Media' },
  { id: '3', name: 'James Wilson', status: 'away', title: 'Project Manager', company: 'Virgin Galactic' },
  { id: '4', name: 'Priya Patel', status: 'offline', title: 'Community Outreach', company: 'Virgin Unite' },
  { id: '5', name: 'Michael Torres', status: 'busy', title: 'Product Designer', company: 'Virgin Voyages' },
  { id: '6', name: 'Emma Lewis', status: 'online', title: 'Marketing Specialist', company: 'Virgin Hotels' },
  { id: '7', name: 'David Kim', status: 'offline', title: 'Technical Lead', company: 'Virgin Orbit' },
  { id: '8', name: 'Olivia Wang', status: 'away', title: 'Research Analyst', company: 'Virgin Hyperloop' },
];

const mockChannels: Channel[] = [
  {
    id: 'c1',
    name: 'sustainability-initiatives',
    description: 'Discussions about ongoing and upcoming sustainability initiatives across Virgin companies',
    members: ['1', '2', '4', '6'],
    isPrivate: false,
    messages: [
      {
        id: 'm1',
        senderId: '2',
        senderName: 'Sarah Chen',
        content: 'Has anyone reviewed the CO2 reduction numbers from the Q1 report?',
        timestamp: new Date(Date.now() - 3600000 * 2),
        isRead: true,
      },
      {
        id: 'm2',
        senderId: '6',
        senderName: 'Emma Lewis',
        content: 'I\'ve analyzed them and can share the highlights tomorrow morning.',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
      },
    ],
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 3600000),
  },
  {
    id: 'c2',
    name: 'space-innovation',
    description: 'Exploring the frontier of space technology and innovation',
    members: ['1', '3', '5', '7'],
    isPrivate: false,
    messages: [
      {
        id: 'm3',
        senderId: '7',
        senderName: 'David Kim',
        content: 'The new propulsion system tests are showing promising results. Check out the latest data.',
        timestamp: new Date(Date.now() - 86400000),
        isRead: true,
      },
    ],
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 86400000),
  },
  {
    id: 'c3',
    name: 'project-horizon',
    description: 'Confidential discussion about Project Horizon',
    members: ['1', '3', '8'],
    isPrivate: true,
    messages: [
      {
        id: 'm4',
        senderId: '3',
        senderName: 'James Wilson',
        content: 'The timeline for Phase 2 has been updated. Let\'s meet to discuss adjustments.',
        timestamp: new Date(Date.now() - 43200000),
        isRead: false,
      },
    ],
    unreadCount: 1,
    lastActivity: new Date(Date.now() - 43200000),
  },
];

const mockGroupChats: GroupChat[] = [
  {
    id: 'g1',
    name: 'Marketing Team',
    members: ['1', '6', '8'],
    messages: [
      {
        id: 'gm1',
        senderId: '6',
        senderName: 'Emma Lewis',
        content: 'I\'ve drafted the social media posts for the new campaign. Would love your feedback!',
        timestamp: new Date(Date.now() - 7200000),
        isRead: true,
      },
    ],
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 7200000),
  },
  {
    id: 'g2',
    name: 'Carbon Neutrality Task Force',
    members: ['2', '4', '5', '7'],
    messages: [
      {
        id: 'gm2',
        senderId: '2',
        senderName: 'Sarah Chen',
        content: 'Our latest models predict we can achieve carbon neutrality by 2025 if we implement all proposed measures.',
        timestamp: new Date(Date.now() - 10800000),
        isRead: false,
        attachments: [
          { type: 'pdf', url: '#', name: 'carbon_neutrality_report_2024.pdf' },
        ],
      },
    ],
    unreadCount: 1,
    lastActivity: new Date(Date.now() - 10800000),
  },
];

const mockDirectChats: DirectChat[] = [
  {
    id: 'd1',
    userId: '2',
    userName: 'Sarah Chen',
    userStatus: 'online',
    messages: [
      {
        id: 'dm1',
        senderId: '2',
        senderName: 'Sarah Chen',
        content: 'I reviewed your proposal for the renewable energy initiative. Very impressive work!',
        timestamp: new Date(Date.now() - 5400000),
        isRead: true,
      },
      {
        id: 'dm2',
        senderId: 'current',
        senderName: 'You',
        content: 'Thanks Sarah! I\'d love to discuss the implementation timeline when you have a moment.',
        timestamp: new Date(Date.now() - 5300000),
        isRead: true,
      },
      {
        id: 'dm3',
        senderId: '2',
        senderName: 'Sarah Chen',
        content: 'Definitely! How about tomorrow at 2pm?',
        timestamp: new Date(Date.now() - 3600000),
        isRead: false,
      },
    ],
    unreadCount: 1,
    lastActivity: new Date(Date.now() - 3600000),
  },
  {
    id: 'd2',
    userId: '5',
    userName: 'Michael Torres',
    userStatus: 'busy',
    messages: [
      {
        id: 'dm4',
        senderId: '5',
        senderName: 'Michael Torres',
        content: 'Check out the latest design mockups for the mobile app.',
        timestamp: new Date(Date.now() - 86400000),
        isRead: true,
        attachments: [
          { type: 'image', url: '#', name: 'app_design_v3.png' },
        ],
      },
    ],
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 86400000),
  },
];

// Utility functions
const formatTime = (date: Date): string => {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

// Status indicator component
const StatusIndicator: React.FC<{ status: User['status'] }> = ({ status }) => {
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400',
  };
  
  return (
    <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} ring-2 ring-white`} />
  );
};

// User avatar component with status
const UserAvatar: React.FC<{ user: User; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-semibold`}>
        {user.avatar ? (
          <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="absolute bottom-0 right-0 transform translate-x-1/4 -translate-y-1/4">
        <StatusIndicator status={user.status} />
      </div>
    </div>
  );
};

// Message component
const MessageComponent: React.FC<{ message: Message; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isCurrentUser && (
        <div className="mr-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center text-xs font-semibold">
            {message.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
        </div>
      )}
      
      <div className="flex flex-col max-w-[75%]">
        {!isCurrentUser && (
          <span className="text-xs text-gray-500 mb-1">{message.senderName}</span>
        )}
        
        <div className={`rounded-lg px-4 py-2 ${isCurrentUser ? 'bg-red-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
          <p className="text-sm">{message.content}</p>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="bg-white rounded-md p-2 flex items-center text-xs border border-gray-200">
                  <div className="mr-2">
                    {attachment.type === 'pdf' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="flex-grow truncate">{attachment.name}</span>
                  <a href={attachment.url} className="ml-2 text-blue-500 hover:text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <span className="text-xs text-gray-400 mt-1 self-end">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

// Main component
const CollaborationHub: React.FC = () => {
  // State
  const [activeSection, setActiveSection] = useState<'channels' | 'direct' | 'groups'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState<'channel' | 'group' | null>(null);
  const [selectedChat, setSelectedChat] = useState<Channel | GroupChat | DirectChat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  // Set initial chat if none selected
  useEffect(() => {
    if (!selectedChat && mockDirectChats.length > 0) {
      handleChatSelect(mockDirectChats[0]);
    }
  }, []);
  
  // Scroll to bottom of messages when chat changes
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Filter users/chats based on search query
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.title && user.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredChannels = mockChannels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredGroupChats = mockGroupChats.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredDirectChats = mockDirectChats.filter(chat => 
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle chat selection
  const handleChatSelect = (chat: Channel | GroupChat | DirectChat) => {
    setSelectedChat(chat);
    setChatMessages(chat.messages);
    
    // Reset unread count (would be an API call in a real app)
    if (chat.unreadCount > 0) {
      chat.unreadCount = 0;
    }
  };
  
  // Handle new message submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;
    
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date(),
      isRead: true,
    };
    
    // Add message to chat
    setChatMessages([...chatMessages, newMsg]);
    selectedChat.messages.push(newMsg);
    selectedChat.lastActivity = new Date();
    
    // Clear input
    setNewMessage('');
    setShowEmojiPicker(false);
  };
  
  // Handle opening create modal
  const handleOpenCreateModal = (type: 'channel' | 'group') => {
    setModalType(type);
    setShowCreateModal(true);
  };
  
  // Get chat icon
  const getChatIcon = (chat: Channel | GroupChat | DirectChat) => {
    if ('isPrivate' in chat) {
      // It's a channel
      return chat.isPrivate ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
      );
    } else if ('name' in chat && 'members' in chat) {
      // It's a group chat
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      );
    } else {
      // It's a direct chat
      return <StatusIndicator status={chat.userStatus} />;
    }
  };
  
  // Get user for direct chat
  const getUserForDirectChat = (chat: DirectChat): User | undefined => {
    return mockUsers.find(user => user.id === chat.userId);
  };
  
  // Animations
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };
  
  const chatAreaVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1 } },
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-[550px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-red-600 to-red-500">
        <h2 className="text-xl font-bold text-white">Collaboration Hub</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => handleOpenCreateModal('channel')} 
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-md flex items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            New Channel
          </button>
          
          <button 
            onClick={() => handleOpenCreateModal('group')} 
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-md flex items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            New Group
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div 
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className="w-72 border-r border-gray-200 flex flex-col"
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats, channels, and users..."
                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection('direct')}
              className={`flex-1 py-3 text-sm font-medium ${activeSection === 'direct' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-600'}`}
            >
              Direct
            </button>
            <button
              onClick={() => setActiveSection('groups')}
              className={`flex-1 py-3 text-sm font-medium ${activeSection === 'groups' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-600'}`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveSection('channels')}
              className={`flex-1 py-3 text-sm font-medium ${activeSection === 'channels' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-600'}`}
            >
              Channels
            </button>
          </div>
          
          {/* List content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeSection === 'direct' && (
                <motion.div
                  key="direct"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="divide-y divide-gray-100"
                >
                  {searchQuery ? (
                    <div className="p-3">
                      <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">Users</h3>
                      <div className="space-y-2">
                        {filteredUsers.map(user => (
                          <div 
                            key={user.id} 
                            className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                          >
                            <UserAvatar user={user} size="sm" />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-800">{user.name}</div>
                              {user.title && user.company && (
                                <div className="text-xs text-gray-500">{user.title}, {user.company}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {filteredDirectChats.map(chat => {
                        const user = getUserForDirectChat(chat);
                        
                        return (
                          <div 
                            key={chat.id} 
                            className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${selectedChat?.id === chat.id ? 'bg-red-50' : ''}`}
                            onClick={() => handleChatSelect(chat)}
                          >
                            {user ? (
                              <UserAvatar user={user} size="sm" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                {chat.userName.charAt(0)}
                              </div>
                            )}
                            
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-800 truncate">{chat.userName}</span>
                                <span className="text-xs text-gray-500">{formatTime(chat.lastActivity)}</span>
                              </div>
                              
                              {chat.messages.length > 0 && (
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {chat.messages[chat.messages.length - 1].content}
                                  </span>
                                  
                                  {chat.unreadCount > 0 && (
                                    <span className="flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1">
                                      {chat.unreadCount}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </motion.div>
              )}
              
              {activeSection === 'groups' && (
                <motion.div
                  key="groups"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="divide-y divide-gray-100"
                >
                  {filteredGroupChats.map(group => (
                    <div 
                      key={group.id} 
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedChat?.id === group.id ? 'bg-red-50' : ''}`}
                      onClick={() => handleChatSelect(group)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {group.name.split(' ').map(w => w[0]).join('').toUpperCase()}
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-800">{group.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatTime(group.lastActivity)}</span>
                      </div>
                      
                      {group.messages.length > 0 && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            <span className="font-medium">{group.messages[group.messages.length - 1].senderName.split(' ')[0]}: </span>
                            {group.messages[group.messages.length - 1].content}
                          </span>
                          
                          {group.unreadCount > 0 && (
                            <span className="flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1">
                              {group.unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center text-xs text-gray-400">
                        <span>{group.members.length} members</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
              
              {activeSection === 'channels' && (
                <motion.div
                  key="channels"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="divide-y divide-gray-100"
                >
                  {filteredChannels.map(channel => (
                    <div 
                      key={channel.id} 
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedChat?.id === channel.id ? 'bg-red-50' : ''}`}
                      onClick={() => handleChatSelect(channel)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {channel.isPrivate ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="text-sm font-medium text-gray-800">#{channel.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatTime(channel.lastActivity)}</span>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500 truncate">{channel.description}</div>
                      
                      {channel.messages.length > 0 && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            <span className="font-medium">{channel.messages[channel.messages.length - 1].senderName.split(' ')[0]}: </span>
                            {channel.messages[channel.messages.length - 1].content}
                          </span>
                          
                          {channel.unreadCount > 0 && (
                            <span className="flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1">
                              {channel.unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Chat area */}
        <motion.div 
          variants={chatAreaVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col"
        >
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="border-b border-gray-200 p-3 flex justify-between items-center bg-gray-50">
                <div className="flex items-center">
                  <div className="mr-2">
                    {getChatIcon(selectedChat)}
                  </div>
                  
                  {'userName' in selectedChat ? (
                    <span className="font-medium">{selectedChat.userName}</span>
                  ) : 'isPrivate' in selectedChat ? (
                    <span className="font-medium">#{selectedChat.name}</span>
                  ) : (
                    <span className="font-medium">{selectedChat.name}</span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-200 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </button>
                  
                  <button className="p-2 rounded-full hover:bg-gray-200 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {'members' in selectedChat && (
                    <button 
                      className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
                      onClick={() => setShowUsersList(!showUsersList)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Messages area */}
              <div 
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message, index) => (
                      <MessageComponent 
                        key={message.id} 
                        message={message} 
                        isCurrentUser={message.senderId === 'current'} 
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1 bg-white rounded-lg border border-gray-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">
                    <div className="flex items-center p-2">
                      <button 
                        type="button"
                        className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button 
                        type="button"
                        className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 ml-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <textarea
                      className="w-full px-3 py-2 focus:outline-none resize-none text-sm border-0"
                      placeholder={`Message ${'userName' in selectedChat ? selectedChat.userName : ('name' in selectedChat ? selectedChat.name : '')}`}
                      rows={2}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`rounded-full p-2 ${newMessage.trim() ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-sm">Select a conversation from the sidebar or start a new one.</p>
            </div>
          )}
        </motion.div>
        
        {/* Members list sidebar (conditionally rendered) */}
        {showUsersList && selectedChat && 'members' in selectedChat && (
          <div className="w-60 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-medium">Members</h3>
              <p className="text-xs text-gray-500 mt-1">{selectedChat.members.length} members</p>
            </div>
            
            <div className="p-3 space-y-3">
              {selectedChat.members.map(memberId => {
                const user = mockUsers.find(u => u.id === memberId);
                if (!user) return null;
                
                return (
                  <div key={user.id} className="flex items-center">
                    <UserAvatar user={user} size="sm" />
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-800">{user.name}</div>
                      {user.title && user.company && (
                        <div className="text-xs text-gray-500">{user.title}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Create modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium">
                  {modalType === 'channel' ? 'Create a new channel' : 'Create a new group chat'}
                </h3>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalType === 'channel' ? 'Channel name' : 'Group name'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={modalType === 'channel' ? 'e.g. marketing' : 'e.g. Marketing Team'}
                  />
                </div>
                
                {modalType === 'channel' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="What's this channel about?"
                      rows={3}
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add members
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Search by name..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {modalType === 'channel' && (
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="private-channel"
                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="private-channel" className="ml-2 text-sm text-gray-700">
                        Make this channel private
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      When a channel is private, only invited members can view or join.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  onClick={() => setShowCreateModal(false)}
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationHub;