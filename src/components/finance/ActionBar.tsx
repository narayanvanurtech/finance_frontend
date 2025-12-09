import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type ActionBarProps = {
  mode?: "create" | "edit";
  onSubmit: () => void;
  loading?: boolean;
  onPrintDownload?: () => void;
  onSendEmail?: () => void;
  onCancel?: () => void;
  documentType?: "invoice" | "quotation";
};

const ActionBar: React.FC<ActionBarProps> = ({
  mode,
  onSubmit,
  loading,
  onPrintDownload,
  onSendEmail,
  onCancel,
  documentType = "quotation",
}) => {
  const updateButtonText =
    mode === "edit"
      ? `Update ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}`
      : `Create ${
          documentType.charAt(0).toUpperCase() + documentType.slice(1)
        }`;

  return (
    <section className="flex flex-wrap gap-4 justify-end mt-8 sticky bottom-0 py-4 px-2 border-gray-100 z-10 rounded-b-xl">
      <Button className="btn btn-outline" type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        className="btn btn-secondary"
        type="button"
        onClick={onPrintDownload}
      >
        Print / Download PDF
      </Button>
      <Button className="btn btn-secondary" type="button" onClick={onSendEmail}>
        Send Email
      </Button>
      <Button
        className="btn btn-primary flex items-center gap-2"
        type="button"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {updateButtonText}
      </Button>
    </section>
  );
};

export default ActionBar;
