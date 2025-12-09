"use client";

import React from "react";
import { Call } from "@/api/callsApi";
import { Call as CallIcon, Schedule, Flag } from "@mui/icons-material";

interface CallDetailsDisplayProps {
  call: Call;
}

const CallDetailsDisplay: React.FC<CallDetailsDisplayProps> = ({ call }) => {
  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancel':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'outbound':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'inbound':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CallIcon className="w-5 h-5 mr-2 text-indigo-600" />
          Call Details
        </h3>
      </div>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Call Type
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={call.callType?.charAt(0).toUpperCase() + call.callType?.slice(1) || "N/A"}
                disabled
                className="border border-gray-300 rounded-md px-3 py-2  text-gray-700 flex-1"
              />
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(call.callType)}`}>
                {call.callType?.charAt(0).toUpperCase() + call.callType?.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Call Status
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={call.outgoingCallStatus?.charAt(0).toUpperCase() + call.outgoingCallStatus?.slice(1) || "N/A"}
                disabled
                className="border border-gray-300 rounded-md px-3 py-2  text-gray-700 flex-1"
              />
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(call.outgoingCallStatus)}`}>
                {call.outgoingCallStatus?.charAt(0).toUpperCase() + call.outgoingCallStatus?.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Schedule className="w-4 h-4 mr-2" />
              Call Start Time
            </label>
            <input
              type="text"
              value={call.callStartTime ? formatDateTime(call.callStartTime) : 'Not scheduled'}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2  text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Call ID
            </label>
            <input
              type="text"
              value={call._id || "N/A"}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2  text-gray-700 font-mono text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <input
              type="text"
              value={formatDateTime(call.createdAt) || "N/A"}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2  text-gray-700 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Updated At
            </label>
            <input
              type="text"
              value={formatDateTime(call.updatedAt) || "N/A"}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2  text-gray-700 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallDetailsDisplay;