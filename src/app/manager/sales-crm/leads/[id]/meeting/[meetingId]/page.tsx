"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import leadsApi, { Meeting } from "@/api/leadsApi";

interface EditedMeeting {
  title: string;
  meetingVenue: string;
  location: string;
  allDay: boolean;
  fromDateTime: string;
  toDateTime: string;
  host: string;
  participants: string[];
  participantsReminder: boolean;
  status: string;
  leadEmail: string;
}

interface PageProps {
  params: {
    id: string;
    meetingId: string;
  };
}

const MeetingDetailsPage: React.FC<PageProps> = ({ params }) => {
  const { id, meetingId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityType = searchParams.get("type") || "open";
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedMeeting, setEditedMeeting] = useState<EditedMeeting>({
    title: "",
    meetingVenue: "",
    location: "",
    allDay: false,
    fromDateTime: new Date().toISOString(),
    toDateTime: new Date().toISOString(),
    host: "",
    participants: [],
    participantsReminder: true,
    status: "scheduled",
    leadEmail: "",
  });

  const [participantInput, setParticipantInput] = useState("");

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching meeting with leadId: ${id}, meetingId: ${meetingId}`);
        const response = await leadsApi.getMeeting(id, meetingId, activityType);
        console.log('Meeting data received:', response.data);
        
        // Handle different API response structures
        let meetingData: Meeting;
        
        if ('meeting' in response.data) {
          // New API structure with meeting nested inside data
          meetingData = response.data.meeting as Meeting;
        } else {
          // Original structure
          meetingData = response.data as Meeting;
        }
        
        setMeeting(meetingData);
        setEditedMeeting({
          title: meetingData.title || '',
          meetingVenue: meetingData.meetingVenue || '',
          location: meetingData.location || '',
          allDay: Boolean(meetingData.allDay),
          fromDateTime: meetingData.fromDateTime || new Date().toISOString(),
          toDateTime: meetingData.toDateTime || new Date().toISOString(),
          host: meetingData.host || '',
          participants: Array.isArray(meetingData.participants) ? meetingData.participants : [],
          participantsReminder: Boolean(meetingData.participantsReminder),
          status: meetingData.status || 'scheduled',
          leadEmail: meetingData.leadEmail || '',
        });
      } catch (err) {
        console.error("Error fetching meeting details:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch meeting details");
      } finally {
        setLoading(false);
      }
    };

    if (id && meetingId) {
      fetchMeetingDetails();
    }
  }, [id, meetingId, activityType]);

  const handleChange = (field: keyof EditedMeeting, value: string | boolean | Date | string[]) => {
    setEditedMeeting(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddParticipant = () => {
    if (participantInput.trim() && !editedMeeting.participants.includes(participantInput.trim())) {
      setEditedMeeting(prev => ({
        ...prev,
        participants: [...prev.participants, participantInput.trim()]
      }));
      setParticipantInput("");
    }
  };

  const handleRemoveParticipant = (participantToRemove: string) => {
    setEditedMeeting(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participantToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use the meetingId from the meeting data instead of the URL parameter
      if (meeting && meeting.meetingId) {
        console.log(`Updating meeting with ID: ${meeting.meetingId}`);
        console.log('Meeting data being sent:', editedMeeting);
        await leadsApi.updateMeeting(id, meeting.meetingId, editedMeeting);
      } else {
        // Fall back to URL parameter if meeting data is not available
        console.log(`Updating meeting with URL parameter ID: ${meetingId}`);
        console.log('Meeting data being sent:', editedMeeting);
        await leadsApi.updateMeeting(id, meetingId, editedMeeting);
      }
      router.back();
    } catch (err) {
      console.error("Error updating meeting:", err);
      setError(err instanceof Error ? err.message : "Failed to update meeting");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-sm border p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Edit Meeting</h1>

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Meeting Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Meeting Information</h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedMeeting.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter meeting title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={editedMeeting.leadEmail}
                    onChange={(e) => handleChange('leadEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter lead email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editedMeeting.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Venue <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editedMeeting.meetingVenue}
                    onChange={(e) => handleChange('meetingVenue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Venue</option>
                    <option value="In-office">In-office</option>
                    <option value="Client location">Client location</option>
                    <option value="Online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedMeeting.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter meeting location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedMeeting.host}
                    onChange={(e) => handleChange('host', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter host name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between border border-gray-300 rounded-md p-3 hover:border-indigo-500 transition-all">
                    <span className="text-sm font-medium text-gray-700">All Day Meeting</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedMeeting.allDay}
                        onChange={(e) => handleChange('allDay', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Schedule Information</h3>
            </div>
            <div className="px-6 py-6">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From <span className="text-red-500">*</span>
                    </label>
                    <DateTimePicker
                      value={new Date(editedMeeting.fromDateTime)}
                      onChange={(newValue) => {
                        if (newValue) {
                          handleChange('fromDateTime', newValue.toISOString());
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To <span className="text-red-500">*</span>
                    </label>
                    <DateTimePicker
                      value={new Date(editedMeeting.toDateTime)}
                      onChange={(newValue) => {
                        if (newValue) {
                          handleChange('toDateTime', newValue.toISOString());
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
                  </div>
                </div>
              </LocalizationProvider>
            </div>
          </div>

          {/* Participants Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Participants ({editedMeeting.participants.length})
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Participant
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={participantInput}
                      onChange={(e) => setParticipantInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddParticipant();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter participant name or email"
                    />
                    <button
                      type="button"
                      onClick={handleAddParticipant}
                      disabled={!participantInput.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Participants
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editedMeeting.participants.map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                      >
                        <span>{participant}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(participant)}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {editedMeeting.participants.length === 0 && (
                      <p className="text-gray-500 text-sm">No participants added yet</p>
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

export default MeetingDetailsPage;
