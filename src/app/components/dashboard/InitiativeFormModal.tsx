import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import { COMPANIES, PROJECT_PHASES, REGIONS, THEMES } from '../../types/initiatives';
import type { Initiative, ProjectPhase } from '../../types/initiatives';

interface FormData {
  company: string;
  initiative: string;
  challenge: string;
  solution: string;
  callToAction: string;
  links: string;
  theme: string;
  region: string;
  phase: ProjectPhase;
  impactScore: number;
}

interface InitiativeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: Partial<FormData>;
  mode: 'create' | 'edit';
}

const defaultFormData: FormData = {
  company: '',
  initiative: '',
  challenge: '',
  solution: '',
  callToAction: '',
  links: '',
  theme: THEMES[0],
  region: REGIONS[0],
  phase: PROJECT_PHASES[0],
  impactScore: 0
};

// Animation variants
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 300,
      when: 'beforeChildren',
      staggerChildren: 0.05
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 20, 
    transition: { 
      duration: 0.2, 
      ease: 'easeOut' 
    } 
  }
};

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2 } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } }
};

const progressStepVariants: Variants = {
  inactive: { opacity: 0.6, scale: 0.95 },
  active: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 200 } },
  completed: { opacity: 1, backgroundColor: '#e11d48', borderColor: '#e11d48', color: '#ffffff' }
};

const steps = [
  { id: 'basics', label: 'Basic Info' },
  { id: 'details', label: 'Details' },
  { id: 'metadata', label: 'Tags & Impact' },
  { id: 'review', label: 'Review' }
];

