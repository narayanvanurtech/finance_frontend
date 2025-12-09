import React, { useState } from 'react';

interface CallFormComponentProps {
  onSubmit: (data: CallFormData) => void;
}

export interface CallFormData {
  callType: 'inbound' | 'outbound';
  outgoingCallStatus: 'scheduled' | 'completed' | 'cancelled';
  callStartTime: string;
  callPurpose: string;
  callAgenda: string;
  subject: string;
  reminder: boolean;
  notes: string;
}

const CallFormComponent: React.FC<CallFormComponentProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CallFormData>({
    callType: 'outbound',
    outgoingCallStatus: 'scheduled',
    callStartTime: '',
    callPurpose: '',
    callAgenda: '',
    subject: '',
    reminder: true,
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Call Type</label>
          <select
            name="callType"
            value={formData.callType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="outbound">Outbound</option>
            <option value="inbound">Inbound</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="outgoingCallStatus"
            value={formData.outgoingCallStatus}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter call subject"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Call Start Time</label>
          <input
            type="datetime-local"
            name="callStartTime"
            value={formData.callStartTime}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Call Purpose</label>
          <input
            type="text"
            name="callPurpose"
            value={formData.callPurpose}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the purpose of the call"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Call Agenda</label>
          <textarea
            name="callAgenda"
            value={formData.callAgenda}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the agenda for the call"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional notes"
          />
        </div>

        <div className="col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="reminder"
              checked={formData.reminder}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Set Reminder
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
      >
        Schedule Call
      </button>
    </form>
  );
};

export default CallFormComponent;
