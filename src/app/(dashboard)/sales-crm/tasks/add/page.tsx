"use client";
import React from 'react';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTasksStore } from "@/stores/salesCrmStore/useTasksStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import type { CreateTaskPayload } from "@/api/taskApi";
import {
  Event as EventIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useRoleBasedRouter } from '@/hooks/useRoleBasedRouter';

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const STATUSES = ["open", "progress", "done", "cancel"] as const;

export default function AddTaskPage() {
  const router = useRouter();
  const { pushToRolePath } = useRoleBasedRouter();
  const { addTask, isLoading: storeIsLoading } = useTasksStore();
  const { user } = useAuthStore();
  const { leads, fetchLeads, isLoading: leadsLoading } = useLeadsStore();
  
  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: "",
    description: "",
    priority: "medium",
    status: "open",
  });
  const [selectedLead, setSelectedLead] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch leads when component mounts
  useEffect(() => {
    if (user?.companyId) {
      fetchLeads(user.companyId);
    }
  }, [user?.companyId, fetchLeads]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setError(null); // Clear error when user makes changes
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      
      if (!selectedLead) {
        throw new Error("Please select a lead");
      }
      
      if (!user?.companyId) {
        throw new Error("Company ID is required");
      }
      
      await addTask(selectedLead, user.companyId, formData);
      pushToRolePath("/sales-crm/tasks");
    } catch (error) {
      console.error("Failed to create task:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred while creating the task"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => !isSubmitting && router.back()} 
            disabled={isSubmitting}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
          >
            <BackIcon />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Task Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <EventIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Task Details
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                    placeholder="e.g. Client onboarding for new CRM system"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    placeholder="Coordinate with IT to ensure client access to CRM and provide training materials."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Lead <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="leadId"
                    value={selectedLead}
                    onChange={(e) => setSelectedLead(e.target.value)}
                    disabled={isSubmitting || leadsLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting || leadsLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                  >
                    <option value="">
                      {leadsLoading ? "Loading leads..." : "Select a lead ID for this call"}
                    </option>
                    {leads.map((lead) => (
                      <option key={lead._id} value={lead._id}>
                        {lead.fullName}
                      </option>
                    ))}
                  </select>
                  {/* {leadsLoading && (
                    <p className="mt-1 text-sm text-gray-500">Loading available leads...</p>
                  )} */}
                </div>

                {/* Show selected lead details */}
                {selectedLead && (
                  <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Lead Details:</h4>
                    {(() => {
                      const lead = leads.find(l => l._id === selectedLead);
                      if (!lead) return null;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
     
                          <div className="flex items-center">
                            <PersonIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium text-gray-700">Name:</span>
                            <span className="ml-1 text-gray-900">{lead.firstName} {lead.lastName}</span>
                          </div>
                          <div className="flex items-center">
                            <EmailIcon className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="ml-1 text-gray-900">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center">
                              <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="font-medium text-gray-700">Phone:</span>
                              <span className="ml-1 text-gray-900">{lead.phone}</span>
                            </div>
                          )}
                          {lead.companyName && (
                            <div className="flex items-center">
                              <BusinessIcon className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="font-medium text-gray-700">Company:</span>
                              <span className="ml-1 text-gray-900">{lead.companyName}</span>
                            </div>
                          )}
                          {lead.status && (
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2 text-gray-500">●</span>
                              <span className="font-medium text-gray-700">Status:</span>
                              <span className="ml-1 text-gray-900 capitalize">{lead.status}</span>
                            </div>
                          )}
                          {lead.industry && (
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2 text-gray-500">🏢</span>
                              <span className="font-medium text-gray-700">Industry:</span>
                              <span className="ml-1 text-gray-900">{lead.industry}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => !isSubmitting && router.back()}
              disabled={isSubmitting}
              className={`px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-indigo-600 text-white rounded-md font-medium shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative ${
                isSubmitting ? "opacity-70 cursor-not-allowed bg-indigo-500" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="invisible">Create Task</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}