const InitiativeFormModal: React.FC<InitiativeFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode 
}) => {
  const [formData, setFormData] = useState<FormData>({...defaultFormData, ...initialData});
  const [currentStep, setCurrentStep] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const controls = useAnimation();
  
  // Reset form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({...defaultFormData, ...initialData});
    } else {
      setFormData(defaultFormData);
    }
    setCurrentStep(0);
  }, [initialData, isOpen]);
  
  // Handle "Escape" key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleFileUpload = (file: File) => {
    setPdfFile(file);
    setIsUploading(true);
    
    // Simulate PDF text extraction and analysis
    setTimeout(() => {
      // In a real implementation, this would be an API call to extract text from PDF
      // For demo purposes, we'll simulate filling the form with extracted data
      setFormData({
        company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
        initiative: "Sustainable Aviation Initiative",
        challenge: "Reducing carbon emissions from air travel while maintaining operational efficiency and passenger comfort.",
        solution: "Virgin is investing in sustainable aviation fuel (SAF) research and development, as well as exploring electric and hydrogen-powered aircraft technologies for short-haul flights.",
        callToAction: "Join our sustainability efforts by offsetting your flight emissions and supporting our research initiatives.",
        links: "https://www.virgin.com/sustainability\nhttps://www.virgin.com/projects/sustainable-aviation",
        theme: "Environmental Sustainability",
        region: "Global",
        phase: "Implementation",
        impactScore: 75
      });
      setIsUploading(false);
      
      // Show success message
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      // Advance to the next step after successful upload
      setTimeout(() => {
        setCurrentStep(1);
      }, 1000);
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        handleFileUpload(file);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isCurrentStepValid = () => {
    if (currentStep === 0) {
      return !!formData.company && !!formData.initiative;
    }
    if (currentStep === 1) {
      return !!formData.challenge && !!formData.solution;
    }
    return true;
  };

  // Determine if form is complete for the final review step
  const isFormComplete = () => {
    return (
      !!formData.company && 
      !!formData.initiative && 
      !!formData.challenge && 
      !!formData.solution
    );
  };

  // Get random placeholder text for drag and drop area
  const getPlaceholderText = () => {
    const placeholders = [
      "Drag and drop your initiative PDF here",
      "Got a proposal document? Drop it here!",
      "Upload your initiative details as PDF",
      "Quick import: Drop your PDF document"
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <div 
            className="absolute inset-0 bg-transparent backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible" 
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-600 to-red-700 text-white">
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold">
                  {mode === 'create' ? 'Create New Initiative' : 'Edit Initiative'}
                </h2>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>

              {/* Progress Steps */}
              <motion.div 
                className="flex justify-between mt-6 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Progress bar background */}
                <div className="absolute h-1 bg-white/30 rounded top-4 left-0 right-0 z-0" />
                
                {/* Active progress bar */}
                <motion.div 
                  className="absolute h-1 bg-white rounded top-4 left-0 z-10"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
                
                {steps.map((step, index) => (
                  <motion.div 
                    key={step.id}
                    className="flex flex-col items-center relative z-20"
                    variants={progressStepVariants}
                    initial="inactive"
                    animate={
                      index === currentStep 
                        ? "active" 
                        : index < currentStep 
                          ? "completed" 
                          : "inactive"
                    }
                  >
                    <div 
                      className={`
                        w-9 h-9 rounded-full flex items-center justify-center border-2 
                        ${index < currentStep 
                          ? 'bg-red-600 border-red-600 text-white' 
                          : index === currentStep 
                            ? 'border-red-600 text-red-600' 
                            : 'border-gray-300 text-gray-400 dark:border-gray-600'}
                        mb-1 z-10
                      `}
                    >
                      {index < currentStep ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">{step.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Form content */}
            <motion.div 
              className="flex-1 overflow-y-auto p-6"
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form ref={formRef} className="space-y-5">
                {currentStep === 0 && (
                  <>
                    {/* Basic Info Step */}
                    <div className="space-y-6">
                      <motion.div
                        variants={formItemVariants}
                        className="mb-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Initiative Basics</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          Start by providing the fundamental information about this Virgin initiative.
                        </p>
                      </motion.div>

                      {/* PDF Upload Section (only for create mode) */}
                      {mode === 'create' && (
                        <motion.div 
                          variants={formItemVariants}
                          className="mb-6"
                        >
                          <div 
                            className={`
                              rounded-xl border-2 border-dashed p-6 transition-all duration-300
                              ${isUploading ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800' : 'bg-gray-50 border-gray-300 dark:bg-gray-800/50 dark:border-gray-700'}
                              ${uploadSuccess ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800' : ''}
                            `}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className="flex flex-col items-center justify-center text-center">
                              <motion.div 
                                animate={{ 
                                  rotate: isUploading ? 360 : 0,
                                }}
                                transition={{ 
                                  duration: 1.5, 
                                  repeat: isUploading ? Infinity : 0,
                                  ease: "linear" 
                                }}
                                className="mb-4"
                              >
                                {uploadSuccess ? (
                                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                ) : isUploading ? (
                                  <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                  </div>
                                )}
                              </motion.div>
                              
                              <h4 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-1">
                                {uploadSuccess 
                                  ? 'Document parsed successfully!'
                                  : isUploading 
                                    ? 'Processing document...'
                                    : 'Upload Initiative Document'
                                }
                              </h4>
                              
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {uploadSuccess 
                                  ? 'We\'ve extracted the content and filled the form fields'
                                  : isUploading 
                                    ? 'Extracting content from your document...'
                                    : pdfFile 
                                      ? pdfFile.name 
                                      : getPlaceholderText()
                                }
                              </p>
                              
                              {!isUploading && !uploadSuccess && (
                                <span className="px-4 py-2 text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                                  PDF files only
                                </span>
                              )}
                              
                              <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <motion.div variants={formItemVariants}>
                        <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Virgin Company <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <select 
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            required
                          >
                            <option value="">Select a Virgin company</option>
                            {COMPANIES.map(company => (
                              <option key={company} value={company}>{company}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={formItemVariants}>
                        <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Initiative Name <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <input 
                            type="text"
                            value={formData.initiative}
                            onChange={(e) => setFormData({...formData, initiative: e.target.value})}
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                            placeholder="Enter a compelling initiative name"
                            required
                          />
                        </div>
                      </motion.div>
                    </div>
                  </>
                )}
                
                {currentStep === 1 && (
                  <>
                    {/* Details Step */}
                    <div className="space-y-6">
                      <motion.div
                        variants={formItemVariants}
                        className="mb-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Initiative Details</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          Describe the challenge and solution in detail.
                        </p>
                      </motion.div>
                      
                      <motion.div variants={formItemVariants}>
                        <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Challenge <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <textarea 
                            value={formData.challenge}
                            onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                            className="block w-full p-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                            placeholder="Describe the challenge this initiative addresses"
                            rows={4}
                            required
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                            {formData.challenge.length} characters
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={formItemVariants}>
                        <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                          What Virgin is doing <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <textarea 
                            value={formData.solution}
                            onChange={(e) => setFormData({...formData, solution: e.target.value})}
                            className="block w-full p-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                            placeholder="Describe Virgin's approach and solution"
                            rows={4}
                            required
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                            {formData.solution.length} characters
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={formItemVariants}>
                        <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Call to Action
                        </label>
                        <div className="relative">
                          <textarea 
                            value={formData.callToAction}
                            onChange={(e) => setFormData({...formData, callToAction: e.target.value})}
                            className="block w-full p-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                            placeholder="What actions can people take to support this initiative?"
                            rows={3}
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div variants={formItemVariants}>
                        <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Links
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <textarea 
                            value={formData.links}
                            onChange={(e) => setFormData({...formData, links: e.target.value})}
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                            placeholder="Add relevant links, one per line"
                            rows={3}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </>
                )}
                
                {currentStep === 2 && (
                  <>
                    {/* Metadata Step */}
                    <div className="space-y-6">
                      <motion.div
                        variants={formItemVariants}
                        className="mb-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Classification & Impact</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          Categorize and evaluate the initiative's impact.
                        </p>
                      </motion.div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div variants={formItemVariants}>
                          <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Theme
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                              </svg>
                            </div>
                            <select 
                              value={formData.theme}
                              onChange={(e) => setFormData({...formData, theme: e.target.value})}
                              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            >
                              {THEMES.map(theme => (
                                <option key={theme} value={theme}>{theme}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div variants={formItemVariants}>
                          <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Region
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <select 
                              value={formData.region}
                              onChange={(e) => setFormData({...formData, region: e.target.value})}
                              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            >
                              {REGIONS.map(region => (
                                <option key={region} value={region}>{region}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div variants={formItemVariants}>
                          <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Phase
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <select 
                              value={formData.phase}
                              onChange={(e) => setFormData({...formData, phase: e.target.value as ProjectPhase})}
                              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            >
                              {PROJECT_PHASES.map(phase => (
                                <option key={phase} value={phase}>{phase}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      <motion.div variants={formItemVariants} className="mt-6">
                        <label className="block font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Impact Score (0-100)
                        </label>
                        <div className="space-y-2">
                          <div className="relative">
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              value={formData.impactScore}
                              onChange={(e) => setFormData({...formData, impactScore: parseInt(e.target.value) || 0})}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 dark:bg-gray-700"
                            />
                            <div 
                              className="absolute top-6 left-0 right-0 flex justify-between text-xs text-gray-500"
                            >
                              <span>0</span>
                              <span>20</span>
                              <span>40</span>
                              <span>60</span>
                              <span>80</span>
                              <span>100</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-6">
                            <div 
                              className={`
                                w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-3
                                ${formData.impactScore < 30 
                                  ? 'bg-yellow-500' 
                                  : formData.impactScore < 70 
                                    ? 'bg-blue-500' 
                                    : 'bg-green-500'
                                }
                              `}
                            >
                              {formData.impactScore}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-white">
                                {formData.impactScore < 30 
                                  ? 'Low Impact' 
                                  : formData.impactScore < 70 
                                    ? 'Medium Impact' 
                                    : 'High Impact'
                                }
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formData.impactScore < 30 
                                  ? 'Localized effect with limited reach' 
                                  : formData.impactScore < 70 
                                    ? 'Significant impact within target area' 
                                    : 'Transformative impact with broad reach'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </>
                )}
                
                {currentStep === 3 && (
                  <>
                    {/* Review Step */}
                    <div className="space-y-6">
                      <motion.div
                        variants={formItemVariants}
                        className="mb-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Review Initiative</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          Please review all information before submitting.
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        variants={formItemVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="bg-red-600 p-4 text-white">
                          <h3 className="text-xl font-bold">{formData.initiative || 'Initiative Name'}</h3>
                          <p className="text-white/90">{formData.company || 'Virgin Company'}</p>
                        </div>
                        
                        <div className="p-4 space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Challenge</h4>
                            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-sm">
                              {formData.challenge || 'No challenge description provided'}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Virgin's Solution</h4>
                            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-sm">
                              {formData.solution || 'No solution description provided'}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                              <span className="text-xs text-gray-500 dark:text-gray-400 block">Theme</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{formData.theme}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                              <span className="text-xs text-gray-500 dark:text-gray-400 block">Region</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{formData.region}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                              <span className="text-xs text-gray-500 dark:text-gray-400 block">Phase</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{formData.phase}</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Impact Score</span>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formData.impactScore}/100</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`
                                  h-full rounded-full
                                  ${formData.impactScore < 30 
                                    ? 'bg-yellow-500' 
                                    : formData.impactScore < 70 
                                      ? 'bg-blue-500' 
                                      : 'bg-green-500'
                                  }
                                `}
                                style={{ width: `${formData.impactScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      {!isFormComplete() && (
                        <motion.div 
                          variants={formItemVariants}
                          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg"
                        >
                          <div className="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                              <h4 className="font-medium">Missing information</h4>
                              <p className="text-sm mt-1">
                                Please complete all required fields before submitting.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </form>
            </motion.div>
            
            {/* Footer with navigation buttons */}
            <div className="relative p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                  px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors
                  ${currentStep > 0 
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800' 
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }
                `}
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </motion.button>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </div>
              
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                  px-5 py-2 rounded-lg flex items-center space-x-1
                  ${currentStep === steps.length - 1 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                  ${!isCurrentStepValid() || (currentStep === steps.length - 1 && !isFormComplete())
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                  }
                `}
                onClick={handleNextStep}
                disabled={!isCurrentStepValid() || (currentStep === steps.length - 1 && !isFormComplete())}
              >
                <span>
                  {currentStep === steps.length - 1 
                    ? (mode === 'create' ? 'Create Initiative' : 'Save Changes')
                    : 'Continue'
                  }
                </span>
                {currentStep < steps.length - 1 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InitiativeFormModal;