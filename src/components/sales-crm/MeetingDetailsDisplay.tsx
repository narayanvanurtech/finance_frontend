"use client";

import React from "react";
import { Meeting } from "@/api/meetingsApi";
import { Schedule, LocationOn, Person, VideoCall } from "@mui/icons-material";
import { format, parseISO } from "date-fns";

interface MeetingDetailsDisplayProps {
  meeting: Meeting;
}

const MeetingDetailsDisplay: React.FC<MeetingDetailsDisplayProps> = ({ meeting }) => {
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <VideoCall className="w-5 h-5 mr-2 text-indigo-600" />
          Meeting Details
        </h3>
      </div>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={meeting.title || "N/A"}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 flex-1"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={meeting.status?.charAt(0).toUpperCase() + meeting.status?.slice(1) || "N/A"}
                disabled
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 flex-1"
              />
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(meeting.status)}`}>
                {meeting.status?.charAt(0).toUpperCase() + meeting.status?.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Schedule className="w-4 h-4 mr-2" />
              Start Date & Time
            </label>
            <input
              type="text"
              value={formatDateTime(meeting.fromDateTime)}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Schedule className="w-4 h-4 mr-2" />
              End Date & Time
            </label>
            <input
              type="text"
              value={formatDateTime(meeting.toDateTime)}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <VideoCall className="w-4 h-4 mr-2" />
              Meeting Venue
            </label>
            <input
              type="text"
              value={meeting.meetingVenue || "N/A"}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <LocationOn className="w-4 h-4 mr-2" />
              Location
            </label>
            <input
              type="text"
              value={meeting.location || "N/A"}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Person className="w-4 h-4 mr-2" />
              Host
            </label>
            <input
              type="text"
              value={meeting.host || "N/A"}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsDisplay;
