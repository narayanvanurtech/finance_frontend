"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import CallOwnerInfo from "@/components/sales-crm/CallOwnerInfo";
import CallLeadInfo from "@/components/sales-crm/CallLeadInfo";
import CallDetailsDisplay from "@/components/sales-crm/CallDetailsDisplay";
import CallContentDisplay from "@/components/sales-crm/CallContentDisplay";
import { CircularProgress, Button } from "@mui/material";
import { ArrowBack as BackIcon, Edit as EditIcon } from "@mui/icons-material";

const CallDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const callId = params?.id as string;
  const {
    fetchCallById,
    currentCall,
    currentCallDetails,
    isLoading,
    error,
  } = useCallsStore();

  useEffect(() => {
    if (callId) {
      console.log('Fetching call details for ID:', callId);
      fetchCallById(callId);
    }
  }, [callId, fetchCallById]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CircularProgress size={40} />
          <p className="mt-4 text-gray-600">Loading call details...</p>
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

  if (!currentCall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Call not found</p>
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
          {/* Call Owner Information */}
          <CallOwnerInfo call={currentCall} />
          
          {/* Lead Information */}
          <CallLeadInfo call={currentCall} />
          
          {/* Call Details */}
          <CallDetailsDisplay call={currentCall} />
          
          {/* Call Content */}
          <CallContentDisplay call={currentCall} />
        </div>
      </div>
    </div>
  );
};

export default CallDetailsPage;