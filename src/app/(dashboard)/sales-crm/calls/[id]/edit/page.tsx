"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Notes as NotesIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  ArrowBack as BackIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Call as CallIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

const CALL_TYPES = ["outbound", "inbound"] as const;
const CALL_STATUSES = ["scheduled", "completed", "missed", "cancel"] as const;

const EditCallPage = () => {
  const router = useRouter();
  const params = useParams();
  const callId = params?.id as string;

  const { currentCall, currentCallDetails, updateCall, fetchCallById } =
    useCallsStore();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    callType: "outbound" | "inbound";
    outgoingCallStatus: "scheduled" | "completed" | "missed" | "cancel";
    callStartTime: string;
    callPurpose: string;
    callAgenda: string;
    callResult: string;
    notes: string;
    description: string;
  }>({
    callType: "outbound",
    outgoingCallStatus: "scheduled",
    callStartTime: new Date().toISOString(),
    callPurpose: "",
    callAgenda: "",
    callResult: "",
    notes: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (callId) {
        setLoading(true);
        try {
          await fetchCallById(callId);
        } catch (error) {
          console.error("Error fetching call:", error);
          setError("Failed to load call details. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [callId, fetchCallById]);

  useEffect(() => {
    if (currentCall) {
      setFormData({
        callType:
          currentCall.callType === "outbound" ||
          currentCall.callType === "inbound"
            ? currentCall.callType
            : "outbound",
        outgoingCallStatus: [
          "scheduled",
          "completed",
          "missed",
          "cancel",
        ].includes(currentCall.outgoingCallStatus || "")
          ? (currentCall.outgoingCallStatus as
              | "scheduled"
              | "completed"
              | "missed"
              | "cancel")
          : "scheduled",
        callStartTime: currentCall.callStartTime || new Date().toISOString(),
        callPurpose: currentCall.callPurpose || "",
        callAgenda: currentCall.callAgenda || "",
        callResult: currentCall.callResult || "",
        notes: currentCall.notes || "",
        description: currentCall.description || "",
      });
    }
  }, [currentCall]);

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!currentCall) {
        throw new Error("Call data not found");
      }

      await updateCall(callId, formData);
      setSuccessMessage("Call updated successfully!");

      setTimeout(() => {
        router.push(`/sales-crm/calls/${callId}`);
      }, 1000);
    } catch (error: any) {
      console.error("Error updating call:", error);
      setError(error?.message || "Failed to update call. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/sales-crm/calls/${callId}`);
  };

  if (loading || !currentCall) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get call owner and lead info
  const callOwner =
    typeof currentCall.callOwner === "object" ? currentCall.callOwner : null;
  const leadInfo =
    typeof currentCall.leadId === "object" ? currentCall.leadId : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Edit Call
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-1 text-sm text-green-700">
                  {successMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rest of your existing editable form sections... */}
          {/* Call Details Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2 text-indigo-600" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.callType}
                    onChange={(e) =>
                      handleInputChange("callType", e.target.value)
                    }
                    required
                  >
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.outgoingCallStatus}
                    onChange={(e) =>
                      handleInputChange("outgoingCallStatus", e.target.value)
                    }
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="cancel">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Start Time <span className="text-red-500">*</span>
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      value={
                        formData.callStartTime
                          ? new Date(formData.callStartTime)
                          : new Date()
                      }
                      onChange={(newValue) => {
                        if (newValue) {
                          handleInputChange("callStartTime", newValue);
                        }
                      }}
                      className="w-full"
                      slotProps={{
                        textField: {
                          variant: "outlined",
                          className:
                            "w-full border border-gray-300 rounded-md shadow-sm",
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </div>
          </div>

          {/* Call Purpose and Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DescriptionIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Call Purpose and Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    value={formData.callPurpose}
                    onChange={(e) =>
                      handleInputChange("callPurpose", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agenda <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] whitespace-pre-wrap"
                    value={formData.callAgenda}
                    onChange={(e) =>
                      handleInputChange("callAgenda", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Call Results and Notes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <NotesIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Call Results and Notes
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Result{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] whitespace-pre-wrap"
                    value={formData.callResult || ""}
                    onChange={(e) =>
                      handleInputChange("callResult", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] whitespace-pre-wrap"
                    value={formData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] whitespace-pre-wrap"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Call Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Call Owner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Owner
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {callOwner ? (
                      <>
                        <p className="font-medium text-gray-900 flex items-center">
                          {callOwner.name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          {callOwner.email || "No email"}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">No owner assigned</p>
                    )}
                  </div>
                </div>

                {/* Lead Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {leadInfo ? (
                      <>
                        <p className="font-medium text-gray-900">
                          {leadInfo.firstName} {leadInfo.lastName}
                        </p>
                        {leadInfo.email && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <EmailIcon className="w-4 h-4 mr-1" />
                            {leadInfo.email}
                          </p>
                        )}
                        {leadInfo.phone && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {leadInfo.phone}
                          </p>
                        )}
                      </>
                    ) : typeof currentCall.leadId === "string" ? (
                      <p className="font-mono text-sm text-gray-900">
                        {currentCall.leadId}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">No lead associated</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <CancelIcon className="w-4 h-4 mr-2 inline" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCallPage;
