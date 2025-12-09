"use client";

import React from "react";
import { Call } from "@/api/callsApi";
import { Description, Assignment, CheckCircle, Notes } from "@mui/icons-material";

interface CallContentDisplayProps {
  call: Call;
}

const CallContentDisplay: React.FC<CallContentDisplayProps> = ({ call }) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Description className="w-5 h-5 mr-2 text-indigo-600" />
          Call Content
        </h3>
      </div>
      <div className="px-6 py-6 space-y-6">
        {/* Call Purpose */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Assignment className="w-4 h-4 mr-1" />
            Call Purpose
          </label>
          <div className=" rounded-lg p-4 border">
            <p className="text-gray-900">
              {call.callPurpose || <span className="text-gray-500 italic">No purpose specified</span>}
            </p>
          </div>
        </div>

        {/* Call Agenda */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Assignment className="w-4 h-4 mr-1" />
            Call Agenda
          </label>
          <div className=" rounded-lg p-4 border">
            <p className="text-gray-900 whitespace-pre-wrap">
              {call.callAgenda || <span className="text-gray-500 italic">No agenda specified</span>}
            </p>
          </div>
        </div>

        {/* Call Result */}
        {call.callResult && (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className="w-4 h-4 mr-1" />
              Call Result
            </label>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-gray-900 whitespace-pre-wrap">
                {call.callResult}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {call.notes && (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Notes className="w-4 h-4 mr-1" />
              Notes
            </label>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-gray-900 whitespace-pre-wrap">
                {call.notes}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        {call.description && (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Description className="w-4 h-4 mr-1" />
              Description
            </label>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-gray-900 whitespace-pre-wrap">
                {call.description}
              </p>
            </div>
          </div>
        )}

        {/* Show message if no content is available */}
        {!call.callResult && !call.notes && !call.description && (
          <div className="text-center py-4">
            <p className="text-gray-500">No additional call content available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallContentDisplay;
