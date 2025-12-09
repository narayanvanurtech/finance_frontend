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
  Assignment,
  Description,
  Notes,
  Person,
  AccessTime,
  Phone,
  Visibility,
} from "@mui/icons-material";
import CurrencyRupee from "@mui/icons-material/CurrencyRupee";
import { Avatar, IconButton, CircularProgress } from "@mui/material";
import Badge from '@mui/icons-material/Badge';

import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { format } from "date-fns";

const CallsRightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { currentCall, currentCallDetails, isLoading, error } = useCallsStore();

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

  if (!currentCall || !currentCallDetails) {
    return (
      <div className="p-4 text-gray-500">
        No call details available
      </div>
    );
  }

  // Extract proper data from currentCallDetails
  const callOwner = currentCallDetails.callOwner;
  const leadInfo = currentCallDetails.leadId;

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold">{leadInfo?.fullName || `${leadInfo?.firstName} ${leadInfo?.lastName}` || 'Unknown Lead'}</h2>
          <p className="text-sm text-gray-500">Call Owner: {callOwner?.name || 'Unknown'}</p>
          <div className="mt-1 inline-flex items-center bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded">
            <FiberManualRecord fontSize="inherit" className="mr-1" />
            Last updated: {format(new Date(currentCall.updatedAt), "dd MMM yyyy, hh:mm a")}
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
                  Call Owner: {callOwner?.name || 'Unknown'}
                </div>
                <div className="flex items-center text-sm">
                  <Email
                    style={{ fontSize: "1.15rem" }}
                    className="text-indigo-500 mr-2"
                  />
                  Owner Email: {callOwner?.email || 'No email available'}
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

            {/* Call Details Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold mb-4">Call Summary</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center text-sm">
                    <Phone
                      style={{ fontSize: "1.15rem" }}
                      className="text-indigo-500 mr-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{currentCall.callPurpose || 'No purpose specified'}</div>
                      <div className="text-gray-600 text-xs">
                        Type: {currentCall.callType} • Status: {currentCall.outgoingCallStatus}
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
                        {format(new Date(currentCall.callStartTime), "MMM d, yyyy h:mm a")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold mb-4">Call Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-lg font-semibold text-indigo-600">
                    {currentCall.callType?.charAt(0).toUpperCase() + currentCall.callType?.slice(1)}
                  </p>
                  <p className="text-sm text-gray-600">Call Type</p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-lg font-semibold text-indigo-600">
                    {currentCall.outgoingCallStatus?.charAt(0).toUpperCase() + currentCall.outgoingCallStatus?.slice(1)}
                  </p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            {/* Call Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Call Details</h3>
              <div className="space-y-3">
                <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                  <Assignment className="text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Call Purpose</p>
                    <p className="text-gray-600 mt-1">{currentCall.callPurpose || 'No purpose specified'}</p>
                  </div>
                </div>
                <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                  <Schedule className="text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Scheduled Time</p>
                    <p className="text-gray-600 mt-1">
                      {format(new Date(currentCall.callStartTime), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                  <Phone className="text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Type & Status</p>
                    <p className="text-gray-600 mt-1">
                      {currentCall.callType?.charAt(0).toUpperCase() + currentCall.callType?.slice(1)} • {currentCall.outgoingCallStatus?.charAt(0).toUpperCase() + currentCall.outgoingCallStatus?.slice(1)}
                    </p>
                  </div>
                </div>
                {currentCall.callAgenda && (
                  <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                    <Description className="text-indigo-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Call Agenda</p>
                      <p className="text-gray-600 mt-1">{currentCall.callAgenda}</p>
                    </div>
                  </div>
                )}
                {currentCall.callResult && (
                  <div className="flex items-start text-sm p-3 bg-gray-50 rounded">
                    <CheckCircle className="text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Call Result</p>
                      <p className="text-gray-600 mt-1">{currentCall.callResult}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes and Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Notes & Description</h3>
              {currentCall.notes && (
                <div className="p-3 bg-gray-50 rounded mb-3">
                  <div className="flex items-start">
                    <Notes className="text-indigo-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Call Notes</p>
                      <p className="text-sm text-gray-600 mt-1">{currentCall.notes}</p>
                    </div>
                  </div>
                </div>
              )}
              {currentCall.description && (
                <div className="p-3 bg-gray-50 rounded mb-3">
                  <div className="flex items-start">
                    <Description className="text-indigo-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-gray-600 mt-1">{currentCall.description}</p>
                    </div>
                  </div>
                </div>
              )}
              {!currentCall.notes && !currentCall.description && (
                <p className="text-sm text-gray-500 italic">No notes or description available</p>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm p-2 bg-gray-50 rounded">
                  <Schedule className="text-indigo-500 mr-2" />
                  <div>
                    <p className="font-medium">Call Created</p>
                    <p className="text-gray-500">
                      {format(new Date(currentCall.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm p-2 bg-gray-50 rounded">
                  <AccessTime className="text-indigo-500 mr-2" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-gray-500">
                      {format(new Date(currentCall.updatedAt), "MMM d, yyyy h:mm a")}
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
              <h3 className="text-md font-semibold mb-3">Call Information</h3>
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
                      <p className="font-medium text-purple-800">Call Owner</p>
                      <p className="text-purple-600">{callOwner?.name}</p>
                      <p className="text-purple-600 text-xs">{callOwner?.email}</p>
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

export default CallsRightPanel;
