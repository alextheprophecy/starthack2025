"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";

export default function InternalPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    company: "",
    initiative: "",
    challenge: "",
    virginDoing: "",
    callToAction: "",
    links: ""
  });
  const [submitStatus, setSubmitStatus] = useState({ success: false, error: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.userType !== 'internal') {
      router.push("/");
    }
  }, [user, router]);

  // Don't render the page content if not authenticated or not internal user
  if (!user || user.userType !== 'internal') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ success: false, error: "" });

    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          virginCompany: formData.company,
          initiative: formData.initiative,
          challenge: formData.challenge,
          whatVirginIsDoing: formData.virginDoing,
          callToAction: formData.callToAction,
          links: formData.links
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add challenge');
      }

      // Reset form and show success message
      setFormData({
        company: "",
        initiative: "",
        challenge: "",
        virginDoing: "",
        callToAction: "",
        links: ""
      });
      setSubmitStatus({ success: true, error: "" });
    } catch (error) {
      setSubmitStatus({ success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-red-600">Virgin Initiatives - Internal Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user.email}</span>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-6">Add New Challenge</h2>
          
          {submitStatus.success && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md">
              Challenge added successfully!
            </div>
          )}
          
          {submitStatus.error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
              Error: {submitStatus.error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Virgin Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="initiative" className="block text-sm font-medium text-gray-700 mb-1">
                    Initiative
                  </label>
                  <input
                    type="text"
                    id="initiative"
                    name="initiative"
                    value={formData.initiative}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="challenge" className="block text-sm font-medium text-gray-700 mb-1">
                    Challenge
                  </label>
                  <textarea
                    id="challenge"
                    name="challenge"
                    value={formData.challenge}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  ></textarea>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="virginDoing" className="block text-sm font-medium text-gray-700 mb-1">
                    What Virgin is Doing
                  </label>
                  <textarea
                    id="virginDoing"
                    name="virginDoing"
                    value={formData.virginDoing}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="callToAction" className="block text-sm font-medium text-gray-700 mb-1">
                    Call to Action
                  </label>
                  <textarea
                    id="callToAction"
                    name="callToAction"
                    value={formData.callToAction}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="- Action item 1&#10;- Action item 2"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="links" className="block text-sm font-medium text-gray-700 mb-1">
                    Links
                  </label>
                  <textarea
                    id="links"
                    name="links"
                    value={formData.links}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com&#10;https://another-example.com"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors hover:cursor-pointer"
              >
                {isSubmitting ? 'Adding Challenge...' : 'Add Challenge'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 