"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  useTemplateStore,
  EmailTemplate,
} from "@/stores/salesCrmStore/useTemplateStore";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  Mail,
  Calendar,
  Search,
  Filter,
  Clock,
} from "lucide-react";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  useAuthStore,
  User as UserType,
} from "@/stores/salesCrmStore/useAuthStore";

export default function EmailTemplatesPage() {
  const { templates, fetchTemplates, deleteTemplate } = useTemplateStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const user = useAuthStore((state) => state.user) as UserType | null;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTemplates()
      .catch((err) => setError("Failed to load templates."))
      .finally(() => setLoading(false));
  }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteTemplate(id);
      toast.success("Template deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting template:", err);
      const errorMessage = err.message || "Failed to delete template.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Email Templates
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage and organize your email templates
                </p>
              </div>
            </div>
            <Link href="/sales-crm/settings/email/add">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-900 text-white px-6 py-3 rounded-lg font-semibold shadow-lg cursor-pointer ">
                <Plus className="w-5 h-5" />
                Add New Template
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl  border border-zinc-300 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  List
                </button>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                {filteredTemplates.length} template
                {filteredTemplates.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bg-white rounded-2xl  border border-zinc-300 p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading templates...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <p className="text-red-700 text-lg font-medium">{error}</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No templates found" : "No templates yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm
                ? `No templates match "${searchTerm}". Try adjusting your search.`
                : "Get started by creating your first email template."}
            </p>
            {!searchTerm && (
              <Link href="/sales-crm/settings/email/add">
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-5 h-5" />
                  Create First Template
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredTemplates.map((template) =>
              viewMode === "grid" ? (
                // Grid View Card
                <div
                  key={template.id}
                  className="group bg-white rounded-2xl shadow-sm border border-zinc-300 hover:shadow-lg hover:border-indigo-200 "
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors"
                          title={template.name}
                        >
                          {template.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(template.updatedAt ?? "")}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => {
                            setPreviewTemplate(template);
                            setPreviewOpen(true);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/sales-crm/settings/email/edit?id=${template.templateId}`}
                        >
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setTemplateToDelete(template.id);
                            setShowConfirm(true);
                          }}
                          disabled={deletingId === template.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete"
                        >
                          {deletingId === template.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin " />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Subject:
                      </div>
                      <div
                        className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 truncate"
                        title={template.subject}
                      >
                        {template.subject}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 min-h-[100px] overflow-hidden">
                        <div className="text-gray-700 text-sm line-clamp-4 leading-relaxed">
                          {(() => {
                            const text = stripHtml(template.html || "");
                            return text.length > 150
                              ? text.slice(0, 150) + "…"
                              : text || "No content";
                          })()}
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // List View Card
                <div
                  key={template.id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              Subject: {template.subject}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Updated {formatDate(template.updatedAt ?? "")}
                              </div>
                            </div>
                          </div>
                          <div className="hidden md:block flex-shrink-0 max-w-xs">
                            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 truncate">
                              {(() => {
                                const text = stripHtml(template.html || "");
                                return text.length > 100
                                  ? text.slice(0, 100) + "…"
                                  : text || "No content";
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => {
                            setPreviewTemplate(template);
                            setPreviewOpen(true);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <Link
                          href={`/sales-crm/settings/email/edit?id=${template.id}`}
                        >
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setTemplateToDelete(template.id);
                            setShowConfirm(true);
                          }}
                          disabled={deletingId === template.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === template.id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className:
            "rounded-3xl shadow-2xl border border-gray-100 overflow-hidden",
        }}
      >
        {/* Custom Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded"></div>
          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                    Template Preview
                  </h2>
                  {previewTemplate && (
                    <p className="text-zinc-100 text-sm mt-1 font-medium">
                      {previewTemplate.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogContent className="p-0 max-h-[70vh] overflow-auto">
          {previewTemplate && (
            <div className="p-3">
              {/* Email Mock Browser Frame */}
              <div className="border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                {/* Mock Browser Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="ml-4 flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      Email Client Preview
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(previewTemplate.updatedAt ?? "")}
                    </span>
                  </div>
                </div>

                {/* Email Header Info */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-200 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {previewTemplate.name.charAt(0).toUpperCase()}
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
                        <div className="text-sm text-gray-500 mb-1">
                          Subject
                        </div>
                        <div className="font-semibold text-gray-900 text-lg">
                          {previewTemplate.subject}
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
                        previewTemplate.html ||
                        `
                          <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                            <p style="margin: 0; font-style: italic;">No content available for this template</p>
                          </div>
                        `,
                    }}
                  />

                  {/* Email Footer Simulation */}
                  <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400 text-center">
                    This is a preview of your email template • Actual emails may
                    appear differently depending on the recipient's email client
                  </div>
                </div>
              </div>

            </div>
          )}
        </DialogContent>

        {/* Custom Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Preview Mode Active
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-colors flex items-center gap-2 group cursor-pointer"
              onClick={() => setPreviewOpen(false)}
            >
              <svg
                className="w-4 h-4 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Close
            </button>
          </div>
        </div>
      </Dialog>

      {/* Preview Modal */}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        show={showConfirm}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        onConfirm={async () => {
          if (templateToDelete) {
            await handleDelete(templateToDelete);
          }
          setShowConfirm(false);
          setTemplateToDelete(null);
        }}
        onCancel={() => {
          setShowConfirm(false);
          setTemplateToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        disableConfirm={deletingId === templateToDelete}
        disableCancel={deletingId === templateToDelete}
      />
    </div>
  );
}
