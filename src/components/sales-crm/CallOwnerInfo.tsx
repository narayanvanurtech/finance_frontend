"use client";

import React from "react";
import { Call } from "@/api/callsApi";
import { Person, Email, Business } from "@mui/icons-material";

interface CallOwnerInfoProps {
  call: Call;
}

const CallOwnerInfo: React.FC<CallOwnerInfoProps> = ({ call }) => {
  const callOwner = typeof call.callOwner === 'object' ? call.callOwner : null;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Person className="w-5 h-5 mr-2 text-indigo-600" />
          Call Owner Information
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
              value={callOwner?.name || (typeof call.callOwner === 'string' ? call.callOwner : "N/A")}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            />
          </div>
          
          {callOwner?.email && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Email className="w-4 h-4 mr-2 text-gray-500" />
                Email
              </label>
              <input
                type="email"
                value={callOwner.email}
                disabled
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>
          )}
          
          {/* <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Business className="w-4 h-4 mr-2 text-gray-500" />
              Owner ID
            </label>
            <input
              type="text"
              value={callOwner?._id || (typeof call.callOwner === 'string' ? call.callOwner : "N/A")}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 font-mono text-sm"
            />
          </div> */}
          
          {/* <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Business className="w-4 h-4 mr-2 text-gray-500" />
              Company ID
            </label>
            <input
              type="text"
              value={call.companyId || "N/A"}
              disabled
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 font-mono text-sm"
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CallOwnerInfo;