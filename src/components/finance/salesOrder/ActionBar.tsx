import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type ActionBarProps = {
  mode?: "create" | "edit";
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
  onPrintDownload?: () => void;
  onSendEmail?: () => void;
  onCancel?: () => void;
  documentType?: "invoice" | "quotation";
};

const ActionBar: React.FC<ActionBarProps> = ({
  mode,
  onSubmit,
  loading,
  disabled,
  onPrintDownload,
  onSendEmail,
  onCancel,
}) => {
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
        disabled={loading || disabled}
        title={
          disabled
            ? "Cannot update orders with status: cancelled, delivered, or shipped"
            : ""
        }
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {mode === "edit" ? "Update Sales Order" : "Create Sales Order"}
      </Button>
    </section>
  );
};

export default ActionBar;
