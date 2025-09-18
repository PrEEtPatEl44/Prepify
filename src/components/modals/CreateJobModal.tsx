// "use client";

// import React, { useState, useEffect } from 'react';
// import { type Job } from '@/app/jobs/jobStore';

// interface CreateJobModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (jobData: Partial<Job>) => void;
//   targetColumn?: string;
// }

// interface FormData {
//   company: string;
//   jobTitle: string;
//   jobDescription: string;
//   selectResume: string;
//   selectCoverletter: string;
//   link: string;
// }

// const CreateJobModal: React.FC<CreateJobModalProps> = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   targetColumn = 'col-1'
// }) => {
//   const [formData, setFormData] = useState<FormData>({
//     company: '',
//     jobTitle: '',
//     jobDescription: '',
//     selectResume: '',
//     selectCoverletter: '',
//     link: '',
//   });
  
//   const [isLoading, setIsLoading] = useState(false);

//   // Reset form when modal opens
//   useEffect(() => {
//     if (isOpen) {
//       setFormData({
//         company: '',
//         jobTitle: '',
//         jobDescription: '',
//         selectResume: '',
//         selectCoverletter: '',
//         link: '',
//       });
//     }
//   }, [isOpen]);

//   const handleInputChange = (field: keyof FormData, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.company.trim() || !formData.jobTitle.trim()) {
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       const jobData: Partial<Job> = {
//         id: `task-${Date.now()}`,
//         name: formData.jobTitle,
//         company: formData.company,
//         column: targetColumn,
//         image: `https://cdn.brandfetch.io/${formData.company.toLowerCase().replace(/\s+/g, '')}.com?c=1idy7WQ5YtpRvbd1DQy`,
//       };

//       await onSubmit(jobData);
//     } catch (error) {
//       console.error('Failed to create job application:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="w-[738px] h-[707px] relative bg-white rounded-2xl shadow-[0px_17px_35px_0px_rgba(23,26,31,0.24)] shadow-[0px_0px_2px_0px_rgba(23,26,31,0.12)] border-neutral-300">
        
//         {/* Header */}
//         <div className="w-80 h-11 left-[25px] top-[26px] absolute justify-start text-zinc-900 text-2xl font-bold font-['Inter'] leading-9">
//           Add Job Application
//         </div>

//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="w-9 h-9 left-[678px] top-[25px] absolute overflow-hidden hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
//           disabled={isLoading}
//         >
//           <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//             <path d="M15 5L5 15M5 5L15 15" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//         </button>

//         {/* Divider */}
//         <div className="w-[738px] h-0 left-0 top-[72px] absolute border border-neutral-300"></div>

//         <form onSubmit={handleSubmit}>
//           {/* Company Field */}
//           <div className="w-[689px] h-20 left-[25px] top-[93px] absolute bg-black/0">
//             <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
//               Company
//             </div>
//             <div className="w-[688px] h-12 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0">
//               <input
//                 type="text"
//                 value={formData.company}
//                 onChange={(e) => handleInputChange('company', e.target.value)}
//                 placeholder="Company"
//                 className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none"
//                 required
//               />
//             </div>
//           </div>

//           {/* Job Title Field */}
//           <div className="w-[689px] h-20 left-[25px] top-[181px] absolute bg-black/0">
//             <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
//               Job Title
//             </div>
//             <div className="w-[688px] h-11 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0">
//               <input
//                 type="text"
//                 value={formData.jobTitle}
//                 onChange={(e) => handleInputChange('jobTitle', e.target.value)}
//                 placeholder="Job Title"
//                 className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none"
//                 required
//               />
//             </div>
//           </div>

//           {/* Job Description Field */}
//           <div className="w-[689px] h-48 left-[25px] top-[266px] absolute bg-black/0">
//             <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
//               Job Description
//             </div>
//             <div className="w-[688px] h-40 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0">
//               <textarea
//                 value={formData.jobDescription}
//                 onChange={(e) => handleInputChange('jobDescription', e.target.value)}
//                 placeholder="Description"
//                 className="w-full h-full bg-transparent px-3 py-2 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none resize-none"
//                 rows={8}
//               />
//             </div>
//           </div>

//           {/* Select Resume Field */}
//           <div className="w-80 h-20 left-[25px] top-[461px] absolute bg-black/0">
//             <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
//               Select Resume
//             </div>
//             <div className="w-80 h-12 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0 relative">
//               <select
//                 value={formData.selectResume}
//                 onChange={(e) => handleInputChange('selectResume', e.target.value)}
//                 className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none appearance-none cursor-pointer"
//               >
//                 <option value="">Select Resume</option>
//                 <option value="resume-1">Software Developer Resume</option>
//                 <option value="resume-2">Frontend Developer Resume</option>
//                 <option value="resume-3">Full Stack Resume</option>
//               </select>
//               <div className="w-4 h-4 left-[302px] top-[16.50px] absolute overflow-hidden pointer-events-none">
//                 <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
//                   <path d="M1 1L6 6L11 1" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Select Cover Letter Field */}
//           <div className="w-80 h-20 left-[378px] top-[461px] absolute bg-black/0">
//             <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
//               Select Coverletter
//             </div>
//             <div className="w-80 h-12 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0 relative">
//               <select
//                 value={formData.selectCoverletter}
//                 onChange={(e) => handleInputChange('selectCoverletter', e.target.value)}
//                 className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none appearance-none cursor-pointer"
//               >
//                 <option value="">Select Coverletter</option>
//                 <option value="cover-1">General Cover Letter</option>
//                 <option value="cover-2">Tech Focused Cover Letter</option>
//                 <option value="cover-3">Startup Cover Letter</option>
//               </select>
//               <div className="w-4 h-4 left-[310px] top-[16.50px] absolute overflow-hidden pointer-events-none">
//                 <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
//                   <path d="M1 1L6 6L11 1" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Link Field */}
//           <div className="w-[689px] h-20 left-[25px] top-[548px] absolute bg-black/0">
//             <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
//               Link
//             </div>
//             <div className="w-[688px] h-11 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0">
//               <input
//                 type="url"
//                 value={formData.link}
//                 onChange={(e) => handleInputChange('link', e.target.value)}
//                 placeholder="Link"
//                 className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none"
//               />
//             </div>
//           </div>

//           {/* Cancel Button */}
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={isLoading}
//             className="w-28 h-11 left-[438px] top-[642px] absolute bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-400 overflow-hidden hover:bg-gray-50 transition-colors disabled:opacity-50"
//           >
//             <div className="left-[32.50px] top-[9px] absolute justify-start text-zinc-400 text-base font-normal font-['Inter'] leading-relaxed">
//               Cancel
//             </div>
//           </button>

//           {/* Save Button */}
//           <button
//             type="submit"
//             disabled={isLoading || !formData.company.trim() || !formData.jobTitle.trim()}
//             className="w-36 h-11 left-[573px] top-[642px] absolute bg-indigo-500 rounded-md outline outline-1 outline-offset-[-1px] outline-black/0 overflow-hidden hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <div className="left-[50.50px] top-[9px] absolute justify-start text-white text-base font-normal font-['Inter'] leading-relaxed">
//               {isLoading ? 'Saving...' : 'Save'}
//             </div>
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateJobModal;


"use client";

import React, { useState, useEffect, useRef } from 'react';
import { type Job } from '@/app/jobs/jobStore';
import { useCompanySearch, type CompanyResult } from '@/hooks/useCompanySearch';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: Partial<Job>) => void;
  targetColumn?: string;
}

