"use client";

import React from "react";
import { Meeting } from "@/api/meetingsApi";
import { Person, Email, Business } from "@mui/icons-material";

interface MeetingOwnerInfoProps {
  meeting: Meeting;
}

const MeetingOwnerInfo: React.FC<MeetingOwnerInfoProps> = ({ meeting }) => {
  const meetingOwner = typeof meeting.meetingOwner === 'object' ? meeting.meetingOwner : null;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Person className="w-5 h-5 mr-2 text-indigo-600" />
          Meeting Host Information
        </h3>
      </div>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Person className="w-4 h-4 mr-2 text-gray-500" />
              Name
            </label>
            <input
              type="text"
              value={meetingOwner?.name || (typeof meeting.meetingOwner === 'string' ? meeting.meetingOwner : "N/A")}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            />
          </div>
          
          {meetingOwner && 'email' in meetingOwner && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Email className="w-4 h-4 mr-2 text-gray-500" />
                Email
              </label>
              <input
                type="email"
                value={meetingOwner.email}
                disabled
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingOwnerInfo;
