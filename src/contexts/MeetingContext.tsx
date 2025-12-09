"use client";

import { Meeting } from '@/api/meetingsApi';
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface MeetingContextType {
  meetingId: string | null;
  leadId: string | null;
  meeting: Meeting | null;
  setMeetingData: (meetingId: string | null, leadId: string | null, meeting: Meeting | null) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  // Use useCallback to prevent function recreation on every render
  const setMeetingData = useCallback((newMeetingId: string | null, newLeadId: string | null, newMeeting: Meeting | null) => {
    // Only update state if values have actually changed to prevent infinite rerenders
    if (newMeetingId !== meetingId) {
      setMeetingId(newMeetingId);
    }
    if (newLeadId !== leadId) {
      setLeadId(newLeadId);
    }
    // For objects, we need a more careful comparison
    if (newMeeting?.meetingId !== meeting?.meetingId || newMeeting?._id !== meeting?._id) {
      setMeeting(newMeeting);
    }
  }, [meetingId, leadId, meeting]);

  return (
    <MeetingContext.Provider value={{ meetingId, leadId, meeting, setMeetingData }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeetingContext must be used within a MeetingProvider');
  }
  return context;
};
