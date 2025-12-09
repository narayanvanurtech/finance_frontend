"use client";

import React from "react";
import { Call } from "@/api/callsApi";
import { Person, Email, Phone, Business, LocationOn } from "@mui/icons-material";

interface CallLeadInfoProps {
  call: Call;
}

const CallLeadInfo: React.FC<CallLeadInfoProps> = ({ call }) => {
  const leadInfo = typeof call.leadId === 'object' ? call.leadId : null;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Person className="w-5 h-5 mr-2 text-indigo-600" />
          Lead Information
        </h3>
      </div>
      <div className="px-6 py-6">
        {leadInfo ? (
          <>
           
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Person className="w-4 h-4 mr-2 text-gray-500" />
                  Name
                </label>
                <input
                  type="text"
                  value={leadInfo.fullName || `${leadInfo.firstName || ''} ${leadInfo.lastName || ''}`.trim() || "N/A"}
                  disabled
                  className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Email className="w-4 h-4 mr-2 text-gray-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={leadInfo.email || "N/A"}
                  disabled
                  className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                />
              </div>
              
              {leadInfo.phone && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={leadInfo.phone}
                    disabled
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                  />
                </div>
              )}
              
              {leadInfo.address?.full && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <LocationOn className="w-4 h-4 mr-2 text-gray-500" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={leadInfo.address.full}
                    disabled
                    className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">Lead information not available</p>
            <div className="mt-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Lead ID
              </label>
              <input
                type="text"
                value={typeof call.leadId === 'string' ? call.leadId : 'N/A'}
                disabled
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 mx-auto max-w-xs w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLeadInfo;