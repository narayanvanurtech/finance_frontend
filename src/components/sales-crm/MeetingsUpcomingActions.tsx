import React from "react";
import { Meeting } from "@/api/meetingsApi";
import { Schedule } from "@mui/icons-material";

interface MeetingsUpcomingActionsProps {
  meeting: Meeting;
}

const MeetingsUpcomingActions: React.FC<MeetingsUpcomingActionsProps> = ({ meeting }) => {
  // Example of upcoming actions based on meeting status
  const getUpcomingActions = () => {
    if (meeting.participantsReminder) {
      return [
        {
          title: "Send reminder to participants",
          dueDate: new Date(meeting.fromDateTime),
          type: "reminder"
        }
      ];
    }
    return [];
  };

  const actions = getUpcomingActions();

  return (
    <div className="bg-white rounded shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-2">
          <Schedule className="text-gray-500" />
          <h2 className="text-md font-bold text-gray-800">
            Upcoming Automated Actions
          </h2>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        {actions.length > 0 ? (
          <div className="space-y-4">
            {actions.map((action, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-800">{action.title}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {action.dueDate.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-1 px-1">
            No upcoming automated actions
          </p>
        )}
      </div>
    </div>
  );
};

export default MeetingsUpcomingActions;
