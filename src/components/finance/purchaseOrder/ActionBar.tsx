import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export type ActionBarProps = {
  mode?: "create" | "edit";
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
};



const ActionBar: React.FC<ActionBarProps> = ({ mode, onSubmit, loading, disabled = false }) => {
  const router = useRouter()
  const handleCancel=()=>{
      router.push("/finance/purchase-orders")
  }
  return (
    <section className="flex flex-wrap gap-4 justify-end mt-8 sticky bottom-0 py-4 px-2 border-gray-100 z-10 rounded-b-xl">
      <Button onClick={handleCancel} className="btn btn-outline" type="button">Cancel</Button>
      <Button 
        className="btn btn-primary flex items-center gap-2" 
        type="button" 
        onClick={onSubmit} 
        disabled={loading || disabled}
        title={disabled ? "Cannot update completed or cancelled purchase order" : ""}
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {mode === "edit" ? "Update Purchase Order" : "Create Purchase Order"}
      </Button>
    </section>
  );
};

export default ActionBar; 