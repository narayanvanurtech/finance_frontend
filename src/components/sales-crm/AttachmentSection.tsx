"use client";

import React, { useState } from "react";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { FormControl, InputLabel, Select, MenuItem, LinearProgress, IconButton, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";

interface Attachment {
  _id: string;
  url: string;
  fileName?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: string;
}

interface AttachmentSectionProps {
  attachments: Attachment[] | string[] | null;
  leadId: string;
}

type FileTypeFilter = "all" | "images" | "documents" | "videos" | "others";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const EXTENSIONS: Record<FileTypeFilter, string[]> = {
  images: ["jpg", "jpeg", "png", "gif", "bmp", "svg"],
  documents: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
  videos: ["mp4", "mov", "avi", "mkv", "webm"],
  others: [],
  all: [],
};

const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  attachments = [],
  leadId,
}) => {
  const [selectedType, setSelectedType] = useState<FileTypeFilter>("all");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [deletingAttachment, setDeletingAttachment] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { uploadFile, deleteAttachment } = useLeadsStore();

  // Helper function to normalize attachments
  const normalizeAttachments = (): Attachment[] => {
    if (!attachments) return [];
    
    return attachments.map((item, index) => {
      if (typeof item === 'string') {
        return {
          _id: `temp-${index}`, // Temporary ID for string-based attachments
          url: item,
          fileName: getFileName(item),
        };
      }
      return item;
    });
  };

  const normalizedAttachments = normalizeAttachments();

  const getFileTypeFromUrl = (url: string): FileTypeFilter => {
    const extension = url.split(".").pop()?.toLowerCase() || "";
    if (EXTENSIONS.images.includes(extension)) return "images";
    if (EXTENSIONS.documents.includes(extension)) return "documents";
    if (EXTENSIONS.videos.includes(extension)) return "videos";
    return "others";
  };

  const getFileIcon = (attachment: Attachment) => {
    const fileType = getFileTypeFromUrl(attachment.url);
    switch (fileType) {
      case "images":
        return <ImageIcon className="text-indigo-600" />;
      case "documents":
        return <DescriptionIcon className="text-indigo-600" />;
      default:
        return <InsertDriveFileIcon className="text-indigo-600" />;
    }
  };

  const getFileName = (url: string): string => {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split("/");
    return parts[parts.length - 1];
  };

  const getAttachmentName = (attachment: Attachment): string => {
    return attachment.fileName || attachment.originalName || getFileName(attachment.url);
  };

  const simulateUploadProgress = (fileName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setUploadProgress({ fileName, progress: 0, status: 'uploading' });
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev) return null;
          
          const newProgress = prev.progress + Math.random() * 15;
          
          if (newProgress >= 100) {
            clearInterval(interval);
            // Simulate potential error (10% chance)
            if (Math.random() < 0.1) {
              const errorProgress = { ...prev, progress: 100, status: 'error' as const, error: 'Upload failed' };
              setTimeout(() => {
                setUploadProgress(errorProgress);
                setTimeout(() => setUploadProgress(null), 3000);
                reject(new Error('Upload failed'));
              }, 500);
            } else {
              const completedProgress = { ...prev, progress: 100, status: 'completed' as const };
              setTimeout(() => {
                setUploadProgress(completedProgress);
                setTimeout(() => setUploadProgress(null), 2000);
                resolve();
              }, 500);
            }
            return prev;
          }
          
          return { ...prev, progress: newProgress };
        });
      }, 200);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      try {
        // Start progress simulation
        await simulateUploadProgress(file.name);
        
        // Actually upload the file
        await uploadFile(leadId, file);
        
        // Don't reload the page, the store will update automatically
        // window.location.reload();

      } catch (error) {
        console.error("Failed to upload file:", error);
        setUploadProgress(prev => prev ? { 
          ...prev, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : null);
        
        // Clear error after 3 seconds
        setTimeout(() => setUploadProgress(null), 3000);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    if (attachment._id.startsWith('temp-')) {
      console.warn('Cannot delete temporary attachment');
      return;
    }

    try {
      setDeletingAttachment(attachment._id);
      await deleteAttachment(leadId, attachment._id);
    } catch (error) {
      console.error("Failed to delete attachment:", error);
    } finally {
      setDeletingAttachment(null);
    }
  };

  const filteredFiles = normalizedAttachments.filter((attachment) =>
    selectedType === "all" ? true : getFileTypeFromUrl(attachment.url) === selectedType
  );

  const handleFileClick = (attachment: Attachment) => {
    window.open(attachment.url, "_blank");
  };

  const getProgressColor = () => {
    if (!uploadProgress) return "primary";
    switch (uploadProgress.status) {
      case 'completed': return "success";
      case 'error': return "error";
      default: return "primary";
    }
  };

  const getStatusIcon = () => {
    if (!uploadProgress) return null;
    switch (uploadProgress.status) {
      case 'uploading':
        return <CloudUploadIcon className="text-indigo-600 animate-pulse" fontSize="small" />;
      case 'completed':
        return <CheckCircleIcon className="text-green-500" fontSize="small" />;
      case 'error':
        return <ErrorIcon className="text-red-500" fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <InsertDriveFileIcon className="text-indigo-600" fontSize="small" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Attachments</h2>
        </div>
        <div className="flex items-center gap-4">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>File Type</InputLabel>
            <Select
              value={selectedType}
              label="File Type"
              onChange={(e) => setSelectedType(e.target.value as FileTypeFilter)}
            >
              <MenuItem value="all">All Files</MenuItem>
              <MenuItem value="images">Images</MenuItem>
              <MenuItem value="documents">Documents</MenuItem>
              <MenuItem value="videos">Videos</MenuItem>
              <MenuItem value="others">Others</MenuItem>
            </Select>
          </FormControl>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={!!uploadProgress}
          />
          <motion.button
            whileHover={{ scale: uploadProgress ? 1 : 1.02 }}
            whileTap={{ scale: uploadProgress ? 1 : 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={!!uploadProgress}
            className={`px-5 py-2.5 ${
              uploadProgress 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 cursor-pointer'
            } text-white rounded-sm transition-all shadow-sm flex items-center group`}
          >
            <AddIcon
              fontSize="small"
              className={`mr-2 ${uploadProgress ? '' : 'group-hover:rotate-90'} transition-transform`}
            />
            <span className="font-medium">
              {uploadProgress ? "Uploading..." : "Upload File"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Upload Progress Section */}
      {uploadProgress && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 bg-gray-50 rounded-lg border"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium text-gray-700 truncate">
                {uploadProgress.fileName}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {uploadProgress.status === 'error' ? 'Failed' : `${Math.round(uploadProgress.progress)}%`}
            </span>
          </div>
          
          <LinearProgress
            variant="determinate"
            value={uploadProgress.progress}
            color={getProgressColor()}
            className="mb-2"
            sx={{ height: 6, borderRadius: 3 }}
          />
          
          {uploadProgress.status === 'error' && uploadProgress.error && (
            <p className="text-sm text-red-600 mt-1">{uploadProgress.error}</p>
          )}
          
          {uploadProgress.status === 'completed' && (
            <p className="text-sm text-green-600 mt-1">Upload completed successfully!</p>
          )}
        </motion.div>
      )}

      <div className="mt-6 space-y-4">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((attachment, index) => (
            <motion.div
              key={attachment._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 group transition-colors"
            >
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => handleFileClick(attachment)}
              >
                {getFileIcon(attachment)}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getAttachmentName(attachment)}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Click to open</span>
                    {attachment.size && (
                      <span>• {(attachment.size / 1024).toFixed(1)} KB</span>
                    )}
                    {attachment.uploadedAt && (
                      <span>• {new Date(attachment.uploadedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip title="Download">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(attachment.url, "_blank");
                    }}
                    className="text-gray-500 hover:text-indigo-600"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {!attachment._id.startsWith('temp-') && (
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAttachment(attachment);
                      }}
                      disabled={deletingAttachment === attachment._id}
                      className="text-gray-500 hover:text-red-600"
                    >
                      {deletingAttachment === attachment._id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <CloudUploadIcon fontSize="small" />
                        </motion.div>
                      ) : (
                        <DeleteIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <InsertDriveFileIcon className="text-gray-400 text-6xl mb-4 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments yet</h3>
            <p className="text-gray-500 mb-6">Upload files to share with your team</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={!!uploadProgress}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-sm flex items-center mx-auto"
            >
              <AddIcon fontSize="small" className="mr-2" />
              Upload your first file
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AttachmentSection;