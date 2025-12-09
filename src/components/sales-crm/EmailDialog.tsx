import React, { useState, useEffect, useRef } from "react";
import {
  useTemplateStore,
  EmailTemplate,
} from "@/stores/salesCrmStore/useTemplateStore";
import EmailEditor from "./EmailEditor";
import { ChevronDown } from "lucide-react";
import { Lead } from "@/api/leadsApi";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, message: string) => void;
  recipientEmail: string;
  recipientName: string;
  lead: Partial<Lead> | null;
}

function fillTemplate(template: string, lead: Record<string, any> | null) {
  if (!lead) return template;
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    // Support nested keys like address.full
    const value = key
      .split(".")
      .reduce((obj: any, k: string) => obj?.[k], lead);
    return value ?? "";
  });
}

const EmailDialog: React.FC<EmailDialogProps> = ({
  isOpen,
  onClose,
  onSend,
  recipientEmail,
  recipientName,
  lead,
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>("write-from-scratch");
  const [hasPendingTokens, setHasPendingTokens] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const { templates, fetchTemplates } = useTemplateStore();
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTemplates(false);
      }
    };

    if (showTemplates) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTemplates]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplates(false);

    if (templateId && templateId !== "write-from-scratch") {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setMessage(template.html || "");
      }
    } else {
      setSubject("");
      setMessage("");
      setHasPendingTokens(false);
    }
  };

  const handleTokenValidationChange = (hasPendingTokens: boolean) => {
    setHasPendingTokens(hasPendingTokens);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setIsSending(true);
    try {
      console.log("Sending email with subject:", subject);
      console.log("Sending email with message:", message);
      const filledSubject = fillTemplate(subject, lead);
      const filledMessage = fillTemplate(message, lead);
      await onSend(filledSubject, filledMessage);
      setSubject("");
      setMessage("");
      setSelectedTemplate("write-from-scratch");
      setHasPendingTokens(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setSubject("");
      setMessage("");
      setSelectedTemplate("write-from-scratch");
      setHasPendingTokens(false);
      setShowTemplates(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-scroll">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800">Send Email</h2>
          <p className="text-sm text-gray-600 mt-1">
            To: {recipientName} ({recipientEmail})
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Template (Optional)
              </label>
              <div className="relative" ref={templateDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full p-3 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex items-center justify-between"
                  disabled={isSending}
                >
                  <span>
                    {selectedTemplate === "write-from-scratch"
                      ? "Write from scratch"
                      : templates.find((t) => t.id === selectedTemplate)
                          ?.name || "Select a template"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      showTemplates ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showTemplates && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                    <button
                      type="button"
                      onClick={() => handleTemplateChange("write-from-scratch")}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-200 transition-colors duration-150"
                    >
                      <div className="font-medium text-gray-900 italic">
                        Write from scratch
                      </div>
                    </button>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateChange(template.id)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors duration-150"
                      >
                        <div className="font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {template.subject}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                placeholder="Enter email subject..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message *
              </label>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <EmailEditor
                  value={message}
                  onChange={setMessage}
                  placeholder="Write your email message..."
                  disabled={isSending}
                  onTokenValidationChange={handleTokenValidationChange}
                  lead={lead}
                />
              </div>
            </div>

            {hasPendingTokens && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                Please fill in all template tokens before sending
              </div>
            )}

            <div className="bg-indigo-50 p-3 rounded-md">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-indigo-400 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-indigo-700">
                  <p className="font-medium">Important:</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      • Make sure all template tokens are filled before sending
                    </li>
                    <li>
                      • You can format your message using the rich text editor
                    </li>
                    <li>
                      • Use templates to save time on common email formats
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={
              !subject.trim() ||
              !message.trim() ||
              hasPendingTokens ||
              isSending
            }
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer ${
              isSending ? "bg-indigo-400 hover:bg-indigo-400" : ""
            }`}
          >
            {isSending ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Email"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailDialog;
