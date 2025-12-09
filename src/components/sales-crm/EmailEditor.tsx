"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    // @ts-ignore
    await import("react-quill/dist/quill.snow.css");
    return RQ;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
    ),
  }
);

interface EmailEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onTokenValidationChange?: (hasPendingTokens: boolean) => void;
  lead?: Record<string, any> | null;
}

interface Token {
  name: string;
  value: string;
}

const EmailEditor: React.FC<EmailEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your email message...",
  disabled = false,
  onTokenValidationChange,
  lead = null,
}) => {
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tempTokens, setTempTokens] = useState<Token[]>([]);
  const [editorContent, setEditorContent] = useState(value);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const lastProcessedValue = useRef(value);

  // Toolbar options for email editing
  const toolbarOptions = [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ];

  const modules = {
    toolbar: {
      container: toolbarOptions,
    },
  };

  // Function to extract tokens from content
  const extractTokens = useCallback((content: string): string[] => {
    const tokenRegex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(tokenRegex);
    if (!matches) return [];
    return [...new Set(matches.map((match) => match.slice(2, -2)))];
  }, []);

  // Function to replace tokens with values
  const replaceTokens = useCallback(
    (content: string, tokenValues: Token[]): string => {
      let processedContent = content;
      tokenValues.forEach((token) => {
        if (token.value) {
          const regex = new RegExp(`\\{\\{${token.name}\\}\\}`, "g");
          processedContent = processedContent.replace(regex, token.value);
        }
      });
      return processedContent;
    },
    []
  );

  // Function to get value from lead by nested key
  const getLeadValue = useCallback(
    (key: string): string => {
      if (!lead) return "";
      return (
        key.split(".").reduce((obj: any, k: string) => obj?.[k], lead) ?? ""
      );
    },
    [lead]
  );

  // Initialize component when value changes (template selection)
  useEffect(() => {
    if (value !== lastProcessedValue.current && !isUserTyping) {
      lastProcessedValue.current = value;
      setEditorContent(value);

      const foundTokens = extractTokens(value);
      if (foundTokens.length > 0) {
        const newTokens = foundTokens.map((tokenName) => ({
          name: tokenName,
          value: getLeadValue(tokenName),
        }));
        setTokens(newTokens);
        setTempTokens(newTokens);
        setIsInitialized(true);
      } else {
        setTokens([]);
        setTempTokens([]);
        setIsInitialized(true);
      }
    }
  }, [value, extractTokens, isUserTyping, getLeadValue]);

  // Ensure component is initialized even with empty content
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      setEditorContent(value);
    }
  }, [isInitialized, value]);

  // Process tokens and update parent when tokens change
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (tokens.length === 0) {
      onChange(editorContent);
      return;
    }

    const processed = replaceTokens(editorContent, tokens);
    onChange(processed);

    console.log("Tokens processed:", tokens);
    console.log("Original content:", editorContent);
    console.log("Processed content:", processed);
  }, [tokens, editorContent, onChange, replaceTokens, isInitialized]);

  // Show token dialog when tokens are detected
  useEffect(() => {
    if (
      isInitialized &&
      tempTokens.length > 0 &&
      tempTokens.some((t) => !t.value)
    ) {
      setShowTokenDialog(true);
    }
  }, [tempTokens, isInitialized]);

  // Notify parent about token validation status
  useEffect(() => {
    if (onTokenValidationChange) {
      const hasPendingTokens = tokens.some((token) => !token.value.trim());
      onTokenValidationChange(hasPendingTokens);
    }
  }, [tokens, onTokenValidationChange]);

  const handleEditorChange = useCallback(
    (newContent: string) => {
      setIsUserTyping(true);
      setEditorContent(newContent);

      const foundTokens = extractTokens(newContent);

      // Always sync tokens with foundTokens
      const updatedTokens = foundTokens.map((name) => {
        // Try to keep existing value if present
        const existing = tokens.find((t) => t.name === name);
        return existing ? existing : { name, value: "" };
      });

      setTokens(updatedTokens);
      setTempTokens(updatedTokens);

      if (foundTokens.length === 0) {
        onChange(newContent);
      }

      setTimeout(() => {
        setIsUserTyping(false);
      }, 100);
    },
    [extractTokens, tokens, onChange]
  );

  const handleTokenValueChange = useCallback(
    (tokenName: string, newValue: string) => {
      setTempTokens((prev) =>
        prev.map((token) =>
          token.name === tokenName ? { ...token, value: newValue } : token
        )
      );
    },
    []
  );

  const handleTokenDialogClose = useCallback(() => {
    setShowTokenDialog(false);
  }, []);

  const handleTokenDialogConfirm = useCallback(() => {
    setTokens(tempTokens);
    setShowTokenDialog(false);
  }, [tempTokens]);

  const handleReopenTokenDialog = useCallback(() => {
    setTempTokens([...tokens]);
    setShowTokenDialog(true);
  }, [tokens]);

  return (
    <div
      className="email-editor"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div>
        <ReactQuill
          value={editorContent}
          onChange={handleEditorChange}
          placeholder={placeholder}
          readOnly={disabled}
          modules={modules}
          style={{ maxHeight: "600px", overflow: "scroll" }}
        />
      </div>

      {/* Token Dialog */}
      {showTokenDialog && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Fill in Template Tokens
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please provide values for the following tokens found in your
                template:
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {tempTokens.map((token) => (
                  <div key={token.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded mr-2">
                        {`{{${token.name}}}`}
                      </span>
                      {token.name.charAt(0).toUpperCase() + token.name.slice(1)}
                      :
                    </label>
                    <input
                      type="text"
                      value={token.value}
                      onChange={(e) =>
                        handleTokenValueChange(token.name, e.target.value)
                      }
                      placeholder={`Enter ${token.name}`}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleTokenDialogClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTokenDialogConfirm}
                disabled={tempTokens.some((token) => !token.value.trim())}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Tokens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Information */}
      <div className="p-4 bg-gray-50 rounded-md">
        <div className="flex justify-between ">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Template Information
          </h4>
          <button
            type="button"
            onClick={handleReopenTokenDialog}
            disabled={disabled}
            className="px-3 py-1 text-xs font-medium text-indigo-600 bg-white border border-indigo-300 rounded hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Edit Tokens
          </button>
        </div>

        {tokens.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-1">Token Status:</p>
            <div className="flex flex-wrap gap-1">
              {tokens.map((token) => (
                <span
                  key={token.name}
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    token.value
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {`{{${token.name}}}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {tokens.length === 0 && (
          <p className="text-sm text-gray-600">
            No template tokens found. This is a static email template.
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailEditor;
