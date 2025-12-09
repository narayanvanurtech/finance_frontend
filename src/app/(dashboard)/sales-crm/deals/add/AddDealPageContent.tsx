"use client";

import React, { useState, useEffect } from "react";
import {
  Business,
  Save,
  AttachMoney,
  CalendarToday,
  Assignment,
  TrendingUp,
} from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { useDealsStore } from "@/stores/salesCrmStore/useDealsStore";
import { getLeadById } from "@/api/leadsApi";
import { Lead } from "@/api/leadsApi";

const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Social Media",
  "Advertisement",
  "Trade Show",
  "Cold Call",
  "Other",
];

interface DealFormData {
  dealName: string;
  accountName: string;
  nextStep: string;
  leadSource: string;
  amount: number;
  closingDate: string;
  probability: number;
  expectedRevenue: number;
}

export default function AddDealPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const { addDeal, isLoading, error } = useDealsStore();
  const [leadData, setLeadData] = useState<Lead | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [formData, setFormData] = useState<DealFormData>({
    dealName: "",
    accountName: "",
    nextStep: "",
    leadSource: "Website",
    amount: 0,
    closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    probability: 45,
    expectedRevenue: 0,
  });

  // Fetch lead data if leadId is provided
  useEffect(() => {
    if (leadId) {
      const fetchLeadData = async () => {
        setIsLoadingLead(true);
        try {
          // We need companyId to fetch lead details
          // Since we can't access the store directly here, we'll handle the case where companyId isn't available
          // Try to fetch using a default company ID or get it from the URL
          const companyId = localStorage.getItem('currentCompanyId') || ''; // Use empty string as fallback
          const response = await getLeadById(leadId, companyId);
          const lead = response.result; // Changed from response.data to response.result based on GetLeadResponse interface
          setLeadData(lead);
          
          // Pre-fill form with lead data
          setFormData(prev => ({
            ...prev,
            dealName: `${lead.title || 'Deal'}`,
            accountName: lead.email,
            leadSource: lead.source, // Changed from leadSource to source based on Lead interface
          }));
        } catch (error) {
          console.error('Error fetching lead data:', error);
        } finally {
          setIsLoadingLead(false);
        }
      };
      
      fetchLeadData();
    }
  }, [leadId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    let newValue: string | number = value;
    
    // Special handling for amount field to remove leading zeros
    if (name === "amount") {
      // Remove leading zeros and convert to number
      const cleanedValue = value.replace(/^0+/, '') || '0';
      newValue = cleanedValue === '' ? 0 : Number(cleanedValue);
    } else if (name === "probability") {
      newValue = Number(value);
    }
    
    setFormData(prev => {
      const updates = { [name]: newValue };
      
      // Calculate expected revenue when amount or probability changes
      if (name === "amount" || name === "probability") {
        const amount = name === "amount" ? Number(newValue) : prev.amount;
        const probability = name === "probability" ? Number(newValue) : prev.probability;
        updates.expectedRevenue = (amount * probability) / 100;
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDeal({
        dealName: formData.dealName,
        accountName: formData.accountName,
        type: "Qualification", // Default stage for new deals
        leadSource: formData.leadSource,
        amount: String(formData.amount), // Convert amount to string as expected by API
        closingDate: new Date(formData.closingDate).toISOString(),
        probability: formData.probability,
        expectedRevenue: formData.expectedRevenue,
        nextStep: formData.nextStep,
      });
      router.push("/deals");
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Create New Deal</h1>

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
          {/* Deal Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Business className="w-5 h-5 mr-2 text-indigo-600" />
                Deal Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dealName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.dealName}
                    onChange={handleChange}
                    required
                    placeholder="Enter deal name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="accountName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.accountName}
                    onChange={handleChange}
                    required
                    placeholder="Enter account email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="leadSource"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.leadSource}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Lead Source</option>
                    {LEAD_SOURCES.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AttachMoney className="w-5 h-5 mr-2 text-indigo-600" />
                Financial Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Close Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="closingDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.closingDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Probability: {formData.probability}%
                  </label>
                  <input
                    type="range"
                    name="probability"
                    min="0"
                    max="100"
                    step="5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    value={formData.probability}
                    onChange={handleChange}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Revenue
                  </label>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                    <div className="text-2xl font-bold text-indigo-900">
                      ₹{formData.expectedRevenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-indigo-600">
                      Based on {formData.probability}% probability
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Assignment className="w-5 h-5 mr-2 text-indigo-600" />
                Additional Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Step <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="nextStep"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.nextStep}
                  onChange={handleChange}
                  placeholder="Describe the next step for this deal..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Deal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 