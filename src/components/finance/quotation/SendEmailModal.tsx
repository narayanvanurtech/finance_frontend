import React, { useState } from "react";

interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  to?: string;
  cc?: string;
  subject?: string;
  message?: string;
  onSend: (data: {
    to: string;
    cc: string;
    subject: string;
    message: string;
  }) => void;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({
  open,
  onClose,
  to = "",
  cc = "",
  subject = "",
  message = "",
  onSend,
}) => {
  const [toEmail, setToEmail] = useState(to);
  const [ccEmail, setCcEmail] = useState(cc);
  const [emailSubject, setEmailSubject] = useState(subject);
  const [emailMessage, setEmailMessage] = useState(message);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await onSend({
      to: toEmail,
      cc: ccEmail,
      subject: emailSubject,
      message: emailMessage,
    });
    setSending(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="text-xl font-semibold mb-4">Send Quotation Email</div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Send To</label>
            <input
              type="email"
              className="w-full border rounded px-2 py-1"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="Recipient email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cc</label>
            <input
              type="email"
              className="w-full border rounded px-2 py-1"
              value={ccEmail}
              onChange={(e) => setCcEmail(e.target.value)}
              placeholder="CC email (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[120px]"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Write your message here..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSend}
            disabled={sending || !toEmail || !emailSubject}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendEmailModal;
