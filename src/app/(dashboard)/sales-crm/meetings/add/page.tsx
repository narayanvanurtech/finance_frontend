"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMeetingsStore } from '@/stores/salesCrmStore/useMeetingsStore';
import { useAuthStore } from '@/stores/salesCrmStore/useAuthStore';
import { useLeadsStore } from '@/stores/salesCrmStore/useLeadsStore';
import { useRoleBasedRouter } from '@/hooks/useRoleBasedRouter';
import {
  LocationOn,
  Business,
  Event,
  Schedule,
  AccessTime,
  Email,
  People,
  Cancel,
  Add,
} from '@mui/icons-material';
import { Switch, Chip, TextField, Autocomplete } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const MEETING_VENUES = ["In-office", "Client location", "Online"] as const;
const MEETING_STATUSES = ["scheduled", "completed", "missed", "cancel", "rescheduled"] as const;

const CreateMeetingPage = () => {
  const router = useRouter();
  const { pushToRolePath } = useRoleBasedRouter();
  const { addMeeting, isLoading } = useMeetingsStore();
  const { user } = useAuthStore();
  const { leads, fetchLeads, isLoading: leadsLoading } = useLeadsStore();
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<string>("");

  const [formData, setFormData] = useState({
    meetingVenue: 'In-office' as typeof MEETING_VENUES[number],
    location: '',
    allDay: false,
    title: 'New Meeting',
    status: 'scheduled' as typeof MEETING_STATUSES[number],
    leadId: '', // Will be set from selected lead
    companyId: user?.companyId || '',
    fromDateTime: new Date(new Date().setHours(new Date().getHours() + 1, 0, 0, 0)).toISOString(),
    toDateTime: new Date(new Date().setHours(new Date().getHours() + 2, 0, 0, 0)).toISOString(),
    host: user?.email || '',
    notes: '',
    participants: [] as string[],
    participantsReminder: true,
  });
  
  // Fetch leads when component mounts
  useEffect(() => {
    if (user?.companyId) {
      fetchLeads(user.companyId);
    }
  }, [user?.companyId, fetchLeads]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: string, value: Date | null) => {
    if (value) {
      setFormData(prev => ({
        ...prev,
        [field]: value.toISOString()
      }));
    }
  };

  const handleAddParticipant = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && participantInput.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantInput)) {
        setError("Please enter a valid email address");
        return;
      }
      
      if (!participants.includes(participantInput)) {
        setParticipants([...participants, participantInput]);
        setFormData(prev => ({
          ...prev,
          participants: [...prev.participants, participantInput]
        }));
      }
      setParticipantInput('');
    }
  };

  const handleDeleteParticipant = (participantToDelete: string) => {
    const updatedParticipants = participants.filter(
      participant => participant !== participantToDelete
    );
    setParticipants(updatedParticipants);
    setFormData(prev => ({
      ...prev,
      participants: updatedParticipants
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate emails format
    if (!formData.host || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.host)) {
      setError("Please enter a valid host email address");
      return;
    }

    // Validate that we have a leadId selected
    if (!selectedLead) {
      setError("Please select a lead for this meeting");
      return;
    }
    
    if (!user?.companyId) {
      setError("Company ID is required");
      return;
    }

    try {
      // Create submission data with selected lead ID and company ID
      const meetingDataToSubmit = {
        meetingVenue: formData.meetingVenue,
        location: formData.location,
        allDay: formData.allDay,
        title: formData.title,
        status: formData.status,
        fromDateTime: formData.fromDateTime,
        toDateTime: formData.toDateTime,
        host: formData.host,
        notes: formData.notes,
        participants: formData.participants,
        participantsReminder: formData.participantsReminder,
        leadId: selectedLead,
        companyId: user.companyId,
      };
      
      console.log("Creating meeting with data:", meetingDataToSubmit);
      console.log("Selected lead:", selectedLead);
      console.log("Company ID:", user.companyId);
      
      await addMeeting(meetingDataToSubmit);
      console.log("Meeting created successfully");
      pushToRolePath('/sales-crm/meetings');
    } catch (error: any) {
      setError(error?.message || 'Failed to create meeting. Please try again.');
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="mx-auto py-20 px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Create New Meeting</h1>

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Meeting Details Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Event className="w-5 h-5 mr-2 text-indigo-600" />
                Meeting Details
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g., Project Kickoff, Weekly Update"
                      required
                    />
                    <Event className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Venue <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={formData.meetingVenue}
                      onChange={(e) => handleChange('meetingVenue', e.target.value)}
                      required
                    >
                      {MEETING_VENUES.map((venue) => (
                        <option key={venue} value={venue}>
                          {venue}
                        </option>
                      ))}
                    </select>
                    <LocationOn className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="e.g., Office Address, Meeting Link"
                      required
                    />
                    <Business className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>

              
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={new Date(formData.fromDateTime)}
                        onChange={(date) => handleDateChange('fromDateTime', date)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            required: true,
                          
                            className: "pl-8"
                          } 
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={new Date(formData.toDateTime)}
                        onChange={(date) => handleDateChange('toDateTime', date)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            required: true,

                            className: "pl-8"
                          } 
                        }}
                        minDateTime={new Date(formData.fromDateTime)}
                      />
                    </LocalizationProvider>
                  </div>
                </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      required
                    >
                      {MEETING_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <Schedule className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    All Day Meeting
                  </label>
                  <div className="flex items-center">
                    <Switch
                      checked={formData.allDay}
                      onChange={(e) => handleChange('allDay', e.target.checked)}
                      color="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participants Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <People className="w-5 h-5 mr-2 text-indigo-600" />
                Participants Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Lead <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={selectedLead}
                      onChange={(e) => setSelectedLead(e.target.value)}
                      required
                    >
                      <option value="">-- Select a Lead --</option>
                      {leads.map((lead) => (
                        <option key={lead._id || lead.id} value={lead._id || lead.id}>
                          {lead.firstName} {lead.lastName} ({lead.email})
                        </option>
                      ))}
                    </select>
                    <Email className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  {leadsLoading && (
                    <div className="text-sm text-gray-500 mt-1">Loading leads...</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      value={formData.host}
                      onChange={(e) => handleChange('host', e.target.value)}
                      placeholder="host@example.com"
                      required
                    />
                    <Email className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participant Reminder
                  </label>
                  <div className="flex items-center">
                    <Switch
                      checked={formData.participantsReminder}
                      onChange={(e) => handleChange('participantsReminder', e.target.checked)}
                      color="primary"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      Send reminder to participants
                    </span>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Add any notes or details about this meeting..."
                  ></textarea>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Participants
                  </label>
                  <Autocomplete
                    multiple
                    id="participants-tags"
                    options={[]}
                    freeSolo
                    value={participants}
                    inputValue={participantInput}
                    onInputChange={(event, newInputValue) => {
                      setParticipantInput(newInputValue);
                    }}
                    onChange={(event, newValue) => {
                      setParticipants(newValue);
                      setFormData(prev => ({
                        ...prev,
                        participants: newValue
                      }));
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          {...getTagProps({ index })}
                          onDelete={() => handleDeleteParticipant(option)}
                          className="m-1"
                          size="small"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Type email and press Enter"
                        fullWidth
                        onKeyDown={handleAddParticipant}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <People className="ml-2 mr-2 text-gray-400" />
                              {params.InputProps.startAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                  />
                  <small className="text-gray-500 mt-1 block">
                    Press Enter after typing each email address
                  </small>
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
              <Cancel className="mr-2 h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Add className="mr-2 h-4 w-4" />
                  Create Meeting
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingPage;
