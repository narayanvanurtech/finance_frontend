"use client"
import React, { useState, useEffect, useRef } from "react";
import { useTemplateStore } from "@/stores/salesCrmStore/useTemplateStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DynamicQuillEditor from "@/components/sales-crm/DynamicQuillEditor";

export default function Page() {
  const [templateContent, setTemplateContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const router = useRouter();
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const isNavigating = useRef(false);

  // Track dirty state
  useEffect(() => {
    setDirty(
      templateName.trim().length > 0 || templateSubject.trim().length > 0 || templateContent.trim().length > 0
    );
  }, [templateName, templateSubject, templateContent]);

  // Warn on browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty && !isNavigating.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  // Warn on in-app navigation
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (dirty && !isNavigating.current) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
          throw "Route change aborted.";
        } else {
          isNavigating.current = true;
        }
      }
    };
    // Next.js router events are not available in app dir, so we use beforeunload and handle navigation via button
    return () => {};
  }, [dirty]);

    const handleSave = async () => {
    if (!templateName || !templateSubject || !templateContent) {
      setError("All fields are required");
      toast.error("All fields are required");
      return;
    }

    try {
      await addTemplate({
        name: templateName,
        subject: templateSubject,
        html: templateContent,
        templateId: Date.now().toString() // Generate a unique ID for the template
      });
      toast.success("Template added successfully");
      isNavigating.current = true;
      router.push("/sales-crm/settings/email");
    } catch (error: any) {
      console.error("Error adding template:", error);
      // Show more detailed error if available
      const errorMessage = error.message || "Failed to add template";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    if (dirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        return;
      }
    }
    isNavigating.current = true;
    router.push("/sales-crm/settings/email");
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-start items-center bg-gray-50 py-10 px-2">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-8 md:p-8 sm:p-4 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Add Email Template</h1>
        <div className="flex flex-col gap-1">
          <label htmlFor="templateName" className="text-sm font-medium text-gray-700 mb-1">Template Name</label>
          <input
            id="templateName"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
            placeholder="Enter template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="templateSubject" className="text-sm font-medium text-gray-700 mb-1">Template Subject</label>
          <input
            id="templateSubject"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
            placeholder="Enter template subject"
            value={templateSubject}
            onChange={(e) => setTemplateSubject(e.target.value)}
          />
        </div>
        <hr className="my-2 border-gray-200" />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 mb-1">Template Content</label>
          <div>
            <DynamicQuillEditor
              value={templateContent}
              onChange={setTemplateContent}
              placeholder="Start typing your email template..."
            />
          </div>
        </div>
        <div className="flex flex-row gap-4 mt-6 sm:flex-col sm:gap-2">
          <button
            className="bg-indigo-500 text-white px-6 py-2 rounded-md font-semibold shadow-sm transition-colors duration-200 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 sm:w-full cursor-pointer"
            onClick={handleSave}
          >
            Save Template
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold shadow-sm transition-colors duration-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 flex-1 sm:w-full"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
