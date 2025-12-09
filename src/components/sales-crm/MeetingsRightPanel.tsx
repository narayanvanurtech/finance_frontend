"use client";

import React, { useState } from "react";
import {
  Call,
  Email,
  LocationOn,
  Business,
  MoreVert,
  Schedule,
  Chat,
  Info,
  FiberManualRecord,
  CheckCircle,
  Cancel,
  ExpandMore,
  Assignment,
  Description,
  Notes,
  Person,
  AccessTime,
  Videocam,
  PeopleAlt,
  Room,
  EventNote,
} from "@mui/icons-material";
import CurrencyRupee from "@mui/icons-material/CurrencyRupee";
import { Avatar, IconButton, CircularProgress } from "@mui/material";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { format } from "date-fns";

const MeetingsRightPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { currentMeeting, currentMeetingDetails, isLoading, error } = useMeetingsStore();

  const tabs = [
    { label: "Details", icon: <Info sx={{ fontSize: 18 }} /> },
    { label: "Activity", icon: <Schedule sx={{ fontSize: 18 }} /> },
    { label: "Messages", icon: <Chat sx={{ fontSize: 18 }} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!currentMeeting) {
    return (
      <div className="p-4 text-gray-500">
        No meeting details available
      </div>
    );
  }
  
  // Make sure we have a valid meeting object
  const meeting = currentMeeting || {};
  // Access meetingOwner and leadId from the meeting object or from nested properties
  const meetingOwner = meeting.meetingOwner || (currentMeetingDetails as any)?.meetingOwner || {};
  const leadInfo = meeting.leadId || (currentMeetingDetails as any)?.leadId || {};

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold">
            {leadInfo?.fullName || `${leadInfo?.firstName} ${leadInfo?.lastName}` || 'Unknown Lead'}
          </h2>
          <p className="text-sm text-gray-500">Meeting Owner: {meetingOwner?.name || 'Unknown'}</p>
          <div className="mt-1 inline-flex items-center bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded">
            <FiberManualRecord fontSize="inherit" className="mr-1" />
            Last updated: {currentMeeting.updatedAt ? format(new Date(currentMeeting.updatedAt), "dd MMM yyyy, hh:mm a") : "Unknown"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-around mb-4 border-b border-gray-200">
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex items-center  px-4 py-2 cursor-pointer ${
              activeTab === i
                ? "text-indigo-600 border-b-2 border-indigo-600 font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <span className="block lg:hidden xl:block">{t.icon}</span>
            <span className="ml-1 text-xs">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 0 && (
          <div>
            {/* Contact Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold mb-4">
                Contact Information
              </h3>
              <div className="space-y-3 text-zinc-800">
                <div className="flex items-center text-sm">
                  <Person
                    style={{ fontSize: "1.15rem" }}
                    className="text-indigo-500 mr-2"
                  />
                  Lead: {leadInfo?.fullName || `${leadInfo?.firstName} ${leadInfo?.lastName}` || 'Unknown'}
                </div>
                <div className="flex items-center text-sm">
                  <Email
                    style={{ fontSize: "1.15rem" }}
                    className="text-indigo-500 mr-2"
                  />
                  {leadInfo?.email || 'No email available'}
                </div>
                <div className="flex items-center text-sm">
                  <Call
                    style={{ fontSize: "1.15rem" }}
                    className="text-indigo-500 mr-2"
                  />
                  {leadInfo?.phone || 'No phone available'}
                </div>
                <div className="flex items-center text-sm">
                  <Business
                    style={{ fontSize: "1.15rem" }}
                    className="text-indigo-500 mr-2"
                  />
                  Meeting Owner: {meetingOwner?.name || 'Unknown'}
                </div>
                <div className="flex items-center text-sm">
                  <Email
                    style={{ fontSize: "1.15rem" }}
                    className="text-indigo-500 mr-2"
                  />
                  Owner Email: {meetingOwner?.email || 'No email available'}
                </div>
                {leadInfo?.address?.full && (
                  <div className="flex items-center text-sm">
                    <LocationOn
                      style={{ fontSize: "1.15rem" }}
                      className="text-indigo-500 mr-2"
                    />
                    {leadInfo.address.full}
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Details Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold mb-4">Meeting Summary</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center text-sm">
                    <Videocam
                      style={{ fontSize: "1.15rem" }}
                      className="text-indigo-500 mr-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{currentMeeting.title || 'No title specified'}</div>
                      <div className="text-gray-600 text-xs">
                        Venue: {currentMeeting.meetingVenue} • Status: {currentMeeting.status?.charAt(0).toUpperCase() + currentMeeting.status?.slice(1) || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center text-sm">
                    <Schedule
                      style={{ fontSize: "1.15rem" }}
                      className="text-indigo-500 mr-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Scheduled Time</div>
                      <div className="text-gray-600 text-xs">
                        {currentMeeting.fromDateTime ? format(new Date(currentMeeting.fromDateTime), "MMM d, yyyy h:mm a") : "Not scheduled"} 
                        {currentMeeting.toDateTime ? ` - ${format(new Date(currentMeeting.toDateTime), "h:mm a")}` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold mb-4">Meeting Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-lg font-semibold text-indigo-600">
                    {currentMeeting.meetingVenue?.charAt(0).toUpperCase() + currentMeeting.meetingVenue?.slice(1) || 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-600">Meeting Venue</p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-lg font-semibold text-indigo-600">
                    {currentMeeting.status?.charAt(0).toUpperCase() + currentMeeting.status?.slice(1) || 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            {/* Meeting Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Meeting Details</h3>
              <div className="space-y-3">
                <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                  <Assignment className="text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Meeting Title</p>
                    <p className="text-gray-600 mt-1">{currentMeeting.title || 'No title specified'}</p>
                  </div>
                </div>
                <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                  <Schedule className="text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Scheduled Time</p>
                    <p className="text-gray-600 mt-1">
                      {currentMeeting.fromDateTime ? format(new Date(currentMeeting.fromDateTime), "MMM d, yyyy h:mm a") : "Not scheduled"} 
                      {currentMeeting.toDateTime ? ` - ${format(new Date(currentMeeting.toDateTime), "h:mm a")}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                  <LocationOn className="text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600 mt-1">{currentMeeting.location || 'No location specified'}</p>
                  </div>
                </div>
                <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                  <Room className="text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Meeting Venue</p>
                    <p className="text-gray-600 mt-1">{currentMeeting.meetingVenue}</p>
                  </div>
                </div>
                {currentMeeting.host && (
                  <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                    <Person className="text-indigo-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Host</p>
                      <p className="text-gray-600 mt-1">{currentMeeting.host}</p>
                    </div>
                  </div>
                )}
                {currentMeeting.notes && (
                  <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                    <Notes className="text-indigo-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Notes</p>
                      <p className="text-gray-600 mt-1">{currentMeeting.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Participants</h3>
              {currentMeeting.participants && currentMeeting.participants.length > 0 ? (
                <div className="space-y-2">
                  {currentMeeting.participants.map((participant, index) => (
                    <div key={index} className="flex items-center text-sm p-3 bg-gray-50 rounded">
                      <Avatar className="w-8 h-8 mr-2" sx={{ bgcolor: 'indigo.500' }}>
                        {participant && participant.length > 0 ? participant[0] : '?'}
                      </Avatar>
                      <span>{participant || 'Unknown Participant'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">No participants listed</p>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm p-2 bg-gray-50 rounded">
                  <EventNote className="text-indigo-500 mr-2" />
                  <div>
                    <p className="font-medium">Meeting Created</p>
                    <p className="text-gray-500">
                      {currentMeeting.createdAt ? format(new Date(currentMeeting.createdAt), "MMM d, yyyy h:mm a") : "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm p-2 bg-gray-50 rounded">
                  <AccessTime className="text-indigo-500 mr-2" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-gray-500">
                      {currentMeeting.updatedAt ? format(new Date(currentMeeting.updatedAt), "MMM d, yyyy h:mm a") : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="flex flex-col h-full space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-md font-semibold mb-3">Meeting Information</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center text-sm">
                    <Person className="text-green-500 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">Lead Information</p>
                      <p className="text-green-600">{leadInfo?.fullName || `${leadInfo?.firstName} ${leadInfo?.lastName}`}</p>
                      <p className="text-green-600 text-xs">{leadInfo?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <div className="flex items-center text-sm">
                    <Business className="text-purple-500 mr-2" />
                    <div>
                      <p className="font-medium text-purple-800">Meeting Owner</p>
                      <p className="text-purple-600">{meetingOwner?.name}</p>
                      <p className="text-purple-600 text-xs">{meetingOwner?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center text-sm">
                    <PeopleAlt className="text-blue-500 mr-2" />
                    <div>
                      <p className="font-medium text-blue-800">Participants</p>
                      <div className="mt-1">
                        {currentMeeting.participants && currentMeeting.participants.length > 0 ? (
                          currentMeeting.participants.map((participant, index) => (
                            <p key={index} className="text-blue-600 text-xs mb-1">{participant}</p>
                          ))
                        ) : (
                          <p className="text-blue-600 text-xs">No participants listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsRightPanel;
