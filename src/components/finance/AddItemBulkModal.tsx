import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Mock products for demonstration (should be passed as prop in real use)
const mockProducts = [
  { name: "Consulting", rate: 1000 },
  { name: "Software License", rate: 5000 },
  { name: "Support", rate: 500 },
];

interface AddItemBulkModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (items: { name: string; unit: number }[]) => void;
}

export default function AddItemBulkModal({ open, onClose, onSubmit }: AddItemBulkModalProps) {
  const [selected, setSelected] = useState<{ [name: string]: { checked: boolean; unit: number } }>(
    () => Object.fromEntries(mockProducts.map(p => [p.name, { checked: false, unit: 1 }]))
  );
  const [search, setSearch] = useState("");

  const handleCheck = (name: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [name]: { ...prev[name], checked } }));
  };

  const handleUnitChange = (name: string, unit: number) => {
    setSelected(prev => ({ ...prev, [name]: { ...prev[name], unit: Math.max(1, unit) } }));
  };

  const handleAdd = () => {
    const items = Object.entries(selected)
      .filter(([_, v]) => v.checked)
      .map(([name, v]) => ({ name, unit: v.unit }));
    onSubmit(items);
    onClose();
  };

  const filteredProducts = mockProducts.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Add Items in Bulk</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-4">
          {filteredProducts.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-4 border-b pb-2">
              <Checkbox
                checked={selected[item.name]?.checked || false}
                onCheckedChange={checked => handleCheck(item.name, !!checked)}
              />
              <span className="flex-1 font-medium">{item.name}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 border rounded"
                  onClick={() => handleUnitChange(item.name, (selected[item.name]?.unit || 1) - 1)}
                  disabled={selected[item.name]?.unit <= 1}
                >
                  -
                </button>
                <Input
                  className="w-16 text-center"
                  type="number"
                  min={1}
                  value={selected[item.name]?.unit || 1}
                  onChange={e => handleUnitChange(item.name, Number(e.target.value))}
                />
                <button
                  type="button"
                  className="px-2 py-1 border rounded"
                  onClick={() => handleUnitChange(item.name, (selected[item.name]?.unit || 1) + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-400 py-8">No items found.</div>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <button
              type="button"
              className="px-4 py-2 rounded font-medium border border-[var(--color-muted)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition"
              style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}
              onClick={onClose}
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            className="px-4 py-2 rounded font-semibold border border-[var(--color-primary)] hover:opacity-90 transition"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            onClick={handleAdd}
          >
            Add Selected
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 