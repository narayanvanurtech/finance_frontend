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
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import AddBussinessModal from "@/components/finance/AddBussinessModal";


export interface BankDetails {
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
}

export interface BusinessDetails {
  _id?: string;
  businessName?: string;
  gstin?: string;
  state?: string;
  contact?: string;
  website?: string;
  qrcode?: string;
  bankDetails?: BankDetails;
}

export type YourDetailsSectionProps = {
  businessId?: string;
  onBusinessSelect?: (value: string) => void;
  showAddBusiness?: boolean;
  setShowAddBusiness?: React.Dispatch<React.SetStateAction<boolean>>;
  mockBusinesses?: {
    id: number;
    name: string;
  }[];
  hideSelector?: boolean;
};

const YourDetailsSection: React.FC<YourDetailsSectionProps> = (props) => {
  const businessStoreDetails: BusinessDetails | null =
  useBussinessStore((s: any) => s.details);
  const [businessSearch, setBusinessSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const filteredBusinesses =
    props.mockBusinesses?.filter((b) =>
      b.name.toLowerCase().includes(businessSearch.toLowerCase())
    ) || [];

    console.log("businessStoreDetails:::_=>",businessStoreDetails)

  return (
    <>
      {/* Edit Modal */}
      {businessStoreDetails && (
        <AddBussinessModal
          open={editOpen}
          setOpen={setEditOpen}
          initialValues={businessStoreDetails}
        />
      )}

      {/* Business Selector */}
      {!props.hideSelector && (
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Select Business
            </label>

            <Select
              onValueChange={props.onBusinessSelect}
              value={props.businessId}
            >
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="-- Select Business --" />
              </SelectTrigger>

              <SelectContent>
                <div className="px-2 py-2">
                  <Input
                    placeholder="Search business..."
                    value={businessSearch}
                    onChange={(e) => setBusinessSearch(e.target.value)}
                    className="mb-2 w-full h-10"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>

                {filteredBusinesses.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}

                <SelectItem value="new">+ Add New Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {props.businessId === "new" && props.setShowAddBusiness && (
            <Button
              className="h-11 px-6"
              onClick={() => props.setShowAddBusiness!(true)}
            >
              + Add New Business
            </Button>
          )}
        </div>
      )}

      
     {/* Business Details Display */}
{businessStoreDetails && (
  <Card className="p-4 sm:p-6 shadow-sm border rounded-xl">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <h2 className="text-lg font-semibold">Business Details</h2>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setEditOpen(true)}
        className="w-full cursor-pointer text-white bg-[#3B82F6] sm:w-auto"
      >
        Edit
      </Button>
    </div>

    {/* Main Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Section - Business Info */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Detail label="Business Name" value={businessStoreDetails.businessName} />
          <Detail label="GST Number" value={businessStoreDetails.gstin} />
          <Detail label="State" value={businessStoreDetails.state} />
          <Detail label="Phone" value={businessStoreDetails.contact} />
          <Detail label="Website" value={businessStoreDetails.website} />
          <Detail label="GSTIN" value={businessStoreDetails.gstin} />
        </div>

        {/* Bank Details */}
        {businessStoreDetails.bankDetails && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-semibold mb-4">Bank Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Detail
                label="Bank Name"
                value={businessStoreDetails.bankDetails.bankName}
              />
              <Detail
                label="Account Holder"
                value={businessStoreDetails.bankDetails.accountHolderName}
              />
              <Detail
                label="Account Number"
                value={businessStoreDetails.bankDetails.accountNumber}
              />
              <Detail
                label="IFSC Code"
                value={businessStoreDetails.bankDetails.ifscCode}
              />
              <Detail
                label="Branch"
                value={businessStoreDetails.bankDetails.branchName}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Section - QR Code Only */}
      {businessStoreDetails.qrcode && (
        <div className="flex flex-col items-center justify-start">
          <h3 className="text-sm font-semibold mb-4">QR Code</h3>
<div className="w-full flex justify-center lg:justify-end">
  <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-200 p-2 transition-all duration-300 hover:shadow-lg">

   
      <img
        src={businessStoreDetails.qrcode}
        alt="QR Code"
        className="w-full rounded-2xl h-full object-contain "
      />
   

  </div>
</div>
          
        </div>
      )}

    </div>
  </Card>
)}
    </>
  );
};

export default YourDetailsSection;

/* Reusable Detail Component */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-medium text-base">{value || "-"}</div>
  </div>
);