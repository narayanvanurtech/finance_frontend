"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTemplateStore, EmailTemplate } from "@/stores/salesCrmStore/useTemplateStore";
import { Pencil, Trash2 } from "lucide-react";
// import ConfirmationDialog from "@/components/ConfirmationDialog";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";

export default function EmailTemplatesPage() {
  const { templates, fetchTemplates, deleteTemplate } = useTemplateStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

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
    } catch (err) {
      setError("Failed to delete template.");
      toast.error("Failed to delete template.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Link href="/settings/email/add">
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-indigo-600 transition-colors">
            Add New Template
          </button>
        </Link>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-white shadow rounded-lg">
          Loading templates...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 bg-white shadow rounded-lg">
          {error}
        </div>
      ) : templates.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white shadow rounded-lg">
          No templates found. Click "Add New Template" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow border border-gray-100"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle
                    className="text-lg font-semibold text-gray-800 truncate"
                    title={template.name}
                  >
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Last updated: {template.updatedAt}
                  </CardDescription>
                </div>
                <CardAction className="flex gap-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm p-2 rounded-full hover:bg-indigo-50 transition-colors"
                    title="Preview"
                    aria-label="Preview"
                    onClick={() => {
                      setPreviewTemplate(template);
                      setPreviewOpen(true);
                    }}
                  >
                    Preview
                  </button>
                  <Link href={`/settings/email/edit?id=${template.id}`}>
                    <button
                      className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm p-2 rounded-full hover:bg-indigo-50 transition-colors"
                      title="Edit"
                      aria-label="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-900 font-semibold text-sm p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                    onClick={() => {
                      setTemplateToDelete(template.id);
                      setShowConfirm(true);
                    }}
                    disabled={deletingId === template.id}
                    title="Delete"
                    aria-label="Delete"
                  >
                    {deletingId === template.id ? (
                      <span className="animate-spin">
                        <Trash2 size={18} />
                      </span>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </CardAction>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Subject:{" "}
                  <span className="font-normal text-gray-600">
                    {template.subject}
                  </span>
                </div>
                <div className="relative bg-gray-50 border rounded-md p-3 min-h-[60px] max-h-28 overflow-hidden">
                  {/* Show only a short snippet of the template content, plain text, with fade-out if long */}
                  <div className="text-gray-700 text-sm line-clamp-4">
                    {(() => {
                      // Strip HTML tags and decode entities for a safe plain-text preview
                      const tmp = document.createElement("div");
                      tmp.innerHTML = template.html || "";
                      const text = tmp.textContent || tmp.innerText || "";
                      return text.length > 200
                        ? text.slice(0, 200) + "…"
                        : text;
                    })()}
                  </div>
                  {template.html &&
                    template.html.replace(/<[^>]+>/g, "").length > 200 && (
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent dividers>
          {previewTemplate && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 max-w-2xl mx-auto">
              <div className="mb-4">
                <div className="text-lg font-bold text-gray-800">
                  {previewTemplate.name}
                </div>
                <div className="text-sm text-gray-600">
                  Subject: {previewTemplate.subject}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Last updated: {previewTemplate.updatedAt}
                </div>
              </div>
              <div
                className="prose max-w-none min-h-[200px]"
                style={{ background: "#f9fafb", borderRadius: 8, padding: 24 }}
                dangerouslySetInnerHTML={{
                  __html: previewTemplate?.html || "",
                }}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            onClick={() => setPreviewOpen(false)}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
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
