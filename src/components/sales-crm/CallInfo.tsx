"use client";

import React, { useState } from "react";
import { Call, UpdateCallRequest } from "@/api/callsApi";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";
import { TextField, MenuItem, Button } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";

interface CallInfoProps {
  call: Call;
}

const CallInfo: React.FC<CallInfoProps> = ({ call }) => {
  const { updateCall, fetchCallById } = useCallsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    callType: call.callType || "",
    outgoingCallStatus: call.outgoingCallStatus || "scheduled",
    callStartTime: call.callStartTime || "",
    callPurpose: call.callPurpose || "",
    callAgenda: call.callAgenda || "",
    callResult: call.callResult || "",
    notes: call.notes || "",
    description: call.description || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log("Saving call data:", formData);
      await updateCall(call.callId, formData);
      await fetchCallById(call._id);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating call:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      callType: call.callType || "",
      outgoingCallStatus: call.outgoingCallStatus || "scheduled",
      callStartTime: call.callStartTime || "",
      callPurpose: call.callPurpose || "",
      callAgenda: call.callAgenda || "",
      callResult: call.callResult || "",
      notes: call.notes || "",
      description: call.description || "",
    });
    setIsEditing(false);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Call Information</h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                color="primary"
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Call Owner ID (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Owner ID
          </label>
          <TextField
            fullWidth
            value={call.callOwner || ""}
            disabled
            variant="outlined"
            size="small"
          />
        </div>

        {/* Company ID (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company ID
          </label>
          <TextField
            fullWidth
            value={call.companyId || ""}
            disabled
            variant="outlined"
            size="small"
          />
        </div>

        {/* Lead ID (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead ID
          </label>
          <TextField
            fullWidth
            value={call.leadId || ""}
            disabled
            variant="outlined"
            size="small"
          />
        </div>

        {/* Call Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Type
          </label>
          <TextField
            select
            fullWidth
            value={formData.callType}
            onChange={(e) => handleInputChange("callType", e.target.value)}
            disabled={!isEditing}
            variant="outlined"
            size="small"
          >
            <MenuItem value="inbound">Inbound</MenuItem>
            <MenuItem value="outbound">Outbound</MenuItem>
          </TextField>
        </div>

        {/* Outgoing Call Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outgoing Call Status
          </label>
          <TextField
            select
            fullWidth
            value={formData.outgoingCallStatus}
            onChange={(e) => handleInputChange("outgoingCallStatus", e.target.value)}
            disabled={!isEditing}
            variant="outlined"
            size="small"
          >
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="missed">Missed</MenuItem>
            <MenuItem value="cancel">Cancel</MenuItem>
          </TextField>
        </div>

        {/* Call Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Start Time
          </label>
          {isEditing ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                value={formData.callStartTime ? new Date(formData.callStartTime) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    handleInputChange("callStartTime", newValue.toISOString());
                  }
                }}
                sx={{ width: "100%" }}
                slotProps={{
                  textField: {
                    size: "small",
                    variant: "outlined",
                  },
                }}
              />
            </LocalizationProvider>
          ) : (
            <TextField
              fullWidth
              value={formatDateTime(formData.callStartTime)}
              disabled
              variant="outlined"
              size="small"
            />
          )}
        </div>

        {/* Created At (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Created At
          </label>
          <TextField
            fullWidth
            value={formatDateTime(call.createdAt)}
            disabled
            variant="outlined"
            size="small"
          />
        </div>

        {/* Updated At (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Updated At
          </label>
          <TextField
            fullWidth
            value={formatDateTime(call.updatedAt)}
            disabled
            variant="outlined"
            size="small"
          />
        </div>
      </div>

      {/* Full-width fields */}
      <div className="mt-6 space-y-6">
        {/* Call Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Purpose
          </label>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={formData.callPurpose}
            onChange={(e) => handleInputChange("callPurpose", e.target.value)}
            disabled={!isEditing}
            variant="outlined"
            placeholder="Enter the purpose of this call..."
          />
        </div>

        {/* Call Agenda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Agenda
          </label>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={formData.callAgenda}
            onChange={(e) => handleInputChange("callAgenda", e.target.value)}
            disabled={!isEditing}
            variant="outlined"
            placeholder="Enter the agenda for this call..."
          />
        </div>

        {/* Call Result */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Result
          </label>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={formData.callResult}
            onChange={(e) => handleInputChange("callResult", e.target.value)}
            disabled={!isEditing}
            variant="outlined"
            placeholder="Enter the result of this call..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            disabled={!isEditing}
            variant="outlined"
            placeholder="Enter additional notes..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={!isEditing}
            variant="outlined"
            placeholder="Enter a description..."
          />
        </div>
      </div>
    </div>
  );
};

export default CallInfo;
