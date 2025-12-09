"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Assignment,
  Save,
  PriorityHigh,
  Schedule,
  Person,
  Email,
  Event,
  NotificationsActive,
} from "@mui/icons-material";
import leadsApi, { Task } from "@/api/leadsApi";

type TaskPriority = "high" | "medium" | "low";
type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Deferred";

interface EditedTask {
  subject: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  reminder: boolean;
  leadEmail: string;
  completionDate: string | null;
}

const TaskDetailsPage = ({
  params,
}: {
  params: { id: string; taskId: string };
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityType = searchParams.get("type") || "open";
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<EditedTask>({
    subject: "",
    description: "",
    priority: "medium",
    status: "Not Started",
    dueDate: "",
    reminder: false,
    leadEmail: "",
    completionDate: null,
  });

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const response = await leadsApi.getTask(params.id, params.taskId, activityType);
        console.log('API Response data:', response.data);
        console.log('Task ID from API response:', response.data.taskId);
        
        setTask(response.data);
        setEditedTask({
          subject: response.data.subject,
          description: response.data.description || "",
          priority: (response.data.priority.toLowerCase() ||
            "medium") as TaskPriority,
          status: response.data.status as TaskStatus,
          dueDate: response.data.dueDate,
          reminder: response.data.reminder || false,
          leadEmail: response.data.leadEmail || "",
          completionDate: response.data.completionDate || null,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching task details:", err);
        setError("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [params.id, params.taskId, activityType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!task) {
        setError("Task data is missing");
        return;
      }
      
      // Make sure taskId exists, fall back to params.taskId if it doesn't
      const taskId = task.taskId || params.taskId;
      
      console.log('Lead ID from params:', params.id);
      console.log('Task ID from URL params:', params.taskId);
      console.log('Task ID from task object:', task.taskId);
      console.log('Final Task ID being used:', taskId);
      console.log('Edited task data being sent:', editedTask);
      
      // Using the determined taskId
      await leadsApi.updateLeadsTask(params.id, taskId, editedTask);
      console.log('Task updated successfully');
      
      // Also use the same taskId here for consistency
      const response = await leadsApi.getTask(params.id, taskId, activityType);
      setTask(response.data);
      router.push(`/leads/${params.id}/`);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Error: {error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Edit Task</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
          {/* Task Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Assignment className="w-5 h-5 mr-2 text-indigo-600" />
                Task Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    name="subject"
                    value={editedTask.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter task subject"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                    name="description"
                    value={editedTask.description}
                    onChange={handleInputChange}
                    placeholder="Enter task description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedTask.priority}
                    onChange={(e) =>
                      setEditedTask((prev) => ({
                        ...prev,
                        priority: e.target.value as TaskPriority,
                      }))
                    }
                    required
                  >
                    <option value="">Select Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedTask.status}
                    onChange={(e) =>
                      setEditedTask((prev) => ({
                        ...prev,
                        status: e.target.value as TaskStatus,
                      }))
                    }
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Deferred">Deferred</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Contact Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Schedule className="w-5 h-5 mr-2 text-indigo-600" />
                Schedule & Contact Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date & Time <span className="text-red-500">*</span>
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      value={
                        editedTask.dueDate ? new Date(editedTask.dueDate) : null
                      }
                      onChange={(date) => {
                        if (date) {
                          setEditedTask((prev) => ({
                            ...prev,
                            dueDate: date.toISOString(),
                          }));
                        }
                      }}
                      className="w-full"
                      slotProps={{
                        textField: {
                          className: "w-full",
                          size: "small",
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    name="leadEmail"
                    value={editedTask.leadEmail}
                    onChange={handleInputChange}
                    placeholder="Enter lead email"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between border border-gray-300 rounded-md p-3 hover:border-indigo-500 transition-all">
                    <div className="flex items-center">
                      <NotificationsActive className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Reminder
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={editedTask.reminder}
                        onChange={(event) => setEditedTask((prev) => ({ ...prev, reminder: event.target.checked }))}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
