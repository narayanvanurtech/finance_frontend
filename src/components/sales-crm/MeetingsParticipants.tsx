"use client";

import { Meeting } from "@/api/meetingsApi";
import React from "react";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";

interface MeetingsParticipantsProps {
  meeting: Meeting;
}

const MeetingsParticipants: React.FC<MeetingsParticipantsProps> = ({ meeting }) => {
  const { currentMeeting, isLoading, error } = useMeetingsStore();
  const activeParticipants = currentMeeting?.participants || meeting.participants;

  if (error) {
    return (
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto border border-red-200">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-6 max-w-5xl mx-auto border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-bold text-gray-800">
          Participants ({activeParticipants.length})
        </h2>
      </div>

      {/* Host section */}
      <div className="border-b border-gray-200 pb-4">
        <div className="text-sm font-medium text-gray-500 mb-2">Host</div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            {/* <span className="text-blue-600 font-medium">
              {meeting.host[0]?.toUpperCase()}
            </span> */}
          </div>
          <div>
            <div className="font-medium text-gray-800">{meeting.host}</div>
            <div className="text-sm text-gray-500">Host</div>
          </div>
        </div>
      </div>

      {/* Participants list */}
      <div>
        <div className="text-sm font-medium text-gray-500 mb-2">
          Participants ({activeParticipants.length})
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            activeParticipants.map((participant, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {participant[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{participant}</div>
                  <div className="text-sm text-gray-500">Participant</div>
                </div>
              </div>
            ))
          )}
          {!isLoading && activeParticipants.length === 0 && (
            <div className="text-gray-500 text-sm italic">
              No participants added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingsParticipants;
