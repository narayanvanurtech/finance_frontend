import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IoClose } from "react-icons/io5";
import SignaturePad from "@/components/finance/SignaturePad";
import AttachmentManager from "@/components/finance/AttachmentManager";

export type AdditionalInputsProps = {
  terms: string;
  setTerms: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  attachments: File[];
  handleAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showSignature: boolean;
  setShowSignature: React.Dispatch<React.SetStateAction<boolean>>;
  setSignature: React.Dispatch<React.SetStateAction<string>>;
  signature:string;
  purchaseOrderId?: string;
  existingAttachments?: string[];
  onAddAttachment?: (file: File) => Promise<void>;
  onRemoveAttachment?: (index: number, url: string) => Promise<void>; // ✅ Added url parameter
  mode?: "create" | "edit";
  isLoadingAttachment?: boolean;
};

const AdditionalInputs: React.FC<AdditionalInputsProps> = ({
  terms,
  setTerms,
  notes,
  setNotes,
  attachments,
  handleAttachment,
  setSignature,
  signature,
  showSignature,
  setShowSignature,
  purchaseOrderId,
  existingAttachments = [],
  onAddAttachment,
  onRemoveAttachment,
  mode = "create",
  isLoadingAttachment = false,
}) => {
  const [signatureMode, setSignatureMode] = useState<"none" | "upload" | "pad">(
    "none",
  );
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePadData, setSignaturePadData] = useState<string | null>(null);
  const [signaturePadModalOpen, setSignaturePadModalOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [signatureError, setSignatureError] = useState<string>("");

  React.useEffect(() => {
    console.log("🔍 AdditionalInputs - Received props:", {
      mode,
      terms,
      notes,
      termsType: typeof terms,
      notesType: typeof notes,
      termsLength: terms?.length || 0,
      notesLength: notes?.length || 0,
      showTerms,
      showNotes,
    });
  }, [mode, terms, notes, showTerms, showNotes]);

  // Terms and Notes are always visible now

  // Validate signature file
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setSignatureError("Only image files (JPEG, PNG, GIF, WEBP) are allowed");
      e.target.value = "";
      return;
    }

    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setSignatureError("File size must be less than 2MB");
      e.target.value = "";
      return;
    }

    setSignatureError("");
    setSignatureFile(file);
  };

  useEffect(() => {
  // If signature already exists (edit mode / fetched data)
  if (signature && signature.trim() !== "") {
    setSignatureMode("pad");        // auto select pad
    setSignaturePadData(signature); // show preview
  }
}, [signature]);

  // console.log("signaturePadData,,,mnjbhub", signaturePadData);

  return (
    <Card className="bg-white rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Terms & Conditions
        </label>
        {showTerms ? (
          <div className="relative">
            <Textarea
              className="input w-full"
              rows={3}
              placeholder="Enter terms and conditions..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
              onClick={() => {
                setTerms("");
                setShowTerms(false);
              }}
              aria-label="Close"
            >
              <IoClose size={18} />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTerms(true)}
          >
            + Add Terms & Conditions
          </Button>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-500">
          Notes to Client
        </label>
        {showNotes ? (
          <div className="relative">
            <Textarea
              className="input w-full"
              rows={3}
              placeholder="Enter notes for client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
              onClick={() => {
                setNotes("");
                setShowNotes(false);
              }}
              aria-label="Close"
            >
              <IoClose size={18} />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(true)}
          >
            + Add Notes to Client
          </Button>
        )}
      </div>

      {/* Attachment Manager */}
      <div className="md:col-span-2">
        <AttachmentManager
          purchaseOrderId={purchaseOrderId}
          existingAttachments={existingAttachments}
          onAdd={onAddAttachment}
          onRemove={onRemoveAttachment}
          localAttachments={attachments}
          onLocalAdd={(file) => {
            const dt = new DataTransfer();
            attachments.forEach((f) => dt.items.add(f));
            dt.items.add(file);
            const event = {
              target: { files: dt.files },
            } as any;
            handleAttachment(event);
          }}
          onLocalRemove={(index) => {
            const dt = new DataTransfer();
            attachments.forEach((f, i) => {
              if (i !== index) dt.items.add(f);
            });
            const event = {
              target: { files: dt.files },
            } as any;
            handleAttachment(event);
          }}
          mode={mode}
          isLoading={isLoadingAttachment}
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <span className="font-semibold text-sm mb-1">Signature Block</span>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="signatureMode"
              value="upload"
              checked={signatureMode === "upload"}
              onChange={() => setSignatureMode("upload")}
            />
            Upload Signature
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="signatureMode"
              value="pad"
              checked={signatureMode === "pad"}
              onChange={() => setSignatureMode("pad")}
            />
            Use Signature Pad
          </label>
        </div>
        {signatureMode === "upload" && (
          <div className="mt-2">
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleSignatureUpload}
            />
            <p className="text-xs text-gray-500 mt-1">
              Max file size: 2MB. Supported formats: JPEG, PNG, GIF, WEBP
            </p>
            {signatureError && (
              <div className="text-red-500 text-xs mt-1">{signatureError}</div>
            )}
            {signatureFile && (
              <>
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {signatureFile.name} (
                  {(signatureFile.size / 1024).toFixed(2)} KB)
                </div>
                <div className="mt-4">
                  <span className="block text-xs text-gray-500 mb-1">
                    Signature Preview:
                  </span>
                  <img
                    src={URL.createObjectURL(signatureFile)}
                    alt="Signature preview"
                    className="border rounded h-40 object-contain"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setSignatureFile(null);
                      setSignatureError("");
                      setSignature("");
                       setSignaturePadData(null)
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        {signatureMode === "pad" && (
          <div className="mt-2">
         {(signaturePadData || signature) && (
              <div className="mb-4">
                <span className="block text-xs text-gray-500 mb-1">
                  Signature Preview:
                </span>
                <img
                  src={signaturePadData || signature}
                  alt="Signature preview"
                  className="border rounded h-40"
                />
              </div>
            )}
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                className="btn btn-outline"
                onClick={() => setSignaturePadModalOpen(true)}
              >
                Sign
              </Button>
              {signaturePadData && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>{ 
                    setSignaturePadData(null)
                    setSignature("")
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
            <Dialog
              open={signaturePadModalOpen}
              onOpenChange={setSignaturePadModalOpen}
            >
              <DialogContent className="max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Draw Signature</DialogTitle>
                </DialogHeader>
                <SignaturePad
                  onSave={(data) => {
                    setSignature(data);
                    setSignaturePadData(data);
                    setSignaturePadModalOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdditionalInputs;
