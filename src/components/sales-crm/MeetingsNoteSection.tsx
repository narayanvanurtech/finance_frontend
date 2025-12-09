"use client";

import React, { useState } from "react";
import { Send } from "@mui/icons-material";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useMeetingsStore } from "@/stores/salesCrmStore/useMeetingsStore";

interface MeetingsNoteSectionProps {
  notes: string | null;
  meetingId: string;
}

const MeetingsNoteSection: React.FC<MeetingsNoteSectionProps> = ({ notes, meetingId }) => {
  const [newNote, setNewNote] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const addNote = useMeetingsStore((state) => state.addNote);

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        setIsLoading(true);
        await addNote(meetingId, newNote.trim());
        setNewNote(""); 
        window.location.reload();
      } catch (error) {
        console.error("Failed to add note:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleAddNote();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <NoteAltOutlinedIcon className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {notes?.split("\n").length || 0} {notes?.split("\n").length === 1 ? 'note' : 'notes'}
          </span>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 mb-4 relative">
        <div 
          className={`relative border rounded-lg transition-all ${
            isFocused ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
          }`}
        >
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={handleKeyPress}
            placeholder="Add a note about this meeting..."
            className="w-full p-3 pr-12 focus:outline-none resize-none rounded-lg"
            rows={3}
          />
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || isLoading}
            className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors ${
              newNote.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-1">
          Press Enter to save, Shift+Enter for new line
        </p>
      </div>

      {/* Display existing notes */}
      {notes && (
        <div className="mt-8 pt-5 border-t border-gray-200/50">
          <div className="flex items-center space-x-2 mb-4">
            <FiberManualRecordIcon className="text-indigo-400" fontSize="small" />
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Your Notes
            </h3>
          </div>
          <div className="bg-white/80 p-5 rounded-xl shadow border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-indigo-400"></div>
            <div className="pl-4 relative z-10">
              {notes.split("\n").map((line, i) => (
                <p key={i} className="text-gray-700 mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsNoteSection;