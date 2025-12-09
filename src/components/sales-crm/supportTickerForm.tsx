import React from "react";

interface SupportTicketFormProps {
  isLoading: boolean;
  formData: {
    subject: string;
    priority: string;
    category: string;
    description: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    subject: string;
    priority: string;
    category: string;
    description: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
}

const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ isLoading, formData, setFormData, onSubmit }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200">
      <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
        <h2 className="text-2xl font-bold text-gray-900">Create Support Ticket</h2>
        <p className="text-sm text-gray-600 mt-1">
          We typically respond within 24 hours on business days.
        </p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="relative">
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors hover:border-indigo-400"
                  required
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors hover:border-indigo-400"
                  required
                >
                  <option value="">Select category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Please provide detailed information about your issue"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[150px] resize-y"
              required
            />
          </div>
        </div>
        <div className="p-8 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 rounded-b-2xl">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-100"
          >
            {isLoading ? "Creating Ticket..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportTicketForm;
