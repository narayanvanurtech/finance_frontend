"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import leadsApi, { Call, CreateCallRequest } from "@/api/leadsApi";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

// Extend the interface to include all fields from the response
interface ExtendedCall extends Call {
  _id: string;
  callOwner: string;
  callResult: string | null;
  description: string | null;
  leadEmail: string;
}

const CallEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;
  const callId = params.callId as string;
  const type = searchParams.get("type") as "open" | "close" | null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [call, setCall] = useState<ExtendedCall | null>(null);
  const [formData, setFormData] = useState<CreateCallRequest & {
    callResult?: string | null;
    callOwner?: string;
    description?: string | null;
    leadEmail?: string;
  }>({
    callType: "outbound",
    outgoingCallStatus: "scheduled",
    callStartTime: new Date().toISOString(),
    callPurpose: "",
    callAgenda: "",
    subject: "",
    reminder: false,
    notes: "",
    callResult: null,
    description: null,
    leadEmail: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    fetchCallData();
  }, [leadId, callId]);

  const fetchCallData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leadsApi.getCall(leadId, callId, type || undefined);
      console.log("Call data received:", response.data);
      console.log("Using callId from response:", response.data.callId);
      setCall(response.data);
      setFormData({
        callType: response.data.callType as "inbound" | "outbound",
        outgoingCallStatus:
          (response.data.outgoingCallStatus as
            | "scheduled"
            | "completed"
            | "cancelled") || "scheduled",
        callStartTime: response.data.callStartTime,
        callPurpose: response.data.callPurpose,
        callAgenda: response.data.callAgenda,
        subject: response.data.subject,
        reminder: response.data.reminder,
        notes: response.data.notes,
        callResult: response.data.callResult,
        callOwner: response.data.callOwner,
        description: response.data.description,
        leadEmail: response.data.leadEmail || "",
      });
      // Store the owner name for display
      setOwnerName(response.data.callOwner);
    } catch (error) {
      console.error("Error fetching call:", error);
      setError("Failed to load call details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!call || !call.callId) {
        throw new Error("Call data not found");
      }
      
      // Extract only the fields needed for the API call
      const callUpdateData: Partial<CreateCallRequest> & { 
        callResult?: string | null;
        description?: string | null;
        leadEmail?: string;
      } = {
        callType: formData.callType,
        outgoingCallStatus: formData.outgoingCallStatus,
        callStartTime: formData.callStartTime,
        callPurpose: formData.callPurpose,
        callAgenda: formData.callAgenda,
        subject: formData.subject,
        reminder: formData.reminder,
        notes: formData.notes,
        callResult: formData.callResult,
        description: formData.description,
        leadEmail: formData.leadEmail
      };
      
      // Call the editCall API
      await leadsApi.editCall(leadId, call.callId, callUpdateData);
      router.back();
    } catch (error) {
      console.error("Error updating call:", error);
      setError("Failed to update call. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading call details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Edit Call</h1>

        {/* Error Display */}
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

        <form onSubmit={handleSave} className="space-y-8">
          {/* Call Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Call Details</h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter call subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.leadEmail || ""}
                    onChange={(e) => handleInputChange("leadEmail", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter lead email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.callType}
                    onChange={(e) => handleInputChange("callType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Call Type</option>
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.outgoingCallStatus}
                    onChange={(e) => handleInputChange("outgoingCallStatus", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Start Time <span className="text-red-500">*</span>
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      value={new Date(formData.callStartTime)}
                      onChange={(newValue) => {
                        if (newValue) {
                          handleInputChange("callStartTime", newValue.toISOString());
                        }
                      }}
                      className="w-full"
                      slotProps={{
                        textField: {
                          className: "w-full",
                          size: "small",
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between border border-gray-300 rounded-md p-3 hover:border-indigo-500 transition-all">
                    <span className="text-sm font-medium text-gray-700">Set Reminder</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.reminder}
                        onChange={(e) => handleInputChange("reminder", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Call Information</h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.callPurpose}
                    onChange={(e) => handleInputChange("callPurpose", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    placeholder="Enter call purpose"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agenda <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formData.callAgenda}
                    onChange={(e) => handleInputChange("callAgenda", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    placeholder="Enter call agenda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    placeholder="Enter call notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Result <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formData.callResult || ''}
                    onChange={(e) => handleInputChange("callResult", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    placeholder="Enter call result"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    placeholder="Enter call description"
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
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CallEditPage;
