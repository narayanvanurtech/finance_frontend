"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton, Avatar, Chip, Badge } from "@mui/material";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { motion } from "framer-motion";
import leadsApi, { Task, Call, Meeting } from "@/api/leadsApi";
import { ca } from "date-fns/locale";

interface ClosedActivitiesProps {
  leadId: string;
}

const ClosedActivities: React.FC<ClosedActivitiesProps> = ({ leadId }) => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState({
    tasks: true,
    calls: true,
    meetings: true,
  });
  const [error, setError] = useState<{
    tasks: string | null;
    calls: string | null;
    meetings: string | null;
  }>({
    tasks: null,
    calls: null,
    meetings: null,
  });

  useEffect(() => {
    fetchClosedTasks();
    fetchClosedCalls();
    fetchClosedMeetings();
  }, [leadId]);

  const fetchClosedTasks = async () => {
    try {
      const response = await leadsApi.getTaskList(leadId, "close");
      setTasks(response.data.data);
      setError((prev) => ({ ...prev, tasks: null }));
    } catch (err) {
      setError((prev) => ({ ...prev, tasks: "Failed to fetch closed tasks" }));
      console.error("Error fetching closed tasks:", err);
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  };

  const fetchClosedCalls = async () => {
    try {
      const response = await leadsApi.getCallList(leadId, "close");
      setCalls(response.data.data);
      setError((prev) => ({ ...prev, calls: null }));
    } catch (err) {
      setError((prev) => ({ ...prev, calls: "Failed to fetch closed calls" }));
      console.error("Error fetching closed calls:", err);
    } finally {
      setLoading((prev) => ({ ...prev, calls: false }));
    }
  };

  const fetchClosedMeetings = async () => {
    try {
      const response = await leadsApi.getMeetingList(leadId, "close");
      setMeetings(response.data.data);
      setError((prev) => ({ ...prev, meetings: null }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        meetings: "Failed to fetch closed meetings",
      }));
      console.error("Error fetching closed meetings:", err);
    } finally {
      setLoading((prev) => ({ ...prev, meetings: false }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-600 border-red-100";
      case "medium":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "low":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = new Date(end).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/leads/${leadId}/task/${taskId}?type=close`);
  };

  const handleMeetingClick = (meetingId: string) => {
    router.push(`/leads/${leadId}/meeting/${meetingId}?type=close`);
  };

  const handleCallClick = (callId: string) => {
    router.push(`/leads/${leadId}/call/${callId}?type=close`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-100 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Closed Activities
          </h2>
          <p className="text-gray-500">
            View completed tasks, meetings, and calls
          </p>
        </div>
      </div>

      {/* Activity sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Column */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <TaskAltRoundedIcon className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Closed Tasks</h3>
                <p className="text-sm text-gray-500">Completed tasks</p>
              </div>
            </div>
            {tasks.length > 0 && (
              <Badge
                badgeContent={tasks.length}
                color="primary"
                className="bg-blue-50 text-blue-600 font-medium rounded-full px-2 py-1"
              />
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {loading.tasks ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg border border-gray-100"
                  >
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </motion.div>
                ))
            ) : error.tasks ? (
              <div className="text-center py-6">
                <p className="text-red-400">{error.tasks}</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">No closed tasks</p>
              </div>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task._id}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-lg border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all mb-4"
                >
                  <h4 
                    className="font-medium text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={() => {
                      const taskId = task.taskId ;
                      console.log("Task ID:", taskId);
                      if (taskId) handleTaskClick(taskId);
                    }}
                  >
                    {task.subject}
                  </h4>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <AccessTimeIcon
                      fontSize="small"
                      className="mr-1.5 text-gray-400"
                    />
                    {formatDateTime(task.dueDate)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Avatar
                      sx={{ width: 24, height: 24, fontSize: 12 }}
                      className="mr-2 bg-blue-100 text-blue-600"
                    >
                      {task.taskOwner.charAt(0).toUpperCase()}
                    </Avatar>
                    {task.taskOwner}
                  </div>
                  <div className="flex gap-2">
                    <Chip
                      label="Completed"
                      size="small"
                      variant="outlined"
                      className="text-xs font-medium border bg-green-50 text-green-600 border-green-100"
                    />
                    <Chip
                      label={`${task.priority} Priority`}
                      size="small"
                      variant="outlined"
                      className={`text-xs font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Meetings Column */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <CalendarMonthRoundedIcon className="text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Closed Meetings</h3>
                <p className="text-sm text-gray-500">Completed meetings</p>
              </div>
            </div>
            {meetings.length > 0 && (
            <Badge
              badgeContent={meetings.length}
              color="primary"
              className="bg-purple-50 text-purple-600 font-medium rounded-full px-2 py-1"
            />
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {loading.meetings ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg border border-gray-100"
                  >
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </motion.div>
                ))
            ) : error.meetings ? (
              <div className="text-center py-6">
                <p className="text-red-400">{error.meetings}</p>
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">No closed meetings</p>
              </div>
            ) : (
              meetings.map((meeting) => (
                <motion.div
                  key={meeting._id}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-lg border border-gray-100 hover:border-purple-100 hover:shadow-sm transition-all mb-4"
                >
                  <h4 
                    className="font-medium text-gray-900 mb-2 hover:text-purple-600 cursor-pointer transition-colors"
                    onClick={() => {
                      const meetingId = meeting.meetingId || meeting.id || meeting._id;
                      if (meetingId) handleMeetingClick(meetingId);
                    }}
                  >
                    {meeting.title}
                  </h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <AccessTimeIcon
                        fontSize="small"
                        className="mr-1.5 text-gray-400"
                      />
                      {formatDateTime(meeting.fromDateTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <LocationOnIcon
                        fontSize="small"
                        className="mr-1.5 text-gray-400"
                      />
                      {meeting.meetingVenue}{" "}
                      {meeting.location && `- ${meeting.location}`}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2 mb-3">
                    <Avatar
                      sx={{ width: 24, height: 24, fontSize: 12 }}
                      className="mr-2 bg-purple-100 text-purple-600"
                    >
                      {meeting.host?.charAt(0)?.toUpperCase() || "H"}
                    </Avatar>
                    Host: {meeting.host}
                  </div>
                  {meeting.participants?.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <PeopleAltIcon
                        fontSize="small"
                        className="mt-0.5 text-gray-400"
                      />
                      <div className="flex-1">
                        {meeting.participants.slice(0, 2).join(", ")}
                        {meeting.participants.length > 2 && (
                          <span className="text-gray-400">
                            {" "}
                            +{meeting.participants.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-2">
                    <Chip
                      label="Completed"
                      size="small"
                      variant="outlined"
                      className="text-xs font-medium border bg-green-50 text-green-600 border-green-100"
                    />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Calls Column */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <CallOutlinedIcon className="text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Closed Calls</h3>
                <p className="text-sm text-gray-500">Completed calls</p>
              </div>
            </div>
            {calls.length > 0 && (
            <Badge
              badgeContent={calls.length}
              color="primary"
              className="bg-green-50 text-green-600 font-medium rounded-full px-2 py-1"
            />
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {loading.calls ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg border border-gray-100"
                  >
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </motion.div>
                ))
            ) : error.calls ? (
              <div className="text-center py-6">
                <p className="text-red-400">{error.calls}</p>
              </div>
            ) : calls.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">No closed calls</p>
              </div>
            ) : (
              calls.map((call) => (
                <motion.div
                  key={call._id}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-lg border border-gray-100 hover:border-green-100 hover:shadow-sm transition-all mb-4"
                >
                  <h4 
                    className="font-medium text-gray-900 mb-2 hover:text-green-600 cursor-pointer transition-colors"
                    onClick={() => {
                      const callId = call.callId || call.id || call._id;
                      if (callId) handleCallClick(callId);
                    }}
                  >
                    {call.subject}
                  </h4>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <AccessTimeIcon
                      fontSize="small"
                      className="mr-1.5 text-gray-400"
                    />
                    {formatDateTime(call.callStartTime)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Avatar
                      sx={{ width: 24, height: 24, fontSize: 12 }}
                      className="mr-2 bg-green-100 text-green-600"
                    >
                      {call.callOwner.charAt(0).toUpperCase()}
                    </Avatar>
                    {call.callOwner}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Chip
                      label={call.callType}
                      size="small"
                      variant="outlined"
                      className="text-xs font-medium border bg-gray-50 text-gray-600 border-gray-100"
                    />
                    <Chip
                      label={call.outgoingCallStatus}
                      size="small"
                      variant="outlined"
                      className="text-xs font-medium border bg-green-50 text-green-600 border-green-100"
                    />
                  </div>
                  {call.callPurpose && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Purpose:</span>{" "}
                      {call.callPurpose}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosedActivities;
