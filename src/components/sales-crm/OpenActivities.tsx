"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  Skeleton,
  Tooltip,
  Divider,
  Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ActivityDialog from "./ActivityDialog";
import ConfirmationDialog from "./ConfirmationDialog";

import leadsApi, { Task } from "@/api/leadsApi";
import { Call } from "@/api/callsApi";
import { Task as TaskType } from "@/api/taskApi";
import { getUserMeetings, Meeting } from "@/api/meetingsApi";
import { useTasksStore } from "@/stores/salesCrmStore/useTasksStore";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface OpenActivitiesProps {
  leadId: string;
}

const OpenActivities: React.FC<OpenActivitiesProps> = ({ leadId }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    tasks: storeTasks, 
    isLoading: tasksLoading, 
    error: tasksError,
    fetchLeadTasks,
    deleteTask,
    updateTask
  } = useTasksStore();
  
  const {
    calls,
    isLoading: callsLoading,
    error: callsError,
    fetchLeadCalls
  } = useCallsStore();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCompleteTaskModal, setShowCompleteTaskModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<{
    id: string;
    subject: string;
  } | null>(null);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [showCompleteMeetingModal, setShowCompleteMeetingModal] =
    useState(false);
  const [meetingToComplete, setMeetingToComplete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isCompletingMeeting, setIsCompletingMeeting] = useState(false);
  const [showCompleteCallModal, setShowCompleteCallModal] = useState(false);
  const [showCancelCallModal, setShowCancelCallModal] = useState(false);
  const [showRescheduleCallModal, setShowRescheduleCallModal] = useState(false);
  const [showDeleteMeetingModal, setShowDeleteMeetingModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    subject: string;
  } | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [callToAction, setCallToAction] = useState<{
    id: string;
    subject: string;
  } | null>(null);
  const [isCompletingCall, setIsCompletingCall] = useState(false);
  const [isCancellingCall, setIsCancellingCall] = useState(false);
  const [isReschedulingCall, setIsReschedulingCall] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    anchorEl: HTMLElement | null;
    type: "Task" | "Meeting" | "Call" | null;
    itemId: string | null;
  }>({ anchorEl: null, type: null, itemId: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState<
    "Task" | "Meeting" | "Call" | null
  >(null);
  const [loading, setLoading] = useState({
    meetings: true,
  });

  useEffect(() => {
    if (user?.companyId && leadId) {
      fetchLeadTasks(leadId, user.companyId);
      fetchLeadCalls(leadId);
      fetchMeetings();
    }
  }, [leadId, user?.companyId, fetchLeadTasks, fetchLeadCalls]);

  const fetchMeetings = async () => {
    if (!user?.companyId || !leadId) {
      console.error("Missing required parameters for fetching meetings");
      return;
    }
    
    try {
      const response = await getUserMeetings({
        leadId,
        companyId: user.companyId
      });
      
      console.log("Meeting data from API:", response.result.meetings); // Debug log to check structure
      
      if (response.success && Array.isArray(response.result.meetings)) {
        setMeetings(response.result.meetings);
      } else {
        console.error("Invalid meeting data structure:", response);
        setMeetings([]);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setMeetings([]);
    } finally {
      setLoading((prev) => ({ ...prev, meetings: false }));
    }
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/sales-crm/tasks/${taskId}`);
  };
  const handleMeetingClick = (meetingId: string) => {
    router.push(`/sales-crm/meetings/${meetingId}`);
  };
  const handleCallClick = (callId: string) => {
    router.push(`/sales-crm/calls/${callId}/edit`);
  };

  const handleCompleteCallConfirm = async () => {
    if (!callToAction) return;

    try {
      setIsCompletingCall(true);
      await leadsApi.completeCall(leadId, callToAction.id);
      await fetchLeadCalls(leadId);
      setShowCompleteCallModal(false);
      setCallToAction(null);
      // window.location.reload();
    } catch (err) {
      console.error("Error completing call:", err);
    } finally {
      setIsCompletingCall(false);
    }
  };

  const handleCancelCallConfirm = async () => {
    if (!callToAction) return;

    try {
      setIsCancellingCall(true);
      await leadsApi.cancelCall(leadId, callToAction.id);
      await fetchLeadCalls(leadId);
      setShowCancelCallModal(false);
      setCallToAction(null);
      // window.location.reload();
    } catch (err) {
      console.error("Error cancelling call:", err);
    } finally {
      setIsCancellingCall(false);
    }
  };

  const handleRescheduleCallConfirm = async () => {
    if (!callToAction || !rescheduleDate || !rescheduleNotes) return;

    try {
      setIsReschedulingCall(true);
      await leadsApi.rescheduleCall(leadId, callToAction.id, {
        callStartTime: new Date(rescheduleDate).toISOString(),
        notes: rescheduleNotes,
      });
      await fetchLeadCalls(leadId);
      setShowRescheduleCallModal(false);
      setCallToAction(null);
      setRescheduleDate("");
      setRescheduleNotes("");
      // window.location.reload();
    } catch (err) {
      console.error("Error rescheduling call:", err);
    } finally {
      setIsReschedulingCall(false);
    }
  };

  const handleContextMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    type: "Task" | "Meeting" | "Call",
    itemId: string
  ) => {
    event.preventDefault();
    setContextMenu({ anchorEl: event.currentTarget, type, itemId });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ anchorEl: null, type: null, itemId: null });
  };

  const handleCompleteTask = async (taskId: string, subject: string) => {
    setTaskToComplete({ id: taskId, subject });
    setShowCompleteTaskModal(true);
    handleCloseContextMenu();
  };

  const handleCompleteTaskConfirm = async () => {
    if (!taskToComplete || !taskToComplete.id) return;

    try {
      setIsCompletingTask(true);
      
      // Call the API to update task status to 'done'
      await updateTask(taskToComplete.id, { status: 'done' });
      
      // Reset states
      setShowCompleteTaskModal(false);
      setTaskToComplete(null);
      setIsCompletingTask(false);
      
      // Refresh task list
      if (user?.companyId) {
        await fetchLeadTasks(leadId, user.companyId);
      }
      
    } catch (err) {
      console.error("Error completing task:", err);
      // Optionally show error message to user
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleCompleteMeeting = (meeting: Meeting) => {
    // Use _id as the primary identifier
    if (!meeting._id) {
      console.warn('Meeting is missing ID');
      return;
    }
    
    setMeetingToComplete({
      id: meeting._id,
      title: meeting.title || meeting.meetingVenue || 'Untitled Meeting',
    });
    setShowCompleteMeetingModal(true);
    handleCloseContextMenu();
  };

  const handleCompleteMeetingConfirm = async () => {
    if (!meetingToComplete) return;

    try {
      setIsCompletingMeeting(true);
      await leadsApi.completedMeeting(leadId, meetingToComplete.id);
      await fetchMeetings();
      setShowCompleteMeetingModal(false);
      setMeetingToComplete(null);

      // window.location.reload();
    } catch (err) {
      console.error("Error completing meeting:", err);
    } finally {
      setIsCompletingMeeting(false);
    }
  };

  const handleDeleteActivity = () => {
    const { type, itemId } = contextMenu;
    handleCloseContextMenu();
    
    if (type === "Meeting" && itemId) {
      // Find meeting by either id or _id
      const meeting = meetings.find(m => m._id === itemId);
      if (meeting) {
        console.log("Found meeting:", meeting, "Using ID:", meeting._id);
        setMeetingToDelete({
          id: meeting._id,
          title: meeting.title || meeting.meetingVenue || "this meeting"
        });
        setShowDeleteMeetingModal(true);
      }
    } else if (type === "Task" && itemId) {
      // Find task by either id or _id
      const task = storeTasks.find((t: TaskType) => (t.id === itemId || t.id === itemId));
      if (task) {
        // Use task id from the new API structure
        const idToUse = task.id;
        console.log("Found task:", task, "Using ID:", idToUse);
        setTaskToDelete({
          id: idToUse,
          subject: task.title || "this task"
        });
        setShowDeleteTaskModal(true);
      }
    } else {
      console.warn("Delete functionality for this type is not yet implemented");
    }
  };

  const handleDeleteMeetingConfirm = async () => {
    if (!meetingToDelete) return;

    try {
      setIsDeletingMeeting(true);
      console.log("Deleting meeting with ID:", meetingToDelete.id);
      
      // Use the meetingsApi deleteMeeting function
      const { deleteMeeting } = await import('@/api/meetingsApi');
      await deleteMeeting(meetingToDelete.id);
      
      // Refresh meeting list
      await fetchMeetings();
      setShowDeleteMeetingModal(false);
      setMeetingToDelete(null);
    } catch (err) {
      console.error("Error deleting meeting:", err);
    } finally {
      setIsDeletingMeeting(false);
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (!taskToDelete) return;

    try {
      setIsDeletingTask(true);
      console.log("Deleting task with ID:", taskToDelete.id);
      await deleteTask(taskToDelete.id);
      setShowDeleteTaskModal(false);
      setTaskToDelete(null);
      // Refresh task list
      if (user?.companyId) {
        await fetchLeadTasks(leadId, user.companyId);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleEditActivity = () => {
    const { type, itemId } = contextMenu;
    handleCloseContextMenu();
    if (!itemId) return;

    if (type === "Task") {
      // Find task by either id or _id and use taskId for navigation
      const task = storeTasks.find((t: TaskType) => (t.id === itemId || t.id === itemId));
      if (task && task.id) {
        router.push(`/sales-crm/tasks/${task.id}`);
      }
    } else if (type === "Meeting") {
      // Find meeting by _id
      const meeting = meetings.find(m => m._id === itemId);
      if (meeting && meeting._id) {
        router.push(`/sales-crm/meetings/${meeting._id}/edit`);
      }
    } else if (type === "Call") {
      // Find call by _id and use callId for navigation
      const call = calls.find(c => c._id === itemId);
      if (call && call.callId) {
        router.push(`/sales-crm/calls/${call.callId}/edit`);
      }
    }
  };

  // Temporarily disable cancel functionality
  const handleCancelMeeting = () => {
    console.warn(
      "Cancel meeting functionality is not yet implemented in the API"
    );
    handleCloseContextMenu();
  };

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (type: "Task" | "Meeting" | "Call" | null) => {
    setAnchorEl(null);
    if (type) {
      setActivityType(type);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setActivityType(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-600 border-red-100";
      case "Medium":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "Low":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-50 text-gray-600 border-gray-100";
      case "In Progress":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "Completed":
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
    const startTime = new Date(start).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = new Date(end).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Open Activities
          </h2>
          <p className="text-gray-500">Track and manage all lead activities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClick}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-sm hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm flex items-center group cursor-pointer"
        >
          <AddIcon
            fontSize="small"
            className="mr-2 group-hover:rotate-90 transition-transform"
          />
          <span className="font-medium">Create Activity</span>
        </motion.button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleCloseMenu(null)}
          PaperProps={{
            style: {
              borderRadius: "8px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              minWidth: "200px",
              padding: "8px 0",
              border: "1px solid rgba(0,0,0,0.08)",
            },
          }}
        >
          <MenuItem
            onClick={() => handleCloseMenu("Task")}
            className="hover:bg-indigo-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
              <TaskAltRoundedIcon className="text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-medium block">New Task</span>
              <span className="text-xs text-gray-500">Create a new Task</span>
            </div>
          </MenuItem>
          <MenuItem
            onClick={() => handleCloseMenu("Meeting")}
            className="hover:bg-purple-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
              <CalendarMonthRoundedIcon className="text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-medium block">Schedule Meeting</span>
              <span className="text-xs text-gray-500">Plan an appointment</span>
            </div>
          </MenuItem>
          <MenuItem
            onClick={() => handleCloseMenu("Call")}
            className="hover:bg-green-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
              <CallOutlinedIcon className="text-green-500 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-medium block">Log Call</span>
              <span className="text-xs text-gray-500">
                Record a phone conversation
              </span>
            </div>
          </MenuItem>
        </Menu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks Column */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                <TaskAltRoundedIcon className="text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tasks</h3>
                <p className="text-sm text-gray-500">
                  Pending actions & assignments
                </p>
              </div>
            </div>
                        {storeTasks.length > 0 && (
              <Badge
                badgeContent={storeTasks.length}
                color="primary"
                className="bg-indigo-50 text-indigo-600 font-medium rounded-full px-2 py-1"
              />
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {tasksLoading ? (
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
            ) : storeTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">No tasks found</p>
              </div>
            ) : (
              storeTasks.map((task: TaskType) => (
                <motion.div
                  key={task.id}
                  whileHover={{ y: -2 }}
                  className="group p-4 rounded-lg border border-gray-100 hover:border-indigo-100 hover:shadow-xs transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h4
                      className="font-medium text-gray-900 mb-2 hover:text-indigo-600 cursor-pointer transition-colors"
                      onClick={() => task.id && handleTaskClick(task.id)}
                    >
                      {task.title}
                    </h4>
                    <IconButton
                      size="small"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleContextMenu(e, "Task", task.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Chip
                        size="small"
                        label={task.priority}
                        className={`${getPriorityColor(task.priority)} font-medium`}
                      />
                      <Chip
                        size="small"
                        label={task.status}
                        className={`${getStatusColor(task.status)} font-medium`}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.assign && (
                        <Tooltip title={task.assign.name}>
                          <Avatar
                            sx={{ width: 24, height: 24 }}
                            className="bg-indigo-100 text-indigo-600 text-xs"
                          >
                            {task.assign.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      )}
                      {task.createdAt && (
                        <span className="text-xs text-gray-400">
                          <AccessTimeIcon
                            fontSize="inherit"
                            className="mr-1"
                          />
                          {formatDateTime(task.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Meetings Column */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <CalendarMonthRoundedIcon className="text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Meetings</h3>
                <p className="text-sm text-gray-500">Scheduled appointments</p>
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

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
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
            ) : meetings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">No meetings scheduled</p>
              </div>
            ) : (
              meetings.map((meeting) => (
                <motion.div
                  key={meeting._id}
                  whileHover={{ y: -2 }}
                  className="group p-4 rounded-lg border border-gray-100 hover:border-purple-100 hover:shadow-xs transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h4
                      className="font-medium text-gray-900 mb-2 hover:text-purple-600  cursor-pointer transition-colors"
                      onClick={() => {
                        if (meeting._id) handleMeetingClick(meeting._id);
                      }}
                    >
                      {meeting.title || meeting.meetingVenue || "Untitled Meeting"}
                    </h4>

                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(e) =>
                          handleContextMenu(e, "Meeting", meeting._id)
                        }
                        className={
                          contextMenu.itemId === meeting._id &&
                          contextMenu.type === "Meeting"
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100 transition-opacity"
                        }
                      >
                        <MoreVertIcon
                          fontSize="small"
                          className="text-gray-400"
                        />
                      </IconButton>
                    </Tooltip>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <AccessTimeIcon
                      fontSize="small"
                      className="mr-1.5 text-gray-400"
                    />
                    {formatTimeRange(meeting.fromDateTime, meeting.toDateTime)}
                    {meeting.allDay && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        All Day
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <LocationOnIcon
                      fontSize="small"
                      className="mr-1.5 text-gray-400"
                    />
                    {meeting.meetingVenue || meeting.location || "Virtual"}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Avatar
                      sx={{ width: 24, height: 24, fontSize: 12 }}
                      className="mr-2 bg-purple-100 text-purple-600"
                    >
                      {typeof meeting.meetingOwner === 'object' 
                        ? meeting.meetingOwner.name?.charAt(0)?.toUpperCase() 
                        : meeting.host?.charAt(0)?.toUpperCase() || "H"}
                    </Avatar>
                    Host: {typeof meeting.meetingOwner === 'object' 
                      ? meeting.meetingOwner.name 
                      : meeting.host || "Not specified"}
                  </div>
                  
                  {/* Show meeting status */}
                  <div className="flex items-center text-sm">
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        meeting.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : meeting.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : meeting.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {meeting.status ? meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1) : 'Scheduled'}
                    </span>
                  </div>

                  {meeting.participants.length > 0 && (
                    <div className="flex items-start text-sm text-gray-500">
                      <PeopleAltIcon
                        fontSize="small"
                        className="mr-1.5 mt-0.5 text-gray-400"
                      />
                      <span>
                        {meeting.participants.slice(0, 3).join(", ")}
                        {meeting.participants.length > 3 &&
                          ` +${meeting.participants.length - 3} more`}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Calls Column */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <CallOutlinedIcon className="text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Calls</h3>
                <p className="text-sm text-gray-500">Call logs & records</p>
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

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {callsLoading ? (
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
            ) : calls.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">No call records</p>
              </div>
            ) : (
              calls.map((call) => (
                <motion.div
                  key={call._id}
                  whileHover={{ y: -2 }}
                  className="group p-4 rounded-lg border border-gray-100 hover:border-green-100 hover:shadow-xs transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h4
                      className="font-medium text-gray-900 mb-2 hover:text-green-600 cursor-pointer transition-colors"
                      onClick={() => {
                        const callId = call.callId || call._id;
                        if (callId) handleCallClick(callId);
                      }}
                    >
                      {call.callPurpose}
                    </h4>
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleContextMenu(e, "Call", call._id)}
                        className={
                          contextMenu.itemId === call._id &&
                          contextMenu.type === "Call"
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100 transition-opacity"
                        }
                      >
                        <MoreVertIcon
                          fontSize="small"
                          className="text-gray-400"
                        />
                      </IconButton>
                    </Tooltip>
                  </div>

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
                      {typeof call.callOwner === 'object' 
                        ? call.callOwner.name.charAt(0).toUpperCase()
                        : call.callOwner.charAt(0).toUpperCase()
                      }
                    </Avatar>
                    {typeof call.callOwner === 'object' ? call.callOwner.name : call.callOwner}
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
                      className="text-xs font-medium border bg-amber-50 text-amber-600 border-amber-100"
                    />
                  </div>

                
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Context Menus */}
      {/* Task Context Menu */}
      <Menu
        anchorEl={contextMenu.anchorEl}
        open={Boolean(contextMenu.anchorEl && contextMenu.type === "Task")}
        onClose={handleCloseContextMenu}
        PaperProps={{
          style: {
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            minWidth: "200px",
          },
        }}
      >
        <MenuItem
          onClick={handleEditActivity}
          className="hover:bg-indigo-50 transition-colors"
        >
          <EditIcon fontSize="small" className="mr-3 text-indigo-500" />
          <span className="font-medium">Edit Task</span>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const task = storeTasks.find((t: TaskType) => t.id === contextMenu.itemId);
            if (task && task.id) {
              handleCompleteTask(task.id, task.title);
            }
          }}
          className="hover:bg-green-50 transition-colors"
        >
          <CheckCircleIcon fontSize="small" className="mr-3 text-green-500" />
          <span className="font-medium">Mark as Completed</span>
        </MenuItem>
        <Divider className="my-1" />
        <MenuItem
          onClick={handleDeleteActivity}
          className="hover:bg-red-50 transition-colors text-red-600"
        >
          <DeleteIcon fontSize="small" className="mr-3" />
          <span className="font-medium">Delete Task</span>
        </MenuItem>
      </Menu>

      {/* Meeting Context Menu */}
      <Menu
        anchorEl={contextMenu.anchorEl}
        open={Boolean(contextMenu.anchorEl && contextMenu.type === "Meeting")}
        onClose={handleCloseContextMenu}
        PaperProps={{
          style: {
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            minWidth: "200px",
          },
        }}
      >
        <MenuItem
          onClick={handleEditActivity}
          className="hover:bg-purple-50 transition-colors"
        >
          <EditIcon fontSize="small" className="mr-3 text-purple-500" />
          <span className="font-medium">Edit Meeting</span>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const meeting = meetings.find((m) => m._id === contextMenu.itemId || m.id === contextMenu.itemId);
            if (meeting && meeting.meetingId) {
              handleCompleteMeeting(meeting);
            }
          }}
          className="hover:bg-green-50 transition-colors"
        >
          <CheckCircleIcon fontSize="small" className="mr-3 text-green-500" />
          <span className="font-medium">Mark as Complete</span>
        </MenuItem>

        <Divider className="my-1" />
        <MenuItem
          onClick={handleDeleteActivity}
          className="hover:bg-red-50 transition-colors text-red-600"
        >
          <DeleteIcon fontSize="small" className="mr-3" />
          <span className="font-medium">Delete Meeting</span>
        </MenuItem>
      </Menu>

      {/* Call Context Menu */}
      <Menu
        anchorEl={contextMenu.anchorEl}
        open={Boolean(contextMenu.anchorEl && contextMenu.type === "Call")}
        onClose={handleCloseContextMenu}
        PaperProps={{
          style: {
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            minWidth: "200px",
          },
        }}
      >
        <MenuItem
          onClick={handleEditActivity}
          className="hover:bg-green-50 transition-colors"
        >
          <EditIcon fontSize="small" className="mr-3 text-green-500" />
          <span className="font-medium">Edit Call</span>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const call = calls.find((c) => c._id === contextMenu.itemId);
            if (call && call.callId) {
              setCallToAction({ id: call.callId, subject: call.callPurpose });
              setShowRescheduleCallModal(true);
            }
            handleCloseContextMenu();
          }}
          className="hover:bg-indigo-50 transition-colors"
        >
          <ScheduleIcon fontSize="small" className="mr-3 text-indigo-500" />
          <span className="font-medium">Reschedule Call</span>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const call = calls.find((c) => c._id === contextMenu.itemId);
            if (call && call.callId) {
              setCallToAction({ id: call.callId, subject: call.callPurpose });
              setShowCompleteCallModal(true);
            }
            handleCloseContextMenu();
          }}
          className="hover:bg-emerald-50 transition-colors"
        >
          <CheckCircleIcon fontSize="small" className="mr-3 text-emerald-500" />
          <span className="font-medium">Mark as Completed</span>
        </MenuItem>
        <Divider className="my-1" />

        <MenuItem
          onClick={() => {
            const call = calls.find((c) => c._id === contextMenu.itemId);
            if (call && call.callId) {
              setCallToAction({ id: call.callId, subject: call.callPurpose });
              setShowCancelCallModal(true);
            }
            handleCloseContextMenu();
          }}
          className="hover:bg-orange-50 transition-colors"
        >
          <CancelIcon fontSize="small" className="mr-3 text-orange-500" />
          <span className="font-medium">Cancel Call</span>
        </MenuItem>
      </Menu>

      {/* Task Completion Confirmation Dialog */}
      <ConfirmationDialog
        show={showCompleteTaskModal}
        title="Complete Task"
        message={`Are you sure you want to mark "${taskToComplete?.subject}" as completed?`}
        onConfirm={handleCompleteTaskConfirm}
        onCancel={() => {
          setShowCompleteTaskModal(false);
          setTaskToComplete(null);
        }}
        confirmText={isCompletingTask ? "Completing..." : "Complete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isCompletingTask}
        disableCancel={isCompletingTask}
      />

      {/* Meeting Completion Confirmation Dialog */}
      <ConfirmationDialog
        show={showCompleteMeetingModal}
        title="Complete Meeting"
        message={`Are you sure you want to mark "${meetingToComplete?.title}" as completed?`}
        onConfirm={handleCompleteMeetingConfirm}
        onCancel={() => {
          setShowCompleteMeetingModal(false);
          setMeetingToComplete(null);
        }}
        confirmText={isCompletingMeeting ? "Completing..." : "Complete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isCompletingMeeting}
        disableCancel={isCompletingMeeting}
      />

      {/* Call Action Confirmation Dialogs */}
      <ConfirmationDialog
        show={showCompleteCallModal}
        title="Complete Call"
        message={`Are you sure you want to mark "${callToAction?.subject}" as completed?`}
        onConfirm={handleCompleteCallConfirm}
        onCancel={() => {
          setShowCompleteCallModal(false);
          setCallToAction(null);
        }}
        confirmText={isCompletingCall ? "Completing..." : "Complete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isCompletingCall}
        disableCancel={isCompletingCall}
      />

      <ConfirmationDialog
        show={showCancelCallModal}
        title="Cancel Call"
        message={`Are you sure you want to cancel "${callToAction?.subject}"?`}
        onConfirm={handleCancelCallConfirm}
        onCancel={() => {
          setShowCancelCallModal(false);
          setCallToAction(null);
        }}
        confirmText={isCancellingCall ? "Cancelling..." : "Cancel Call"}
        cancelText="Keep"
        type="danger"
        disableConfirm={isCancellingCall}
        disableCancel={isCancellingCall}
      />

      <ConfirmationDialog
        show={showRescheduleCallModal}
        title="Reschedule Call"
        message={
          <div className="space-y-4">
            <div>
              <p>Select new date and time for the call:</p>
              <input
                type="datetime-local"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="mt-4 p-2 border rounded w-full"
              />
            </div>
            <div>
              <p>Notes:</p>
              <textarea
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                placeholder="Enter rescheduling reason..."
                rows={3}
                className="mt-2 p-2 border rounded w-full resize-none"
              />
            </div>
          </div>
        }
        onConfirm={handleRescheduleCallConfirm}
        onCancel={() => {
          setShowRescheduleCallModal(false);
          setCallToAction(null);
          setRescheduleDate("");
          setRescheduleNotes("");
        }}
        confirmText={isReschedulingCall ? "Rescheduling..." : "Reschedule"}
        cancelText="Cancel"
        type="warning"
        disableConfirm={
          isReschedulingCall || !rescheduleDate || !rescheduleNotes
        }
        disableCancel={isReschedulingCall}
      />

      {/* Meeting Delete Confirmation Dialog */}
      <ConfirmationDialog
        show={showDeleteMeetingModal}
        title="Delete Meeting"
        message={`Are you sure you want to delete "${meetingToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteMeetingConfirm}
        onCancel={() => {
          setShowDeleteMeetingModal(false);
          setMeetingToDelete(null);
        }}
        confirmText={isDeletingMeeting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isDeletingMeeting}
        disableCancel={isDeletingMeeting}
      />

      {/* Task Delete Confirmation Dialog */}
      <ConfirmationDialog
        show={showDeleteTaskModal}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.subject}"? This action cannot be undone.`}
        onConfirm={handleDeleteTaskConfirm}
        onCancel={() => {
          setShowDeleteTaskModal(false);
          setTaskToDelete(null);
        }}
        confirmText={isDeletingTask ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isDeletingTask}
        disableCancel={isDeletingTask}
      />

      {/* Activity Dialog */}
      <ActivityDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        type={activityType}
        leadId={leadId}
      />
    </div>
  );
};

export default OpenActivities;