interface FormData {
  company: string;
  jobTitle: string;
  jobDescription: string;
  selectResume: string;
  selectCoverletter: string;
  link: string;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetColumn = 'col-1'
}) => {
  const [formData, setFormData] = useState<FormData>({
    company: '',
    jobTitle: '',
    jobDescription: '',
    selectResume: '',
    selectCoverletter: '',
    link: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResult | null>(null);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companyInputFocused, setCompanyInputFocused] = useState(false);
  
  const companyInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { results, loading: searchLoading, searchCompanies, clearResults } = useCompanySearch();

  // Debounced company search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.company && formData.company.length >= 2 && companyInputFocused) {
        searchCompanies(formData.company);
        setShowCompanyDropdown(true);
      } else {
        clearResults();
        setShowCompanyDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.company, companyInputFocused, searchCompanies, clearResults]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
        setCompanyInputFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        company: '',
        jobTitle: '',
        jobDescription: '',
        selectResume: '',
        selectCoverletter: '',
        link: '',
      });
      setSelectedCompany(null);
      setShowCompanyDropdown(false);
      setCompanyInputFocused(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear selected company if user manually types in company field
    if (field === 'company' && selectedCompany) {
      setSelectedCompany(null);
    }
  };

  const handleCompanySelect = (company: CompanyResult) => {
    setFormData(prev => ({ ...prev, company: company.name }));
    setSelectedCompany(company);
    setShowCompanyDropdown(false);
    setCompanyInputFocused(false);
    companyInputRef.current?.blur();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim() || !formData.jobTitle.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const jobData: Partial<Job> = {
        id: `task-${Date.now()}`,
        name: formData.jobTitle,
        company: formData.company,
        column: targetColumn,
        image: selectedCompany?.logoUrl || `https://cdn.brandfetch.io/${formData.company.toLowerCase().replace(/\s+/g, '')}.com?c=1idy7WQ5YtpRvbd1DQy`,
      };

      await onSubmit(jobData);
    } catch (error) {
      console.error('Failed to create job application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[738px] h-[707px] relative bg-white rounded-2xl shadow-[0px_17px_35px_0px_rgba(23,26,31,0.24)] shadow-[0px_0px_2px_0px_rgba(23,26,31,0.12)] border-neutral-300">
        
        {/* Header */}
        <div className="w-80 h-11 left-[25px] top-[26px] absolute justify-start text-zinc-900 text-2xl font-bold font-['Inter'] leading-9">
          Add Job Application
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-9 h-9 left-[678px] top-[25px] absolute overflow-hidden hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Divider */}
        <div className="w-[738px] h-0 left-0 top-[72px] absolute border border-neutral-300"></div>

        <form onSubmit={handleSubmit}>
          {/* Company Field with Search Dropdown */}
          <div className="w-[689px] h-20 left-[25px] top-[93px] absolute bg-black/0">
            <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
              Company
            </div>
            <div className="relative">
              <div className="w-[688px] h-12 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0">
                <input
                  ref={companyInputRef}
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  onFocus={() => {
                    setCompanyInputFocused(true);
                    if (formData.company.length >= 2) {
                      setShowCompanyDropdown(true);
                    }
                  }}
                  placeholder="Company"
                  className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none"
                  required
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Company Search Dropdown */}
              {showCompanyDropdown && results.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-[41px] left-0 w-[688px] bg-white border border-gray-200 rounded-md shadow-lg z-[200] max-h-64 overflow-y-auto"
                >
                  {results.map((company, index) => (
                    <div
                      key={`${company.domain}-${index}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleCompanySelect(company)}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={company.logoUrl}
                          alt={`${company.name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs font-semibold text-gray-600">${company.name.slice(0, 2).toUpperCase()}</span>`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {company.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {company.domain}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job Title Field */}
          <div className="w-[689px] h-20 left-[25px] top-[181px] absolute bg-black/0">
            <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
              Job Title
            </div>
            <div className="w-[688px] h-11 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0">
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="Job Title"
                className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none"
                required
              />
            </div>
          </div>

          {/* Job Description Field */}
          <div className="w-[689px] h-48 left-[25px] top-[266px] absolute bg-black/0">
            <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
              Job Description
            </div>
            <div className="w-[688px] h-40 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0">
              <textarea
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                placeholder="Description"
                className="w-full h-full bg-transparent px-3 py-2 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none resize-none"
                rows={8}
              />
            </div>
          </div>

          {/* Select Resume Field */}
          <div className="w-80 h-20 left-[25px] top-[461px] absolute bg-black/0">
            <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
              Select Resume
            </div>
            <div className="w-80 h-12 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0 relative">
              <select
                value={formData.selectResume}
                onChange={(e) => handleInputChange('selectResume', e.target.value)}
                className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none appearance-none cursor-pointer"
              >
                <option value="">Select Resume</option>
                <option value="resume-1">Software Developer Resume</option>
                <option value="resume-2">Frontend Developer Resume</option>
                <option value="resume-3">Full Stack Resume</option>
              </select>
              <div className="w-4 h-4 left-[302px] top-[16.50px] absolute overflow-hidden pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Select Cover Letter Field */}
          <div className="w-80 h-20 left-[378px] top-[461px] absolute bg-black/0">
            <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
              Select Coverletter
            </div>
            <div className="w-80 h-12 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0 relative">
              <select
                value={formData.selectCoverletter}
                onChange={(e) => handleInputChange('selectCoverletter', e.target.value)}
                className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none appearance-none cursor-pointer"
              >
                <option value="">Select Coverletter</option>
                <option value="cover-1">General Cover Letter</option>
                <option value="cover-2">Tech Focused Cover Letter</option>
                <option value="cover-3">Startup Cover Letter</option>
              </select>
              <div className="w-4 h-4 left-[310px] top-[16.50px] absolute overflow-hidden pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Link Field */}
          <div className="w-[689px] h-20 left-[25px] top-[548px] absolute bg-black/0">
            <div className="left-0 top-0 absolute justify-start text-gray-700 text-lg font-bold font-['Inter'] leading-7">
              Link
            </div>
            <div className="w-[688px] h-11 left-0 top-[29px] absolute bg-gray-100 rounded-md outline outline-1 outline-offset-[-0.50px] outline-black/0">
              <input
                type="url"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="Link"
                className="w-full h-full bg-transparent px-3 text-zinc-900 text-sm font-normal font-['Inter'] leading-snug outline-none"
              />
            </div>
          </div>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-28 h-11 left-[438px] top-[642px] absolute bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-400 overflow-hidden hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <div className="left-[32.50px] top-[9px] absolute justify-start text-zinc-400 text-base font-normal font-['Inter'] leading-relaxed">
              Cancel
            </div>
          </button>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.company.trim() || !formData.jobTitle.trim()}
            className="w-36 h-11 left-[573px] top-[642px] absolute bg-indigo-500 rounded-md outline outline-1 outline-offset-[-1px] outline-black/0 overflow-hidden hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="left-[50.50px] top-[9px] absolute justify-start text-white text-base font-normal font-['Inter'] leading-relaxed">
              {isLoading ? 'Saving...' : 'Save'}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;