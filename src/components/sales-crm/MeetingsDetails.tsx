"use client";

import React from "react";
import EditableField from "./EditableField";
import { Meeting, CreateMeetingRequest } from "@/api/meetingsApi";
import { format, parseISO } from "date-fns";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

interface MeetingDetailsProps {
  meeting: Meeting;
}

const MeetingDetails: React.FC<MeetingDetailsProps> = ({ meeting }) => {
  const {
    currentMeeting,
    updateMeeting: updateMeetingStore,
    fetchMeetingById,
    isLoading,
    error,
  } = useMeetingsStore();

  // Helper function to convert Meeting to CreateMeetingRequest
  const toUpdateRequest = (
    meeting: Meeting,
    updates: Partial<CreateMeetingRequest> = {}
  ) => {
    return {
      title: meeting.title,
      meetingVenue: meeting.meetingVenue,
      location: meeting.location,
      allDay: meeting.allDay,
      fromDateTime: meeting.fromDateTime,
      toDateTime: meeting.toDateTime,
      host: meeting.host,
      participants: meeting.participants,
      participantsReminder: meeting.participantsReminder,
      leadId:
        typeof meeting.leadId === "string"
          ? meeting.leadId
          : meeting.leadId._id,
      companyId: meeting.companyId,
      status: meeting.status,
      notes: meeting.notes,
      ...updates,
    };
  };

  // Format date to Indian format (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy");
  };

  // Format time to 12-hour format with AM/PM
  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), "hh:mm a");
  };

  // Refresh meeting data after successful update
  const refreshMeetingData = async (meetingId: string) => {
    await fetchMeetingById(meetingId);
  };

  // Handle update functions for meeting fields
  const handleTitleUpdate = async (value: string) => {
    if (!meeting._id) return;

    try {
      // Just update the title field
      await updateMeetingStore(meeting._id, {
        title: value,
        meetingVenue: meeting.meetingVenue,
        location: meeting.location,
        allDay: meeting.allDay,
        fromDateTime: meeting.fromDateTime,
        toDateTime: meeting.toDateTime,
        host: meeting.host,
        participants: meeting.participants,
        participantsReminder: meeting.participantsReminder,
      });
      await refreshMeetingData(meeting._id);
    } catch (err) {
      console.error("Error updating meeting title:", err);
    }
  };

  const handleDateUpdate = async (date: Date | null) => {
    if (!date || !meeting._id) return;

    const currentDate = parseISO(meeting.fromDateTime);
    const newDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      currentDate.getHours(),
      currentDate.getMinutes()
    ).toISOString();

    try {
      await updateMeetingStore(
        meeting._id,
        toUpdateRequest(meeting, {
          fromDateTime: newDateTime,
        })
      );
      await refreshMeetingData(meeting._id);
    } catch (err) {
      console.error("Error updating meeting date:", err);
    }
  };

  const handleTimeUpdate = async (
    time: Date | null,
    isStartTime: boolean = true
  ) => {
    if (!time || !meeting._id) return;

    try {
      const currentStartDate = parseISO(meeting.fromDateTime);
      const currentEndDate = parseISO(meeting.toDateTime);

      if (isStartTime) {
        const newStartDateTime = new Date(
          currentStartDate.getFullYear(),
          currentStartDate.getMonth(),
          currentStartDate.getDate(),
          time.getHours(),
          time.getMinutes()
        ).toISOString();

        await updateMeetingStore(
          meeting._id,
          toUpdateRequest(meeting, {
            fromDateTime: newStartDateTime,
          })
        );
      } else {
        const newEndDateTime = new Date(
          currentEndDate.getFullYear(),
          currentEndDate.getMonth(),
          currentEndDate.getDate(),
          time.getHours(),
          time.getMinutes()
        ).toISOString();

        await updateMeetingStore(
          meeting._id,
          toUpdateRequest(meeting, {
            toDateTime: newEndDateTime,
          })
        );
      }
      await refreshMeetingData(meeting._id);
    } catch (err) {
      console.error("Error updating meeting time:", err);
    }
  };

  const handleVenueUpdate = async (value: string) => {
    if (!meeting._id) return;

    try {
      await updateMeetingStore(
        meeting._id,
        toUpdateRequest(meeting, {
          meetingVenue: value,
        })
      );
      await refreshMeetingData(meeting._id);
    } catch (err) {
      console.error("Error updating meeting venue:", err);
    }
  };

  const handleLocationUpdate = async (value: string) => {
    if (!meeting._id) return;

    try {
      await updateMeetingStore(
        meeting._id,
        toUpdateRequest(meeting, {
          location: value,
        })
      );
      await refreshMeetingData(meeting._id);
    } catch (err) {
      console.error("Error updating meeting location:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-6 max-w-5xl mx-auto border border-gray-200">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Date
            </label>
            <DatePicker
              value={parseISO(meeting.fromDateTime)}
              onChange={handleDateUpdate}
              disabled={isLoading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error,
                  helperText: error || "",
                },
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <TimePicker
                value={parseISO(meeting.fromDateTime)}
                onChange={(time) => handleTimeUpdate(time, true)}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error || "",
                  },
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <TimePicker
                value={parseISO(meeting.toDateTime)}
                onChange={(time) => handleTimeUpdate(time, false)}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error || "",
                  },
                }}
              />
            </div>
          </div>
        </div>

        <EditableField
          label="Meeting Title"
          value={meeting.title}
          onSave={handleTitleUpdate}
          entityId={meeting._id}
          fieldName="title"
        />
        <EditableField
          label="Meeting Venue"
          value={meeting.meetingVenue}
          onSave={handleVenueUpdate}
          entityId={meeting._id}
          fieldName="meetingVenue"
        />
        <EditableField
          label="Meeting Location"
          value={meeting.location}
          onSave={handleLocationUpdate}
          entityId={meeting._id}
          fieldName="location"
        />
      </LocalizationProvider>
    </div>
  );
};

export default MeetingDetails;
