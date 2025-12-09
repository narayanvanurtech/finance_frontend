import React, { useEffect, useState } from "react";
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
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

export type Address = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type ClientDetails = {
  name: string;
  gstin?: string;
  address?: Address | string;
  contact?: string;
  email?: string;
  igstn?: string;
  state?: string;
};

export type ClientSectionProps = {
  clientId: string | { _id: string; [key: string]: any };
  onClientSelect: (value: string) => void;
  clientDetails: ClientDetails;
  setClientDetails: React.Dispatch<React.SetStateAction<ClientDetails>>;
  mockClients?: any[];
  showAddClient?: boolean;
  setShowAddClient?: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddClient?: () => void;
  showBankDetails?: boolean; // New prop to control bank details visibility
};

const ClientSection: React.FC<ClientSectionProps> = ({
  clientId,
  onClientSelect,
  clientDetails,
  setClientDetails,
  mockClients,
  showBankDetails = false, // Default false - only show in delivery challan
}) => {
  const { clients, fetchClients } = useClientStore();
  const router = useRouter();
  const { user } = useAuthStore();
  const [clientSearch, setClientSearch] = useState("");

  // Convert clientId to string for select value
  const clientIdString =
    typeof clientId === "string" ? clientId : clientId?._id || "";

  // Always refetch clients when component mounts or when user returns to this page
  useEffect(() => {
    if (user?.companyId) {
      fetchClients(user.companyId);
    }
    // Listen for visibility change to refetch when user returns
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && user?.companyId) {
        fetchClients(user.companyId);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchClients, user?.companyId]);

  const filteredClients = clients.filter((c) =>
    c.businessName.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleClientSelect = (value: string) => {
    // Handle "Add New Client" selection
    if (value === "new") {
      handleAddNewClient();
      return;
    }

    onClientSelect(value);
    const selectedClient = clients.find((client) => client._id === value);

    console.log("🔍 Selected Client Full Data:", selectedClient);
    console.log("🏦 Bank Details Check:", {
      bankName: selectedClient?.bankName,
      bankAccountNumber: selectedClient?.bankAccountNumber,
      ifscCode: selectedClient?.ifscCode,
      branchName: selectedClient?.branchName,
    });
    console.log("🗺️ Address State Check:", selectedClient?.address);

    if (selectedClient) {
      const stateValue = selectedClient.address?.state || "";
     
      const detailsToSet = {
        name: selectedClient.businessName,
        gstin: selectedClient.gstin || "",
        address: selectedClient.address?.street || "",
        contact: selectedClient.phone || "",
        email: selectedClient.email,
        igstn: selectedClient.gstin || "",
        state: stateValue,
        // Add bank details
        bankName: selectedClient.bankName,
        accountNumber: selectedClient.bankAccountNumber,
        ifscCode: selectedClient.ifscCode,
        branch: selectedClient.branchName,
      };

      console.log("📋 Setting Client Details:", detailsToSet);

      setClientDetails(detailsToSet as any);
    }
  };

  const handleAddNewClient = () => {
    router.push("/finance/clients/create");
  };

  return (
    <div className="relative h-full">
      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-2 text-gray-600">
            Select Client
          </label>
          <Select onValueChange={handleClientSelect} value={clientIdString}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="-- Select Client --" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1">
                <Input
                  placeholder="Search client..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="mb-2 w-full"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              {filteredClients.map((client) => (
                <SelectItem key={client._id} value={client._id}>
                  {client.businessName}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Add New Client</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {clientId && clientId !== "new" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Company Name
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {clientDetails?.name || "-"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                GSTIN
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {clientDetails?.gstin || "-"}
              </div>
            </div>
            {clientDetails?.gstin && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  IGSTN
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {clientDetails.gstin}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                State
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {clientDetails?.state || "-"}
              </div>
            </div>
            {/* Billing Address section: show country if available */}
            {typeof clientDetails.address === "object" &&
              clientDetails.address.country && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Billing Address
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {clientDetails.address.country === "India" && (
                      <span className="font-semibold text-gray-800">IN</span>
                    )}
                  </div>
                </div>
              )}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Contact Person
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {clientDetails?.contact || "-"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {clientDetails?.email || "-"}
              </div>
            </div>
          </div>

          {/* Bank Details Section - Only show in Delivery Challan */}
          {showBankDetails && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-blue-600">🏦</span>
                Bank Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Bank Name
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {(clientDetails as any)?.bankName || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Account Number
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {(clientDetails as any)?.accountNumber || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    IFSC Code
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {(clientDetails as any)?.ifscCode || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Branch
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {(clientDetails as any)?.branch || "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSection;
