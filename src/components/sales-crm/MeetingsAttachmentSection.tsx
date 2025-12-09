"use client";

import React, { useRef, useState } from "react";
import { AttachFile, Close } from "@mui/icons-material";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";
import { Meeting } from "@/api/meetingsApi";

type FileType = "all" | "images" | "documents" | "videos" | "others";

const EXTENSIONS = {
  images: ["jpg", "jpeg", "png", "gif", "bmp", "svg"],
  documents: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
  videos: ["mp4", "mov", "avi", "mkv", "webm"],
  others: [],
  all: [],
};

interface MeetingsAttachmentSectionProps {
  meeting: {
    _id: string;
    attachment?: string[];
  };
}

const MeetingsAttachmentSection: React.FC<MeetingsAttachmentSectionProps> = ({ meeting }) => {
  const [selectedType, setSelectedType] = useState<FileType>("all");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useMeetingsStore();

  const getFileTypeFromUrl = (url: string): FileType => {
    const extension = url.split(".").pop()?.toLowerCase() || "";
    if (EXTENSIONS.images.includes(extension)) return "images";
    if (EXTENSIONS.documents.includes(extension)) return "documents";
    if (EXTENSIONS.videos.includes(extension)) return "videos";
    return "others";
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    try {
      for (const file of Array.from(files)) {
        await uploadFile(meeting._id, file);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const filteredAttachments = (meeting.attachment || []).filter(
    (attachment: string) =>
      selectedType === "all" || getFileTypeFromUrl(attachment) === selectedType
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AttachFile className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {meeting.attachment?.length || 0} {meeting.attachment?.length === 1 ? 'file' : 'files'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {(["all", "images", "documents", "videos", "others"] as FileType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 text-sm rounded-full whitespace-nowrap ${
              selectedType === type
                ? "bg-blue-100 text-blue-800"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 relative ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
        <div className="text-gray-500">
          <p className="font-medium">
            {dragActive ? "Drop your files here" : "Drop files here or click to upload"}
          </p>
          <p className="text-sm mt-1">Upload any file type</p>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredAttachments.length > 0 ? (
          filteredAttachments.map((file: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded shadow-sm">
                  <AttachFile className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {decodeURIComponent(file.split("/").pop() || "")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileTypeFromUrl(file).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.open(file, "_blank")}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                title="Open file"
              >
                <AttachFile fontSize="small" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No files found for the selected filter.
          </p>
        )}
      </div>
    </div>
  );
};

export default MeetingsAttachmentSection;
