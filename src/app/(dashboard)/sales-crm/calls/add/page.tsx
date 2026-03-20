"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import type { CreateCallRequest } from "@/api/callsApi";
import {
  Call as CallIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const CALL_TYPES = ["outbound", "inbound"] as const;
const CALL_STATUSES = ["scheduled", "completed", "missed", "cancel"] as const;

export default function AddCallPage() {
  const router = useRouter();
  const { addCall, isLoading: storeIsLoading } = useCallsStore();
  const { user } = useAuthStore();
  const { leads, fetchLeads, isLoading: leadsLoading } = useLeadsStore();
  
  const [formData, setFormData] = useState<CreateCallRequest>({
    callType: "outbound",
    outgoingCallStatus: "scheduled",
    callStartTime: "",
    callPurpose: "",
    callAgenda: "",
    callResult: "",
    notes: "",
    description: "",
    reminder: true,
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
      if (!formData.callPurpose.trim()) {
        throw new Error("Call purpose is required");
      }
      
      if (!formData.callAgenda.trim()) {
        throw new Error("Call agenda is required");
      }
      
      if (!formData.callStartTime) {
        throw new Error("Call start time is required");
      }
      
      if (!selectedLead) {
        throw new Error("Please select a lead ID");
      }

      // Validate that selectedLead is a valid MongoDB ObjectId (24 characters, hexadecimal)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(selectedLead)) {
        throw new Error("Invalid lead ID format. Please select a valid lead.");
      }
      
      if (!user?.companyId) {
        throw new Error("Company ID is required");
      }
      
      console.log("Creating call for Lead ID:", selectedLead);
      console.log("Selected lead full object:", leads.find(l => (l.id || l._id) === selectedLead));
      
      await addCall(selectedLead, formData);
      router.push("/sales-crm/calls");
    } catch (error) {
      console.error("Failed to create call:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred while creating the call"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.companyId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Information Required</h2>
          <p className="text-gray-500 mb-4">Please ensure you are logged in with a valid company account</p>
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:text-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => !isSubmitting && router.back()} 
            disabled={isSubmitting}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
          >
            <BackIcon />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Schedule New Call</h1>
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
          {/* Lead Selection */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PersonIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Lead Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Lead ID <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedLead}
                    onChange={(e) => {
                      const leadId = e.target.value.trim(); // Ensure no extra whitespace
                      console.log("Raw dropdown value:", e.target.value);
                      console.log("Cleaned lead ID:", leadId);
                      setSelectedLead(leadId);
                    }}
                    disabled={isSubmitting || leadsLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting || leadsLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                  >
                    <option value="">
                      {leadsLoading ? "Loading leads..." : "Select a lead ID for this call"}
                    </option>
                    {leads.map((lead) => {
                      const leadId = lead.id || lead._id;
                      return (
                        <option key={leadId} value={leadId}>
                          {lead.firstName} {lead.lastName}
                        </option>
                      );
                    })}
                  </select>
                  {!leadsLoading && leads.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No leads available. Please create a lead first to schedule calls.
                    </p>
                  )}
                </div>

                {/* Show selected lead details */}
                {selectedLead && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Lead Details:</h4>
                    {(() => {
                      const lead = leads.find(l => (l.id || l._id) === selectedLead);
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

          {/* Call Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CallIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Call Details
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="callType"
                    value={formData.callType}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                  >
                    {CALL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="outgoingCallStatus"
                    value={formData.outgoingCallStatus}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                  >
                    {CALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="callStartTime"
                    value={formData.callStartTime}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="callPurpose"
                    value={formData.callPurpose}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                    placeholder="e.g. Follow-up on product demo"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Agenda <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="callAgenda"
                    value={formData.callAgenda}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    required
                    placeholder="Detailed agenda for the call including key discussion points and objectives."
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="reminder"
                      checked={formData.reminder}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Set reminder for this call
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DescriptionIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Additional Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Result
                  </label>
                  <input
                    type="text"
                    name="callResult"
                    value={formData.callResult || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    placeholder="Expected or actual result of the call (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    placeholder="Additional notes or special instructions (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    placeholder="Detailed description of the call context (optional)"
                  />
                </div>
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </>
              ) : (
                "Schedule Call"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


