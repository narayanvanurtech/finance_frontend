"use client"
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTemplateStore } from "@/stores/salesCrmStore/useTemplateStore";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import DynamicQuillEditor from "@/components/sales-crm/DynamicQuillEditor";
// import DynamicQuillEditor from "@/components/DynamicQuillEditor";

export default function EditEmailTemplatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const templates = useTemplateStore((state) => state.templates);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);
  const template = templates.find((t) => t.id === id);

  // View/Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [templateName, setTemplateName] = useState(template?.name || "");
  const [templateSubject, setTemplateSubject] = useState(template?.subject || "");
  const [templateContent, setTemplateContent] = useState(template?.html || "");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const isNavigating = useRef(false);

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setTemplateSubject(template.subject);
      setTemplateContent(template.html || "");
    }
  }, [template]);

  // Track dirty state
  useEffect(() => {
    setDirty(
      (templateName !== (template?.name || "")) ||
      (templateSubject !== (template?.subject || "")) ||
      (templateContent !== (template?.html || ""))
    );
  }, [templateName, templateSubject, templateContent, template]);

  // Warn on browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && dirty && !isNavigating.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setError("Template name is required.");
      return;
    }
    if (!templateSubject.trim()) {
      setError("Template subject is required.");
      return;
    }
    setError("");
    try {
      await updateTemplate(id, {
        name: templateName,
        subject: templateSubject,
        html: templateContent,
      });
      setDirty(false);
      toast.success("Template updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update template.");
    }
  };

  const handleCancel = () => {
    if (dirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to leave edit mode?")) {
        return;
      }
    }
    // Reset to original values
    setTemplateName(template?.name || "");
    setTemplateSubject(template?.subject || "");
    setTemplateContent(template?.html || "");
    setIsEditing(false);
    setError("");
    setDirty(false);
  };

  if (!template) {
    return <div className="p-8 text-center text-gray-500">Template not found.</div>;
  }

  return (
    <div className="min-h-[90vh] flex flex-col justify-start items-center bg-gray-50 py-10 px-2">
      <div className="w-full max-w-2xl mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 transition-colors shadow-sm mb-2"
          onClick={() => router.back()}
          type="button"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Template</h1>
          {isEditing ? (
            <>
              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor="templateName" className="text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  id="templateName"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor="templateSubject" className="text-sm font-medium text-gray-700 mb-1">Template Subject</label>
                <input
                  id="templateSubject"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
                  placeholder="Enter template subject"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                />
                {error && <span className="text-red-500 text-sm">{error}</span>}
              </div>
              <hr className="my-2 border-gray-200" />
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1">Template Content</label>
                <div>
                  <DynamicQuillEditor
                    value={templateContent}
                    onChange={setTemplateContent}
                    placeholder="Start typing your email template..."
                    allowedTokens={[
                      "firstName",
                      "lastName",
                      "fullName",
                      "email",
                      "company",
                      "phone",
                      "website",
                      "title",
                      "industry",
                      "leadSource",
                      "leadStatus",
                      "priority",
                      "status",
                      "address.full",
                      "ownerName"
                    ]}
                  />
                </div>
              </div>
              <div className="flex flex-row gap-4 mt-6 sm:flex-col sm:gap-2">
                <button
                  className="bg-indigo-500 text-white px-6 py-2 rounded-md font-semibold shadow-sm transition-colors duration-200 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 sm:w-full"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold shadow-sm transition-colors duration-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 flex-1 sm:w-full"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold text-gray-800">{template.name}</div>
                <div className="text-md text-gray-700">Subject: {template.subject}</div>
                <div className="text-xs text-gray-500">Last updated: {template.updatedAt}</div>
              </div>
              <hr className="my-2 border-gray-200" />
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: template.html || "" }} />
              <div className="flex flex-row gap-4 mt-6 sm:flex-col sm:gap-2">
                <button
                  className="bg-indigo-500 text-white px-6 py-2 rounded-md font-semibold shadow-sm transition-colors duration-200 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 sm:w-full"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 