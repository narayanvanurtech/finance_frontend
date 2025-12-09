"use client";

import React from "react";
import { Meeting } from "@/api/meetingsApi";
import { Notes, AttachFile, Pending, Person } from "@mui/icons-material";

interface MeetingContentDisplayProps {
  meeting: Meeting;
}

const MeetingContentDisplay: React.FC<MeetingContentDisplayProps> = ({ meeting }) => {
  return (
    <div className="space-y-6">
      {/* Notes Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Notes className="w-5 h-5 mr-2 text-indigo-600" />
            Meeting Notes
          </h3>
        </div>
        <div className="px-6 py-6">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[100px]">
            {meeting.notes ? (
              <p className="whitespace-pre-wrap text-gray-700">{meeting.notes}</p>
            ) : (
              <p className="text-gray-400 italic">No notes available</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Attachments Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AttachFile className="w-5 h-5 mr-2 text-indigo-600" />
            Attachments
          </h3>
        </div>
        <div className="px-6 py-6">
          {(meeting.attachment?.length > 0 || (meeting.attachments && meeting.attachments.length > 0)) ? (
            <ul className="space-y-2">
              {meeting.attachment?.map((attach, index) => (
                <li key={`attachment-${index}`} className="flex items-center p-2 border border-gray-200 rounded-md">
                  <AttachFile className="w-4 h-4 mr-2 text-gray-500" />
                  <a href={attach} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Attachment {index + 1}
                  </a>
                </li>
              ))}
              {meeting.attachments && meeting.attachments.map((attach, index) => (
                <li key={`attachments-${index}`} className="flex items-center p-2 border border-gray-200 rounded-md">
                  <AttachFile className="w-4 h-4 mr-2 text-gray-500" />
                  <a href={attach} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Attachment {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No attachments available</p>
          )}
        </div>
      </div>
      
      {/* Participants Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Person className="w-5 h-5 mr-2 text-indigo-600" />
            Participants
          </h3>
        </div>
        <div className="px-6 py-6">
          {meeting.participants && meeting.participants.length > 0 ? (
            <ul className="space-y-2">
              {meeting.participants.map((participant, index) => (
                <li key={`participant-${index}`} className="flex items-center p-2 border border-gray-200 rounded-md">
                  <Person className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-700">{participant}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No participants available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingContentDisplay;
