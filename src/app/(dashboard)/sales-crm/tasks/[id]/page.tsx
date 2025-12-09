'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasksStore } from '@/stores/salesCrmStore/useTasksStore';
import { useAuthStore } from '@/stores/salesCrmStore/useAuthStore';
import { format } from 'date-fns';
import { 
  Event as EventIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as CompanyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const STATUSES = ["open", "progress", "done", "cancel"] as const;

const TaskDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentTask, isLoading, error, getTaskById, updateTask } = useTasksStore();
  const [editedTask, setEditedTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as typeof PRIORITIES[number],
    status: 'open' as typeof STATUSES[number],
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (params.id && user?.companyId) {
      getTaskById(params.id as string, user.companyId);
    }
  }, [params.id, user?.companyId, getTaskById]);

  useEffect(() => {
    if (currentTask) {
      setEditedTask({
        title: currentTask.title || '',
        description: currentTask.description || '',
        priority: currentTask.priority,
        status: currentTask.status,
      });
    }
  }, [currentTask]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'priority') {
      setEditedTask(prev => ({ ...prev, priority: value as typeof PRIORITIES[number] }));
    } else if (name === 'status') {
      setEditedTask(prev => ({ ...prev, status: value as typeof STATUSES[number] }));
    }
  };

  const handleSave = async () => {
    if (currentTask && user?.companyId) {
      try {
        await updateTask(currentTask.id, editedTask);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        
        // Refresh the task data
        getTaskById(currentTask.id, user.companyId);
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Error: {error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => user?.companyId && getTaskById(params.id as string, user.companyId)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Task Not Found</h2>
          <p className="text-gray-600 mb-6">The task you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/tasks')}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Go Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-4 p-2 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
          >
            <BackIcon />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
        </div>

        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">Task updated successfully!</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Task Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <EventIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Task Details
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editedTask.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Task title"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={editedTask.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter task description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={editedTask.priority}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={editedTask.status}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Task Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <PersonIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Task Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task Owner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Owner
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="font-medium text-gray-900">{currentTask.taskOwner?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{currentTask.taskOwner?.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Assigned To */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {currentTask.assign ? (
                      <>
                        <p className="font-medium text-gray-900">{currentTask.assign.name}</p>
                        <p className="text-sm text-gray-600">{currentTask.assign.email}</p>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">Unassigned</p>
                    )}
                  </div>
                </div> */}




                {/* Company Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="font-medium text-gray-900 flex items-center">
                      <CompanyIcon className="w-4 h-4 mr-1" />
                      {currentTask.company?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Lead Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="font-medium text-gray-900">
                      {currentTask.lead?.firstName} {currentTask.lead?.lastName}
                    </p>
                    {currentTask.lead?.email && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <EmailIcon className="w-4 h-4 mr-1" />
                        {currentTask.lead.email}
                      </p>
                    )}
                    {currentTask.lead?.phone && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {currentTask.lead.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {currentTask.createdAt && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Timestamps</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created on:</span>{" "}
                    <span className="text-gray-700">{format(new Date(currentTask.createdAt), 'PPP')}</span>
                  </div>
                  {currentTask.updatedAt && (
                    <div>
                      <span className="text-gray-500">Last updated:</span>{" "}
                      <span className="text-gray-700">{format(new Date(currentTask.updatedAt), 'PPP')}</span>
                    </div>
                  )}
                  {currentTask.completedAt && (
                    <div>
                      <span className="text-gray-500">Completed on:</span>{" "}
                      <span className="text-gray-700">{format(new Date(currentTask.completedAt), 'PPP')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-indigo-600 text-white rounded-md font-medium shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;