"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTemplateStore } from "@/stores/salesCrmStore/useTemplateStore";
import { toast } from "sonner";
import { ArrowLeft, Mail, Edit3, Save, X } from "lucide-react";
import DynamicQuillEditor from "@/components/sales-crm/DynamicQuillEditor";
import {
  useAuthStore,
  User as UserType,
} from "@/stores/salesCrmStore/useAuthStore";

export default function EditEmailTemplatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const { templates, updateTemplate, getTemplateById } = useTemplateStore();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // View/Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const isNavigating = useRef(false);
  const user = useAuthStore((state) => state.user) as UserType | null;

  // Fetch template directly using the getTemplateById API
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Using the templateId from the URL to fetch the template
        const templateData = await getTemplateById(id);
        setTemplate(templateData);
        setTemplateName(templateData.name);
        setTemplateSubject(templateData.subject);
        setTemplateContent(templateData.html || "");
      } catch (error: any) {
        console.error("Error fetching template:", error);
        setError(
          `Failed to load template: ${error.message || "Unknown error"}`
        );
        toast.error(
          `Failed to load template: ${error.message || "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, getTemplateById]);

  // Track dirty state
  useEffect(() => {
    setDirty(
      templateName !== (template?.name || "") ||
        templateSubject !== (template?.subject || "") ||
        templateContent !== (template?.html || "")
    );
  }, [templateName, templateSubject, templateContent, template]);

  // Warn on browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && dirty && !isNavigating.current) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!template || !template.templateId) {
      setError("Cannot update template: missing template ID");
      return;
    }

    try {
      // Use the correct templateId for the update operation
      await updateTemplate(template.id, {
        name: templateName,
        subject: templateSubject,
        html: templateContent,
      });

      toast.success("Template updated successfully");
      setDirty(false);
      setIsEditing(false);

      // Update the local template object
      setTemplate({
        ...template,
        name: templateName,
        subject: templateSubject,
        html: templateContent,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error updating template:", error);
      // Show more detailed error if available
      const errorMessage = error.message || "Failed to update template";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    if (dirty) {
      if (
        !window.confirm(
          "You have unsaved changes. Are you sure you want to leave edit mode?"
        )
      ) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* macOS Window Header */}
          <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-b border-zinc-200/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <Mail size={16} />
                <span>Mail Template</span>
              </div>
              <div className="w-16"></div>
            </div>
          </div>

          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-blue-600 text-lg font-medium">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Loading template...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* macOS Window Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-zinc-200/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <Mail size={16} />
                <span>Mail Template</span>
              </div>
              <div className="w-16"></div>
            </div>
          </div>

          <div className="p-12 text-center">
            <div className="text-red-500 mb-6 text-lg">{error}</div>
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => router.push("/sales-crm/settings/email")}
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* macOS Window Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-zinc-200/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <Mail size={16} />
                <span>Mail Template</span>
              </div>
              <div className="w-16"></div>
            </div>
          </div>

          <div className="p-12 text-center">
            <div className="text-gray-500 mb-6 text-lg">
              Template not found.
            </div>
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => router.push("/sales-crm/settings/email")}
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full py-8 px-4">
      {/* Main Mail Window */}
      <div className="w-full max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-xl border border-zinc-300 overflow-hidden">
        {/* macOS Window Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-zinc-200/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded-full hover:bg-red-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full hover:bg-green-500 transition-colors cursor-pointer"></div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Mail size={16} />
              <span>Email Template Editor</span>
              {dirty && (
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
              )}
            </div>
            <div className="w-16"></div>
          </div>
        </div>

        {/* Mail Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-zinc-200/80 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {isEditing ? "Edit Template" : "Template Preview"}
              </h1>
              <p className="text-gray-600">
                {isEditing
                  ? "Make changes to your email template"
                  : "Review your email template"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                    onClick={handleSave}
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                    onClick={handleCancel}
                    type="button"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 cursor-pointer"
                  onClick={handleEdit}
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mail Content */}
        <div className="p-8">
          {isEditing ? (
            <div className="space-y-6">
              {/* Template Name */}
              <div className="space-y-2">
                <label
                  htmlFor="templateName"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Template Name
                </label>
                <input
                  id="templateName"
                  type="text"
                  className="w-full px-4 py-3 bg-white/70 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              {/* Template Subject */}
              <div className="space-y-2">
                <label
                  htmlFor="templateSubject"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Subject Line
                </label>
                <input
                  id="templateSubject"
                  type="text"
                  className="w-full px-4 py-3 bg-white/70 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter email subject"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                />
                {error && (
                  <span className="text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-lg">
                    {error}
                  </span>
                )}
              </div>

              {/* Template Content */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Content
                </label>
                <div className="bg-white px-4 py-3 rounded-xl border border-grazincy-300 overflow-hidden shadow-sm">
                  <DynamicQuillEditor
                    value={templateContent}
                    onChange={setTemplateContent}
                    placeholder="Start composing your email template..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Template Info */}
              {/* Email Header Info */}
              <div className="py-4 border-b border-zinc-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full border-2 border-indigo-200 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {template.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user?.name || "User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user?.email || "No email"}
                        </div>
                      </div>
                    </div>
                    <div className="ml-13">
                      <div className="text-sm text-gray-500 mb-1">Subject</div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {template.subject}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                      Template
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Content Area */}
              <div className="relative">
                <div
                  className="prose prose-sm sm:prose-base max-w-none px-6 py-8 min-h-auto"
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.6",
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      template.html ||
                      `
                          <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                            <p style="margin: 0; font-style: italic;">No content available for this template</p>
                          </div>
                        `,
                  }}
                />

                {/* Email Footer Simulation */}
                <div className="px-6 py-4 border-t border-zinc-200 text-xs text-gray-400 text-center">
                  This is a preview of your email template • Actual emails may
                  appear differently depending on the recipient's email client
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
