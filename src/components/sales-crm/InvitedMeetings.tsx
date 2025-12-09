"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface Meeting {
  _id: string;
  subject: string;
  startTime: string;
  endTime: string;
  date: string;
  organizer: string;
  status: string;
}

interface InvitedMeetingsProps {
  meetings: Meeting[] | null;
  leadId: string;
}

const InvitedMeetings: React.FC<InvitedMeetingsProps> = ({ meetings = [], leadId }) => {
  return (
    <div className="bg-white p-6 rounded shadow-md border border-gray-100">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Invited Meetings</h2>
      </div>

      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Organizer</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!meetings || meetings.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No invited meetings
                </TableCell>
              </TableRow>
            ) : (
              (meetings || []).map((meeting) => (
                <TableRow key={meeting._id}>
                  <TableCell>{meeting.subject}</TableCell>
                  <TableCell>{new Date(meeting.date).toLocaleDateString()}</TableCell>
                  <TableCell>{meeting.startTime} - {meeting.endTime}</TableCell>
                  <TableCell>{meeting.organizer}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      meeting.status === "Accepted" 
                        ? "bg-green-100 text-green-800"
                        : meeting.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {meeting.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default InvitedMeetings;
