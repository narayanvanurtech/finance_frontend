"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import type { CreateMeetingRequest } from "@/api/meetingsApi";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  LocationOn,
  Business,
  Event,
  Schedule,
  AccessTime,
  Email,
  People,
  Cancel,
  Save,
  Edit,
  Notes as NotesIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as BackIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

const EditMeetingPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isReschedule = searchParams.get("reschedule") === "true";

  const id = params?.id as string;
  const {
    currentMeeting,
    fetchMeetingById,
    updateMeeting,
    isLoading,
    error: storeError,
  } = useMeetingsStore();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState<string>("");

  // Get user's company ID
  const userCompanyId = user?.companyId || "";
  console.log("Initial user company ID:", userCompanyId);

  const [formData, setFormData] = useState<CreateMeetingRequest>({
    meetingVenue: "",
    location: "",
    allDay: false,
    title: "",
    status: "scheduled",
    fromDateTime: new Date().toISOString(),
    toDateTime: new Date().toISOString(),
    host: "",
    notes: "",
    participants: [],
    participantsReminder: true,
    leadId: "",
    companyId: userCompanyId, // Always initialize with user's company ID
  });

  const [isFormReady, setIsFormReady] = useState(false);

  // Fetch meeting data when component mounts
  useEffect(() => {
    const loadMeeting = async () => {
      if (id) {
        await fetchMeetingById(id);
      }
    };
    loadMeeting();
  }, [id, fetchMeetingById]);

  // Update form data when meeting is fetched
  useEffect(() => {
    if (currentMeeting) {
      console.log("Loading meeting data:", currentMeeting);

      // Handle leadId - could be either an object (with _id) or a string
      const leadId =
        typeof currentMeeting.leadId === "object"
          ? currentMeeting.leadId._id
          : currentMeeting.leadId || "";

      // Build formData with all required fields - prioritize user's companyId
      const companyId = user?.companyId || currentMeeting.companyId || "";
      console.log(
        "Using company ID:",
        companyId,
        "from user:",
        user?.companyId
      );

      // Correctly handle host field - it's a string in the API response
      const hostEmail = currentMeeting.host || "";

      const updatedFormData = {
        meetingVenue: currentMeeting.meetingVenue || "",
        location: currentMeeting.location || "",
        allDay: Boolean(currentMeeting.allDay),
        title: currentMeeting.title || "",
        status: currentMeeting.status || "scheduled",
        fromDateTime: currentMeeting.fromDateTime || new Date().toISOString(),
        toDateTime: currentMeeting.toDateTime || new Date().toISOString(),
        host: hostEmail,
        notes: currentMeeting.notes || "",
        participants: currentMeeting.participants || [],
        participantsReminder: Boolean(currentMeeting.participantsReminder),
        leadId: leadId,
        companyId: companyId, // Always use the company ID from user first
      };

      setFormData(updatedFormData);
      setParticipants(currentMeeting.participants || []);
      setIsFormReady(true);
    }
  }, [currentMeeting, user?.companyId, user?.email]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (field: string, value: Date | null) => {
    if (value) {
      setFormData((prev) => ({
        ...prev,
        [field]: value.toISOString(),
      }));
    }
  };

  const handleAddParticipant = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && participantInput.trim() !== "") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantInput)) {
        setError("Please enter a valid email address");
        return;
      }

      if (!participants.includes(participantInput)) {
        setParticipants([...participants, participantInput]);
        setFormData((prev) => ({
          ...prev,
          participants: [...prev.participants, participantInput],
        }));
      }
      setParticipantInput("");
    }
  };

  const handleDeleteParticipant = (participantToDelete: string) => {
    const updatedParticipants = participants.filter(
      (participant) => participant !== participantToDelete
    );
    setParticipants(updatedParticipants);
    setFormData((prev) => ({
      ...prev,
      participants: updatedParticipants,
    }));
  };

  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUpdateSuccess(false);

    // Validate emails format
    if (!formData.host || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.host)) {
      setError("Please enter a valid host email address");
      return;
    }

    // Validate required fields
    if (!formData.leadId) {
      setError("Lead ID is required");
      return;
    }

    // Check for company ID from both form data and user context
    const companyId = user?.companyId || formData.companyId;
    if (!companyId) {
      setError(
        "Company ID is required - please make sure you're logged in with a valid company account"
      );
      return;
    }

    // Validate meeting title
    if (!formData.title || formData.title.trim() === "") {
      setError("Meeting title is required");
      return;
    }

    // Validate meeting dates
    const fromDate = new Date(formData.fromDateTime);
    const toDate = new Date(formData.toDateTime);
    if (fromDate >= toDate) {
      setError("End time must be after start time");
      return;
    }

    try {
      // Make sure we have the company ID from user
      const companyId = user?.companyId || formData.companyId;
      if (!companyId) {
        setError("Company ID is required but not available");
        return;
      }

      // Prepare data for API - ensure all required fields are present
      const meetingDataToSubmit: CreateMeetingRequest = {
        meetingVenue: formData.meetingVenue,
        location: formData.location,
        allDay: formData.allDay,
        fromDateTime: formData.fromDateTime,
        toDateTime: formData.toDateTime,
        host: formData.host,
        participants: formData.participants,
        title: formData.title,
        status: formData.status,
        participantsReminder: formData.participantsReminder,
        leadId: formData.leadId,
        companyId: companyId, // Use the company ID from user
      };

      if (formData.notes) {
        meetingDataToSubmit.notes = formData.notes;
      }

      console.log(
        "Updating meeting with ID:",
        id,
        "company ID:",
        meetingDataToSubmit.companyId
      );
      console.log("Full meeting data:", meetingDataToSubmit);
      await updateMeeting(id, meetingDataToSubmit);

      // Show success message
      setUpdateSuccess(true);

      // Navigate back to meeting detail after a brief delay
      setTimeout(() => {
        router.push(`/sales-crm/meetings/${id}`);
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update meeting. Please try again.";
      setError(errorMessage);
      console.error("Error updating meeting:", error);
    }
  };

  // Add this function alongside your existing handlers
  const handleAddParticipantClick = () => {
    if (participantInput.trim() === "") {
      setError("Please enter an email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantInput)) {
      setError("Please enter a valid email address");
      return;
    }

    if (participants.includes(participantInput)) {
      setError("This email is already added");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Add the participant
    setParticipants([...participants, participantInput]);
    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, participantInput],
    }));

    // Clear the input
    setParticipantInput("");
  };

  if (isLoading || (id && !currentMeeting) || !isFormReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meeting data...</p>
        </div>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Meeting</h3>
          <p>{storeError}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Failed to load meeting: {storeError}</div>
      </div>
    );
  }

  // Get meeting owner and lead info
  const meetingOwner =
    typeof currentMeeting?.meetingOwner === "object"
      ? currentMeeting.meetingOwner
      : null;
  const leadInfo =
    typeof currentMeeting?.leadId === "object" ? currentMeeting.leadId : null;

  // Get host info from meeting data (not necessarily the same as meetingOwner)
  const hostEmail = currentMeeting?.host || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          {isReschedule ? "Reschedule Meeting" : "Edit Meeting"}
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

        {updateSuccess && (
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
                  Meeting updated successfully! Redirecting...
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Meeting Details Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Event className="w-5 h-5 mr-2 text-indigo-600" />
                Meeting Details
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.title || ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Product Demo, Initial Consultation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.status || "scheduled"}
                    onChange={(e) => handleChange("status", e.target.value)}
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="cancel">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.meetingVenue}
                    onChange={(e) =>
                      handleChange("meetingVenue", e.target.value)
                    }
                    placeholder="e.g., Conference Room, Zoom Call"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g., Office Address, Meeting Link"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date & Time <span className="text-red-500">*</span>
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      value={new Date(formData.fromDateTime)}
                      onChange={(newValue) => {
                        if (newValue) {
                          handleDateChange("fromDateTime", newValue);
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date & Time <span className="text-red-500">*</span>
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      value={new Date(formData.toDateTime)}
                      onChange={(newValue) => {
                        if (newValue) {
                          handleDateChange("toDateTime", newValue);
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
                      minDateTime={new Date(formData.fromDateTime)}
                    />
                  </LocalizationProvider>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    All Day Meeting
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={formData.allDay}
                      onChange={(e) => handleChange("allDay", e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Yes, this is an all-day event
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Owner and Lead Info Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PersonIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Meeting Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meeting Owner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Owner
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {meetingOwner ? (
                      <>
                        <p className="font-medium text-gray-900 flex items-center">
                          <PersonIcon className="w-4 h-4 mr-2 text-gray-500" />
                          {meetingOwner.name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Email className="w-4 h-4 mr-1" />
                          {meetingOwner.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Business className="w-4 h-4 mr-1" />
                          ID: {meetingOwner._id}
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
                    Lead Information
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {leadInfo ? (
                      <>
                        <p className="font-medium text-gray-900">
                          <PersonIcon className="w-4 h-4 mr-2 text-gray-500 inline" />
                          {leadInfo.fullName ||
                            `${leadInfo.firstName} ${leadInfo.lastName}`}
                        </p>
                        {leadInfo.email && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Email className="w-4 h-4 mr-1" />
                            {leadInfo.email}
                          </p>
                        )}
                        {leadInfo.phone && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {leadInfo.phone}
                          </p>
                        )}
                        {leadInfo.address && leadInfo.address.full && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <LocationOn className="w-4 h-4 mr-1" />
                            {leadInfo.address.full}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {leadInfo._id || leadInfo.id}
                        </p>
                      </>
                    ) : typeof currentMeeting?.leadId === "string" ? (
                      <p className="font-mono text-sm text-gray-900">
                        {currentMeeting.leadId}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">No lead associated</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                    value={hostEmail}
                    onChange={(e) => handleChange("host", e.target.value)}
                    placeholder="host@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Additional Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <NotesIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Notes & Additional Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
                    value={formData.notes || ""}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Add any notes about the meeting..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Participants
                  </label>

                  {/* Participants Tags Display */}
                  {participants.length > 0 && (
                    <div className="flex flex-wrap gap-2 border border-gray-300 rounded-md p-3 mb-2 bg-gray-50">
                      {participants.map((participant, index) => (
                        <div
                          key={`participant-${index}`}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          <span>{participant}</span>
                          <button
                            type="button"
                            className="ml-2 text-blue-600 hover:text-blue-800 font-bold text-lg leading-none"
                            onClick={() => handleDeleteParticipant(participant)}
                            title="Remove participant"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Email Input with Add Button */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={participantInput}
                      onChange={(e) => setParticipantInput(e.target.value)}
                      placeholder="Enter participant email address"
                      onKeyDown={handleAddParticipant}
                    />
                    <button
                      type="button"
                      onClick={handleAddParticipantClick}
                      disabled={!participantInput.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <small className="text-gray-500 mt-1 block">
                    Enter email address and click "Add" or press Enter
                  </small>
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
              <Cancel className="w-4 h-4 mr-2 inline" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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
                  {isReschedule ? "Rescheduling..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isReschedule ? "Reschedule Meeting" : "Update Meeting"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMeetingPage;
