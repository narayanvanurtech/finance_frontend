import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export type Cess = {
  type: string;
  name: string;
  value?: string;
  rate: number;
  showInInvoice: boolean;
};

type ConfigureTaxProps = {
  taxType: string;
  setTaxType: (val: string) => void;
  cessList: Cess[];
  setCessList: React.Dispatch<React.SetStateAction<Cess[]>>;
};

export default function ConfigureTax({
  taxType,
  setTaxType,
  cessList,
  setCessList,
}: ConfigureTaxProps) {
  const [open, setOpen] = React.useState(false);

  const handleCessChange = (idx: number, field: string, value: any) => {
    setCessList((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const addCess = () => {
    setCessList((prev) => [
      ...prev,
      { type: "State", name: "", value: "", rate: 0, showInInvoice: false },
    ]);
  };

  const removeCess = (idx: number) => {
    setCessList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Configure Tax
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Tax</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1 text-gray-500">
              Tax Type
            </label>
            <Select value={taxType} onValueChange={setTaxType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IGST">IGST</SelectItem>
                <SelectItem value="SGST_CGST">SGST + CGST</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Cess</span>
            <Button size="sm" variant="outline" onClick={addCess}>
              + Add Cess
            </Button>
          </div>
          {cessList.map((cess, idx) => (
            <div
              key={idx}
              className="mb-4 border p-3 rounded-md flex flex-col gap-2 bg-gray-50"
            >
              <div className="flex gap-2 items-center">
                <Select
                  value={cess.type}
                  onValueChange={(val) => handleCessChange(idx, "type", val)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Cess Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="State">State Cess</SelectItem>
                    <SelectItem value="Central">Central Cess</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="w-32"
                  placeholder="Cess Name"
                  value={cess.name}
                  onChange={(e) =>
                    handleCessChange(idx, "name", e.target.value)
                  }
                />
                {/* Value will be entered per item row, not here */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCess(idx)}
                >
                  Remove
                </Button>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={cess.showInInvoice}
                  onCheckedChange={() =>
                    handleCessChange(idx, "showInInvoice", !cess.showInInvoice)
                  }
                />
                Show in Invoice
              </label>
            </div>
          ))}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
