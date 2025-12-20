import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiUpload, FiX, FiFile, FiDownload } from "react-icons/fi";
import { toast } from "sonner";

type AttachmentManagerProps = {
  purchaseOrderId?: string;
  existingAttachments?: string[];
  onAdd?: (file: File) => Promise<void>;
  onRemove?: (index: number, url: string) => Promise<void>; // ✅ Added url parameter
  // For create mode
  localAttachments?: File[];
  onLocalAdd?: (file: File) => void;
  onLocalRemove?: (index: number) => void;
  mode?: "create" | "edit";
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  isLoading?: boolean;
};

const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  purchaseOrderId,
  existingAttachments = [],
  onAdd,
  onRemove,
  localAttachments = [],
  onLocalAdd,
  onLocalRemove,
  mode = "edit",
  maxFileSize = 10, // 10MB default
  allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  isLoading = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const getFileName = (url: string) => {
    try {
      const parts = url.split("/");
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return url;
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return "File type not supported. Please upload PDF, images, or Office documents.";
    }

    // Check file size
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      e.target.value = ""; // Reset input
      return;
    }

    // If in create mode, just add to local state
    if (mode === "create" && onLocalAdd) {
      onLocalAdd(file);
      e.target.value = ""; // Reset input for next file
      return;
    }

    // If in edit mode and purchaseOrderId exists, upload immediately
    if (mode === "edit" && purchaseOrderId && onAdd) {
      try {
        setUploading(true);
        await onAdd(file);
        e.target.value = ""; // Reset input
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveExisting = async (index: number, url: string) => {
    if (!onRemove || !purchaseOrderId) return;

    if (window.confirm("Are you sure you want to remove this attachment?")) {
      try {
        await onRemove(index, url);
      } catch (error) {
        console.error("Remove failed:", error);
      }
    }
  };

  const handleRemoveLocal = (index: number) => {
    if (onLocalRemove) {
      onLocalRemove(index);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Attachments
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileSelect}
            disabled={uploading || isLoading}
            className="flex-1"
            accept={allowedTypes.join(",")}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || isLoading}
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          >
            <FiUpload className="mr-2" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Max file size: {maxFileSize}MB. Supported: PDF, Images, Office documents
        </p>
      </div>

      {/* Existing attachments (from server) */}
      {existingAttachments.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-gray-700">
            Uploaded Files ({existingAttachments.length})
          </h4>
          <div className="space-y-2">
            {existingAttachments.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiFile className="text-blue-500 flex-shrink-0" size={20} />
                  <span className="text-sm text-gray-700 truncate">
                    {getFileName(url)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(url, "_blank")}
                    title="Download"
                  >
                    <FiDownload size={16} />
                  </Button>
                  {mode === "edit" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExisting(index, url)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Remove"
                      disabled={isLoading}
                    >
                      <FiX size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local attachments (not yet uploaded) */}
      {localAttachments.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-gray-700">
            Files to Upload ({localAttachments.length})
          </h4>
          <div className="space-y-2">
            {localAttachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiFile className="text-blue-500 flex-shrink-0" size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLocal(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Remove"
                >
                  <FiX size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentManager;
