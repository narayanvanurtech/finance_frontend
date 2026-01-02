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

export type BusinessDetails = {
  name: string;
  gstin: string;
  address: string;
  contact: string;
  email: string;
  igstn?: string;
  state?: string;
};

export type YourDetailsSectionProps = {
  businessId?: string;
  onBusinessSelect?: (value: string) => void;
  showAddBusiness?: boolean;
  setShowAddBusiness?: React.Dispatch<React.SetStateAction<boolean>>;
  businessDetails: BusinessDetails;
  setBusinessDetails?: React.Dispatch<React.SetStateAction<BusinessDetails>>;
  handleAddBusiness?: () => void;
  mockBusinesses?: {
    id: number;
    name: string;
    gstin: string;
    address: string;
    contact: string;
    email: string;
  }[];
  hideSelector?: boolean;
};

const YourDetailsSection: React.FC<YourDetailsSectionProps> = (props) => {
  const businessStoreDetails = useBussinessStore((s) => s.details);

  // Check if props.businessDetails has any valid values
  const hasValidPropDetails =
    props.businessDetails &&
    (props.businessDetails.name ||
      props.businessDetails.gstin ||
      props.businessDetails.address);

  // Prefer prop if it has valid data, otherwise fallback to store
  const businessDetails = hasValidPropDetails
    ? props.businessDetails
    : businessStoreDetails
    ? {
        name: businessStoreDetails.businessName,
        gstin: businessStoreDetails.gstNumber || "",
        address: businessStoreDetails.website || "",
        contact: businessStoreDetails.phone,
        email: "",
      }
    : undefined;

  const [businessSearch, setBusinessSearch] = useState("");
  const filteredBusinesses =
    props.mockBusinesses?.filter((b) =>
      b.name.toLowerCase().includes(businessSearch.toLowerCase())
    ) || [];
  const [editOpen, setEditOpen] = useState(false);
  return (
    <>
      {businessStoreDetails && (
        <AddBussinessModal
          open={editOpen}
          setOpen={setEditOpen}
          initialValues={businessStoreDetails}
        />
      )}
      {!props.hideSelector && (
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Select Business
            </label>
            <Select
              onValueChange={props.onBusinessSelect!}
              value={props.businessId}
            >
              <SelectTrigger className="w-full h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
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
              className="h-11 font-semibold px-6 rounded-lg border border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              onClick={() => props.setShowAddBusiness!(true)}
            >
              + Add New Business
            </Button>
          )}
        </div>
      )}
      {businessDetails && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div>
            <div className="text-xs text-gray-500">Company Name</div>
            <div className="font-medium text-base">
              {businessDetails.name || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">GSTIN</div>
            <div className="font-medium text-base">
              {businessDetails.gstin || businessDetails.igstn || "-"}
            </div>
          </div>
          {(businessStoreDetails?.state || businessDetails.state) && (
            <div>
              <div className="text-xs text-gray-500">State</div>
              <div className="font-medium text-base">
                {businessStoreDetails?.state || businessDetails.state}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500">Billing Address</div>
            <div className="font-medium text-base">
              {businessDetails.address || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Contact Person</div>
            <div className="font-medium text-base">
              {businessDetails.contact || "-"}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default YourDetailsSection;
