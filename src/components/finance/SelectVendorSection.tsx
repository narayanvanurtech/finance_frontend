import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Vendor } from "@/stores/financeStore/useVendorStore";

export type VendorDetails = {
  name: string;
  gstin?: string;
  address?: string;
  contact?: string;
  email?: string;
};

export type SelectVendorSectionProps = {
  vendorId: string;
  onVendorSelect: (value: string) => void;
  showAddVendor: boolean;
  setShowAddVendor: React.Dispatch<React.SetStateAction<boolean>>;
  vendorDetails: VendorDetails;
  setVendorDetails: React.Dispatch<React.SetStateAction<VendorDetails>>;
  handleAddVendor: () => void;
  mockVendors: Vendor[];
};

const SelectVendorSection: React.FC<SelectVendorSectionProps> = ({
  vendorId,
  onVendorSelect,
  showAddVendor,
  setShowAddVendor,
  vendorDetails,
  setVendorDetails,
  handleAddVendor,
  mockVendors,
}) => {
  const [vendorSearch, setVendorSearch] = useState("");
  const filteredVendors = mockVendors.filter((v) =>
    v.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );
  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 border-b pb-2">
        Vendor Details
      </h2>
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1 text-gray-500">
            Select Vendor
          </label>
          <Select onValueChange={onVendorSelect} value={vendorId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="-- Select Vendor --" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1">
                <Input
                  placeholder="Search vendor..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="mb-2 w-full"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              {filteredVendors.map((v) => (
                <SelectItem key={v._id} value={v._id.toString()}>
                  {v.name}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Add New Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {vendorId === "new" && (
          <Button
            className="btn btn-primary font-semibold px-6 py-2 rounded shadow border border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            onClick={() => setShowAddVendor(true)}
          >
            + Add New Vendor
          </Button>
        )}
      </div>
      {/* Remove old inline add vendor UI, modal will be used instead */}
      {vendorId && vendorId !== "new" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Vendor Name</div>
            <div className="font-medium text-base">{vendorDetails.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">GSTIN</div>
            <div className="font-medium text-base">
              {vendorDetails.gstin || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Address</div>
            <div className="font-medium text-base">
              {vendorDetails.address || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Contact</div>
            <div className="font-medium text-base">
              {vendorDetails.contact || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium text-base">
              {vendorDetails.email || "-"}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SelectVendorSection;
