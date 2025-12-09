import React, { useState } from "react";

interface MeetingFormComponentProps {
  onSubmit: (data: MeetingFormData) => void;
}

export interface MeetingFormData {
  meetingVenue: string;
  location: string;
  allDay: boolean;
  fromDateTime: string;
  toDateTime: string;
  host: string;
  title: string;
  participants: string[];
}

const MeetingFormComponent: React.FC<MeetingFormComponentProps> = ({
  onSubmit,
}) => {
  const [formData, setFormData] = useState<MeetingFormData>({
    meetingVenue: "",
    location: "",
    allDay: false,
    fromDateTime: "",
    toDateTime: "",
    host: "",
    title: "",
    participants: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "participants") {
      const emailList = value
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email !== "");
      setFormData((prev) => ({
        ...prev,
        participants: emailList,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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
          <label className="block text-sm font-medium text-gray-700">
            Meeting Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter meeting title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Meeting Venue
          </label>
          <select
            name="meetingVenue"
            value={formData.meetingVenue}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a venue</option>
            <option value="In-office">In-office</option>
            <option value="Client location">Client location</option>
            <option value="Online">Online</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter specific location e.g., ABC Corp Office"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Date & Time
          </label>
          <input
            type="datetime-local"
            name="fromDateTime"
            value={formData.fromDateTime}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            To Date & Time
          </label>
          <input
            type="datetime-local"
            name="toDateTime"
            value={formData.toDateTime}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Host Email
          </label>
          <input
            type="email"
            name="host"
            value={formData.host}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter host email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Participants
          </label>
          <input
            type="text"
            name="participants"
            value={formData.participants.join(", ")}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter participant emails (comma separated)"
            required
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="allDay"
          checked={formData.allDay}
          onChange={handleInputChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-2 text-sm font-medium text-gray-700">
          All Day Meeting
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium cursor-pointer"
      >
        Create Meeting
      </button>
    </form>
  );
};

export default MeetingFormComponent;
