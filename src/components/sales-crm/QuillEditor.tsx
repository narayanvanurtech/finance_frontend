"use client";
import React, { useRef, useState, useEffect } from "react";
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
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded"></div>,
  }
) as any;

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme?: "snow" | "bubble";
  allowedTokens?: string[]; // Add allowed tokens prop
}

const toolbarOptions = [
  [{ 'header': [1, 2, false] }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ['link', 'image'],
  ['clean']
];

const modules = {
  toolbar: {
    container: toolbarOptions,
  },
};

const DEFAULT_TOKENS = [
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
];

const QuillEditor: React.FC<any> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  theme = "snow",
  allowedTokens,
  ...rest
}) => {
  const tokens = allowedTokens ?? DEFAULT_TOKENS;
  const quillRef = useRef<any>(null);
  const lastSelection = useRef<any>(null); // to track the last cursor position
  const [selectedToken, setSelectedToken] = useState("");

  // Auto-focus on mount
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor) editor.focus();
  }, []);

  // Track cursor position
  const handleEditorChangeSelection = (range: any) => {
    if (range) {
      lastSelection.current = range;
    }
  };

  const insertToken = () => {
    const editor = quillRef.current?.getEditor();
    const selection = lastSelection.current;
    if (editor && selection && selectedToken) {
      editor.setSelection(selection.index, selection.length); // restore cursor
      editor.insertText(selection.index, `{{${selectedToken}}}`);
      setSelectedToken(""); // Clear selection
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
        <label className="text-sm font-medium text-gray-700" htmlFor="token-dropdown">
          Insert variable:
        </label>
        <select
          id="token-dropdown"
          className="border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-indigo-400 min-w-[180px]"
          value={selectedToken}
          onChange={e => setSelectedToken(e.target.value)}
        >
          <option value="">Select variable...</option>
          {tokens.map((token: string) => (
            <option key={token} value={token}>{`{{${token}}}`}</option>
          ))}
        </select>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          onClick={insertToken}
          disabled={!selectedToken}
          type="button"
        >
          Insert
        </button>
      </div>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        onChangeSelection={handleEditorChangeSelection}
        placeholder={placeholder}
        theme={theme}
        modules={modules}
        {...rest}
      />
      <p className="text-xs text-gray-500 mt-2">
        You can personalize your email using variables like <span className="font-mono bg-gray-100 px-1 rounded">{'{{firstName}}'}</span>, <span className="font-mono bg-gray-100 px-1 rounded">{'{{email}}'}</span>, etc. These will be replaced with the lead's information when sending.
      </p>
    </div>
  );
};

export default QuillEditor;
