"use client";

import React, { useEffect } from "react";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import CallFormComponent, { CallFormData } from "./CallFormComponent";
import MeetingFormComponent, { MeetingFormData } from "./MeetingFormComponent";
import TaskFormComponent, { TaskFormData } from "./TaskFormComponent";
import leadsApi from "@/api/leadsApi";


interface ActivityDialogProps {
  open: boolean;
  onClose: () => void;
  type: "Task" | "Meeting" | "Call" | null;
  leadId: string;
}

const ActivityDialog: React.FC<ActivityDialogProps> = ({ open, onClose, type, leadId }) => {
  const { isLoading, error } = useLeadsStore();
  
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  const handleSubmit = async (data: CallFormData | MeetingFormData | TaskFormData) => {
    try {
      // Handle different types of submissions
      switch (type) {
        case "Task":
          if ('taskName' in data) {
            // Map TaskFormData to the API's expected format
            await leadsApi.createTask(leadId, {
              subject: data.taskName,
              dueDate: data.dueDate,
              priority: data.priority.toLowerCase() as 'low' | 'medium' | 'high',
              reminder: data.reminder,
              description: data.description,
            });
          }
          break;
        case "Call":
          if ('callType' in data) {
            await leadsApi.createCall(leadId, {
              callType: data.callType,
              outgoingCallStatus: data.outgoingCallStatus,
              callStartTime: data.callStartTime,
              callPurpose: data.callPurpose,
              callAgenda: data.callAgenda,
              subject: data.subject,
              reminder: data.reminder,
              notes: data.notes
            });
          }
          break;
        case "Meeting":
          if ('meetingVenue' in data) {
            await leadsApi.createMeeting(leadId, {
              meetingVenue: data.meetingVenue,
              location: data.location,
              allDay: data.allDay,
              fromDateTime: data.fromDateTime,
              toDateTime: data.toDateTime,
              host: data.host,
              title: data.title,
              participants: data.participants
            });
          }
          break;
      }
      onClose();
      window.location.reload(); // Reload the page after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error (show error message, etc.)
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 bg-opacity-40 flex items-start justify-center pt-4">
      <div className="bg-white w-full max-w-2xl mx-auto rounded-lg shadow-lg relative p-6">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New {type}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dynamic form based on activity type */}
        <div className="space-y-4">
          {type === "Call" && <CallFormComponent onSubmit={handleSubmit} />}
          {type === "Meeting" && <MeetingFormComponent onSubmit={handleSubmit} />}
          {type === "Task" && <TaskFormComponent onSubmit={handleSubmit} />}
        </div>


      </div>
    </div>
  );
};

export default ActivityDialog;