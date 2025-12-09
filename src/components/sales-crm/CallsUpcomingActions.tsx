import React from "react";
import { Call } from "@/api/callsApi";

interface CallsUpcomingActionsProps {
  call: Call;
}

const CallsUpcomingActions: React.FC<CallsUpcomingActionsProps> = ({ call }) => {
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden">
      {/* Header */}
      <div className=" p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-2">
          {/* <Notes className="text-gray-500" /> */}
          <h2 className="text-md font-semibold text-gray-800">
            Upcoming Automated Actions
          </h2>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        <p className="text-sm text-gray-500 mt-1 px-1">
          No upcoming automated actions
        </p>
      </div>
    </div>
  );
};

export default CallsUpcomingActions;
