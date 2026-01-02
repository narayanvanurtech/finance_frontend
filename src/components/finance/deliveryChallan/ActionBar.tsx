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
  disabled?: boolean;
  disabledReason?: string;
};

const ActionBar: React.FC<ActionBarProps> = ({
  mode,
  onSubmit,
  loading,
  onPrintDownload,
  onSendEmail,
  onCancel,
  disabled,
  disabledReason,
}) => {
  return (
    <section className="flex flex-wrap gap-4 justify-end mt-8 sticky bottom-0 py-4 px-2 border-gray-100 z-10 rounded-b-xl">
      {/* {disabled && disabledReason && (
        <div className="w-full text-right mb-2">
          <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            ⚠️ {disabledReason}
          </span>
        </div>
      )} */}
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
        title={disabled ? disabledReason : undefined}
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {mode === "edit"
          ? "Update Delivery Challan"
          : "Create Delivery Challan"}
      </Button>
    </section>
  );
};

export default ActionBar;
