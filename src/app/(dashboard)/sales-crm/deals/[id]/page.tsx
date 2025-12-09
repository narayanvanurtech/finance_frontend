"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dealApi, { CreateDealPayload } from "@/api/dealsApi";
import {
  Business,
  Save,
  AttachMoney,
  Assignment,
  TrendingUp,
} from "@mui/icons-material";

interface DealDetails {
  _id: string;
  dealOwner: string;
  dealName: string;
  accountName: string;
  leadEmail: string;
  leadId: string;
  type: string; // This is the stage field
  nextStep?: string;
  leadSource: string;
  amount: string; // Formatted amount like "$ 2,300,000.00"
  rawAmount: number; // Actual numeric amount
  closingDate: string; // Formatted date like "04/07/2025"
  rawDate: string; // ISO date string
  probability: number;
  expectedRevenue: number;
  createdAt?: string;
  updatedAt?: string;
}

const DealDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [dealData, setDealData] = useState<DealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedDeal, setEditedDeal] = useState<DealDetails | null>(null);

  useEffect(() => {
    const fetchDealDetails = async () => {
      try {
        const response = await dealApi.getDealById(params.id as string);
        setDealData(response.data);
        setEditedDeal(response.data);
      } catch (err) {
        setError("Failed to fetch deal details");
        console.error("Error fetching deal details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDealDetails();
    }
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    
    // Special handling for amount field to remove leading zeros
    if (name === "rawAmount") {
      // Remove leading zeros and convert to number
      const cleanedValue = value.replace(/^0+/, '') || '0';
      newValue = cleanedValue === '' ? 0 : Number(cleanedValue);
    } else if (name === "probability") {
      newValue = Number(value);
    }
    
    setEditedDeal((prev) => {
      if (!prev) return null;
      const updates = { [name]: newValue };
      
      // Calculate expected revenue when amount or probability changes
      if (name === "rawAmount" || name === "probability") {
        const amount = name === "rawAmount" ? Number(newValue) : (prev.rawAmount || 0);
        const probability = name === "probability" ? Number(newValue) : prev.probability;
        updates.expectedRevenue = (amount * probability) / 100;
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedDeal((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (editedDeal && dealData) {
      try {
        setLoading(true);
        const payload: CreateDealPayload = {
          dealName: editedDeal.dealName,
          accountName: editedDeal.accountName,
          type: editedDeal.type, // This is the stage field that API expects
          nextStep: editedDeal.nextStep || "",
          leadSource: editedDeal.leadSource,
          amount: String(editedDeal.rawAmount), // Convert rawAmount to string as expected by API
          closingDate: new Date(editedDeal.rawDate).toISOString(),
          probability: Number(editedDeal.probability),
          expectedRevenue: editedDeal.expectedRevenue,
        };
        await dealApi.updateDeal(dealData._id, payload);
        setDealData(editedDeal);
        setError(null);
      } catch (err) {
        console.error("Error updating deal:", err);
        setError("Failed to update deal");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!dealData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg mb-4">Deal not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Edit Deal</h1>

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

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
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
                    value={editedDeal?.dealName || ""}
                    onChange={handleInputChange}
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
                    value={editedDeal?.accountName || ""}
                    onChange={handleInputChange}
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
                    value={editedDeal?.leadSource || ""}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Select Lead Source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Trade Show">Trade Show</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Other">Other</option>
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
                    name="rawAmount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedDeal?.rawAmount || ""}
                    onChange={handleInputChange}
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
                    name="rawDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedDeal?.rawDate ? editedDeal.rawDate.split("T")[0] : ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Probability: {editedDeal?.probability || 0}%
                  </label>
                  <input
                    type="range"
                    name="probability"
                    min="0"
                    max="100"
                    step="5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    value={editedDeal?.probability || 0}
                    onChange={handleInputChange}
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
                      ₹{((editedDeal?.rawAmount || 0) * (editedDeal?.probability || 0) / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-indigo-600">
                      Based on {editedDeal?.probability || 0}% probability
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedDeal?.type || ""}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Select Stage</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Needs Analysis">Needs Analysis</option>
                    <option value="Value Proposition">Value Proposition</option>
                    <option value="Identify Decision Makers">Identify Decision Makers</option>
                    <option value="Proposal/Price Quote">Proposal/Price Quote</option>
                    <option value="Negotiation/Review">Negotiation/Review</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Step <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="nextStep"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedDeal?.nextStep || ""}
                    onChange={handleInputChange}
                    placeholder="Describe the next step for this deal..."
                  />
                </div>
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
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Metadata Display */}
          {dealData && (dealData.updatedAt || dealData.createdAt) && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                {dealData.updatedAt && (
                  <div className="flex items-center">
                    <span>Last updated: {formatDate(dealData.updatedAt)}</span>
                  </div>
                )}
                {dealData.createdAt && (
                  <div className="flex items-center">
                    <span>Created: {formatDate(dealData.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DealDetails;
