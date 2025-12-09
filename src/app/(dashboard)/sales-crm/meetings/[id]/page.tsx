"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMeetingsStore } from '@/stores/salesCrmStore/useMeetingsStore';
import { Meeting } from '@/api/meetingsApi';
import { CircularProgress, Button } from "@mui/material";
import { ArrowBack as BackIcon, Edit as EditIcon } from "@mui/icons-material";

import MeetingOwnerInfo from '@/components/sales-crm/MeetingOwnerInfo';
import MeetingLeadInfo from '@/components/sales-crm/MeetingLeadInfo';
import MeetingDetailsDisplay from '@/components/sales-crm/MeetingDetailsDisplay';
import MeetingContentDisplay from '@/components/sales-crm/MeetingContentDisplay';

const MeetingDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const meetingId = params?.id as string;
  const { currentMeeting, currentMeetingDetails, fetchMeetingById, isLoading, error } = useMeetingsStore();

  useEffect(() => {
    if (meetingId) {
      console.log('Fetching meeting details for ID:', meetingId);
      fetchMeetingById(meetingId);
    }
  }, [meetingId, fetchMeetingById]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CircularProgress size={40} />
          <p className="mt-4 text-gray-600">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg font-medium">Error: {error}</p>
          <Button 
            variant="outlined" 
            onClick={() => router.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Meeting not found</p>
          <Button 
            variant="outlined" 
            onClick={() => router.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Meeting Owner Information */}
          <MeetingOwnerInfo meeting={currentMeeting} />
          
          {/* Lead Information */}
          <MeetingLeadInfo meeting={currentMeeting} />
          
          {/* Meeting Details */}
          <MeetingDetailsDisplay meeting={currentMeeting} />
          
          {/* Meeting Content */}
          <MeetingContentDisplay meeting={currentMeeting} />
        </div>
      </div>
    </div>
  );
}

export default MeetingDetailsPage;