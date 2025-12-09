"use client";

import React, { useRef, RefObject } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  const clear = () => sigCanvas.current?.clear();

  const save = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert("Please provide a signature first.");
    } else {
      const dataURL = sigCanvas.current.toDataURL("image/png");
      onSave(dataURL);
    }
  };

  return (
    <div className="border p-4 w-full max-w-full flex flex-col items-center">
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          width: 400,
          height: 180,
          className: "border w-full block",
        }}
      />
      <div className="mt-2 flex gap-2">
        <Button type="button" variant="outline" onClick={clear}>
          Clear
        </Button>
        <Button type="button" onClick={save}>
          Save
        </Button>
      </div>
    </div>
  );
}
