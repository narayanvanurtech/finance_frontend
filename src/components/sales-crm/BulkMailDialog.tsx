import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useTemplateStore } from "@/stores/salesCrmStore/useTemplateStore";
import { ChevronDown } from "lucide-react";

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-100 rounded-md animate-pulse"></div>
  ),
});

// Import is handled by dynamic import, no need for CSS import here

interface BulkMailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, message: string) => Promise<void>;
  selectedCount: number;
}

export default function BulkMailDialog({
  isOpen,
  onClose,
  onSend,
  selectedCount,
}: BulkMailDialogProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showTemplates, setShowTemplates] = useState(false);

  const { templates, fetchTemplates } = useTemplateStore();
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "align",
    "link",
  ];

  // Function to check if template contains tokens/variables
  const hasTokens = (content: string): boolean => {
    // Check for common token patterns like {{variable}}, ${variable}, etc.
    const tokenPatterns = [
      /\{\{[^}]+\}\}/g, // {{variable}}
      /\$\{[^}]+\}/g, // ${variable}
      /\{\w+\}/g, // {variable}
      /\[\[[^\]]+\]\]/g, // [[variable]]
      /\{\%.*?\%\}/g, // {% variable %}
    ];

    return tokenPatterns.some((pattern) => pattern.test(content));
  };

  // Filter templates that don't contain tokens
  const staticTemplates = templates.filter(
    (template) =>
      !hasTokens(template.subject || "") && !hasTokens(template.html || "")
  );

  // Load templates when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchTemplates().catch(console.error);
    }
  }, [isOpen, fetchTemplates]);

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

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject || "");
      setMessage(template.html || "");
      setSelectedTemplate(templateId);
      setShowTemplates(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in both subject and message");
      return;
    }

    try {
      setSending(true);
      setError(null);
      await onSend(subject.trim(), message.trim());
      onClose();
      // Reset form
      setSubject("");
      setMessage("");
      setSelectedTemplate("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send bulk email"
      );
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setSubject("");
      setMessage("");
      setError(null);
      setSelectedTemplate("");
      setShowTemplates(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Send Bulk Email to {selectedCount}{" "}
            {selectedCount === 1 ? "Lead" : "Leads"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            This email will be sent to all selected leads with valid email
            addresses.
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Template (Optional)
              </label>
              <div className="relative" ref={templateDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full p-3 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex items-center justify-between"
                  disabled={sending}
                >
                  <span>
                    {selectedTemplate
                      ? templates.find((t) => t.id === selectedTemplate)
                          ?.name || "Select a template"
                      : "Select a template"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      showTemplates ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showTemplates && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                    {staticTemplates.length > 0 ? (
                      staticTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleTemplateSelect(template.id)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors duration-150"
                        >
                          <div className="font-medium text-gray-900">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {template.subject}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500">
                        No static templates available (templates with variables
                        are excluded)
                      </div>
                    )}
                  </div>
                )}
              </div>
              {staticTemplates.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Only templates without variables are shown for bulk emails
                </p>
              )}
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
                disabled={sending}
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
                <ReactQuill
                  theme="snow"
                  value={message}
                  onChange={setMessage}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter your email message..."
                  readOnly={sending}
                  style={{ maxHeight: "600px", overflow: "scroll" }}
                />
              </div>
            </div>

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
                      • Only leads with valid email addresses will receive the
                      email
                    </li>
                    <li>• This action cannot be undone</li>
                    <li>
                      • Consider using a professional tone and clear subject
                      line
                    </li>
                    <li>
                      • You can format your message using the rich text editor
                      above
                    </li>
                    <li>
                      • Templates with variables are excluded for bulk emails
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
            disabled={sending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!subject.trim() || !message.trim() || sending}
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer ${
              sending ? "bg-indigo-400 hover:bg-indigo-400" : ""
            }`}
          >
            {sending ? (
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
}
