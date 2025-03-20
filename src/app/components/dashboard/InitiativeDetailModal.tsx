import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedInitiative } from '../../types/initiatives';

interface InitiativeDetailModalProps {
  initiative: EnhancedInitiative;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const InitiativeDetailModal: React.FC<InitiativeDetailModalProps> = ({ 
  initiative, 
  onClose,
  onEdit,
  onDelete
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header with Close Button */}
        <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold pr-8">{initiative["Initiaitive"]}</h2>
          <p className="text-white/90">{initiative["Virgin Company"]}</p>
        </div>

        {/* Modal Content with Scrollable Area */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Project Details */}
            <div className="md:col-span-2 space-y-6">
              <section>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Challenge</h3>
                <p className="text-gray-700">{initiative["Challenge"]}</p>
              </section>
              
              <section>
                <h3 className="text-xl font-bold mb-3 text-gray-800">What Virgin is Doing</h3>
                <p className="text-gray-700">{initiative["What Virgin is doing"]}</p>
              </section>
              
              <section>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Call to Action</h3>
                <div className="text-gray-700 whitespace-pre-line">{initiative["Call to Action"]}</div>
              </section>
              
              {initiative.links && (
                <section>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Relevant Links</h3>
                  <div className="space-y-2">
                    {typeof initiative["Links"] === 'string' && initiative["Links"].split('\n').map((link, index) => (
                      link && (
                        <a 
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-red-600 hover:underline break-all"
                        >
                          {link}
                        </a>
                      )
                    ))}
                  </div>
                </section>
              )}
              
              {initiative.milestones && initiative.milestones.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Project Timeline</h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-4">
                      {initiative.milestones.map((milestone, index) => (
                        <div key={index} className="relative pl-10">
                          <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center ${
                            milestone.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : milestone.status === 'in-progress'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                          }`}>
                            {milestone.status === 'completed' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : milestone.status === 'in-progress' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                            <p className="text-sm text-gray-500">{formatDate(milestone.dueDate)}</p>
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            {milestone.completedDate && (
                              <p className="text-sm text-green-600 mt-1">
                                Completed on {formatDate(milestone.completedDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
            
            {/* Right Column: Stats and Metrics */}
            <div className="space-y-6">
              {/* Project Stats Card */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Project Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize">{initiative.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formatDate(initiative.startDate)}</span>
                  </div>
                  {initiative.targetCompletionDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Completion:</span>
                      <span className="font-medium">{formatDate(initiative.targetCompletionDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Theme:</span>
                    <span className="font-medium">{initiative.theme || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium">{initiative.region || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impact Score:</span>
                    <span className="font-medium text-red-600">{initiative.impactScore}</span>
                  </div>
                </div>
              </div>
              
              {/* Team Members */}
              {initiative.teamMembers && initiative.teamMembers.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-3 text-gray-800">Team</h3>
                  <div className="space-y-3">
                    {initiative.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                          {member.name[0]}{member.name.split(' ')[1]?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Key Metrics */}
              {initiative.metrics && Object.keys(initiative.metrics).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-3 text-gray-800">Key Metrics</h3>
                  <div className="space-y-3">
                    {Object.entries(initiative.metrics).map(([key, value], index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Resources */}
              {initiative.resources && initiative.resources.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-3 text-gray-800">Resources</h3>
                  <div className="space-y-3">
                    {initiative.resources.map((resource, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-0.5 mr-3 text-gray-400">
                          {resource.type === 'document' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          ) : resource.type === 'image' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-red-600 hover:underline"
                          >
                            {resource.title}
                          </a>
                          <p className="text-xs text-gray-500">
                            {resource.size && `${resource.size} • `}{formatDate(resource.uploadDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Action Bar */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <div className="space-x-3">
            {onDelete && (
              <button 
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                onClick={onDelete}
              >
                Delete Initiative
              </button>
            )}
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="space-x-3">
            {onEdit && (
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={onEdit}
              >
                Edit Initiative
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InitiativeDetailModal;