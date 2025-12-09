import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type ActionBarProps = {
  mode?: "create" | "edit";
  onSubmit: () => void;
  loading?: boolean;
};

const ActionBar: React.FC<ActionBarProps> = ({ mode, onSubmit, loading }) => {
  return (
    <section className="flex flex-wrap gap-4 justify-end mt-8 sticky bottom-0 py-4 px-2 border-gray-100 z-10 rounded-b-xl">
      <Button className="btn btn-outline" type="button">Cancel</Button>
      <Button className="btn btn-secondary" type="button">Print / Download PDF</Button>
      <Button className="btn btn-secondary" type="button">Send via Email</Button>
      <Button className="btn btn-primary flex items-center gap-2" type="button" onClick={onSubmit} disabled={loading}>
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {mode === "edit" ? "Update Credit Note" : "Create Credit Note"}
      </Button>
    </section>
  );
};

export default ActionBar; 