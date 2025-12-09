"use client";

import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";

interface Note {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteSectionProps {
  notes: Note[];
  leadId: string;
}

const NoteSection: React.FC<NoteSectionProps> = ({ notes, leadId }) => {
  const [newNote, setNewNote] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  
  const { addNote, updateNote } = useLeadsStore();

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        setIsLoading(true);
        await addNote(leadId, newNote.trim());
        setNewNote(""); 
        // Note: You can remove window.location.reload() since the store will update automatically
      } catch (error) {
        console.error("Failed to add note:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note._id);
    setEditingContent(note.content);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (editingContent.trim()) {
      try {
        setIsLoading(true);
        await updateNote(leadId, noteId, editingContent.trim());
        setEditingNoteId(null);
        setEditingContent("");
      } catch (error) {
        console.error("Failed to update note:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      if (editingNoteId) {
        handleUpdateNote(editingNoteId);
      } else {
        handleAddNote();
      }
    }
  };

  // Use notes directly since it's now typed as Note[]
  const notesArray = notes || [];

  return (
    <div className="bg-white p-6 rounded shadow-md border border-gray-100">
      <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <NoteAltOutlinedIcon className="text-indigo-600" fontSize="small" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
        </div>
        {isLoading && (
          <FiberManualRecordIcon
            className="text-indigo-400 animate-pulse"
            fontSize="small"
          />
        )}
      </div>

      {/* Input section */}
      <div className="mt-6 space-y-4">
        <div
          className={`relative transition-all duration-200 ${
            isFocused ? "ring-2 ring-indigo-200" : ""
          } bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden`}
        >
          <label
            htmlFor="note-input"
            className={`absolute left-4 transition-all duration-200 ${
              newNote || isFocused
                ? "top-2 text-xs text-indigo-500"
                : "top-4 text-gray-400"
            }`}
          >
            {isFocused ? "Jot something down..." : "Write your note here..."}
          </label>
          <textarea
            id="note-input"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pt-7 px-4 pb-14 focus:outline-none resize-none bg-transparent text-gray-700"
            rows={3}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-white/30 p-3 flex justify-end items-center">
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                newNote.trim() && !isLoading
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>{isLoading ? "Sending..." : "Send"}</span>
              <SendIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Display existing notes */}
      {notesArray.length > 0 && (
        <div className="mt-8 pt-5 border-t border-gray-200/50">
          <div className="flex items-center space-x-2 mb-4">
            <FiberManualRecordIcon className="text-indigo-400" fontSize="small" />
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Your Notes ({notesArray.length})
            </h3>
          </div>
          <div className="space-y-4">
            {notesArray.map((note) => (
              <div key={note._id} className="bg-white/80 p-5 rounded-xl shadow border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-indigo-400"></div>
                <div className="pl-4 relative z-10">
                  {editingNoteId === note._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateNote(note._id)}
                          disabled={!editingContent.trim() || isLoading}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <SaveIcon fontSize="small" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                        >
                          <CancelIcon fontSize="small" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-400">
                          <span className="mr-2">Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                          {note.updatedAt !== note.createdAt && (
                            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
                            title="Edit note"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteSection;
