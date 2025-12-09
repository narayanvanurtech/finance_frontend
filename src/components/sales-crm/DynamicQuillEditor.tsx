"use client";
import dynamic from "next/dynamic";
import { FC } from "react";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme?: "snow" | "bubble";
  allowedTokens?: string[]; // <-- ADD THIS LINE
}

const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const DynamicQuillEditor: FC<QuillEditorProps> = (props) => {
  return <QuillEditor {...props} />;
};

export default DynamicQuillEditor;
