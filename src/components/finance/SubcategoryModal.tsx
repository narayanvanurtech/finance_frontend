import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface SubcategoryModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialName?: string;
  initialDescription?: string;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function SubcategoryModal({
  open,
  mode,
  initialName = "",
  initialDescription = "",
  onSave,
  onCancel,
}: SubcategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription, open]);

  const handleSave = () => {
    if (name.trim() === "") return;
    onSave(name.trim(), description.trim());
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            autoFocus
            placeholder="Subcategory name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
          />
        </div>
        <DialogFooter>
          <Button onClick={onCancel} variant="outline">Cancel</Button>
          <Button onClick={handleSave}>{mode === "edit" ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 