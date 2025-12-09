"use client";

import React, { useState, useRef } from "react";
import { importLeads } from "@/api/leadsApi";

interface ImportLeadsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

interface ImportError {
  message: string;
  duplicateCount?: number;
  status?: string;
  statusCode?: number;
}

export default function ImportLeadsDialog({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: ImportLeadsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please select a valid CSV file");
        setFile(null);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (
        droppedFile.type === "text/csv" ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please select a valid CSV file");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await importLeads(file);

      // Check for error conditions
      if (response.statusCode === 400) {
        let errorMessage = "";

        // Check if there's error information directly in the response
        if (response.duplicateCount) {
          errorMessage = `${response.message} (${
            response.duplicateCount
          } duplicate${response.duplicateCount > 1 ? "s" : ""} found)`;
        } else if (response.message) {
          errorMessage = response.message;
        } else {
          errorMessage = "Import failed. Please check your file and try again.";
        }

        setError(errorMessage);
        onError(errorMessage);
      } else {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      // Handle API error response
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = "";

        if (errorData.duplicateCount) {
          errorMessage = `${errorData.message} (${
            errorData.duplicateCount
          } duplicate${errorData.duplicateCount > 1 ? "s" : ""} found)`;
        } else {
          errorMessage =
            errorData.message ||
            "Import failed. Please check your file and try again.";
        }

        setError(errorMessage);
        onError(errorMessage);
      } else {
        const errorMessage = error.message || "Failed to import leads";
        setError(errorMessage);
        onError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Leads</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700">
            {file ? file.name : "Drag and drop your CSV file here"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            or click to select a file
          </p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
