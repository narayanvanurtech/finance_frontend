"use client";
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import VendorForm, {
  VendorFormValues,
} from "@/components/finance/vendor/VendorForm";
import { useGetVendorById, useUpdateVendor } from "@/hooks/useVendorQueries";
import { UpdateVendorPayload } from "@/api/finance/vendorApi";

export default function EditVendorPage() {
  const { id } = useParams();
  const vendorId = id as string;
  const router = useRouter();

  const [formError, setFormError] = useState<string | null>(null);

  // Fetch vendor data using React Query
  const {
    data: vendorResponse,
    isLoading,
    isError,
    error: fetchError,
  } = useGetVendorById(vendorId);

  // Update vendor mutation
  const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse space-y-4 w-full max-w-5xl mx-auto p-10">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !vendorResponse?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">
            {fetchError?.message || "Vendor not found."}
          </div>
          <button
            onClick={() => router.push("/finance/vendors")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  const vendor = vendorResponse.result;

  const initialValues: VendorFormValues = {
    name: vendor.name || "",
    industry: vendor.industry || "",
    country: vendor.address?.country || "India",
    state: vendor.address?.state || "",
    city: vendor.address?.city || "",
    postalCode: vendor.address?.postalCode || "",
    streetAddress: vendor.address?.streetAddress || "",
    gstin: vendor.gstin || "",
    panNumber: vendor.panNumber || "",
    gstType: vendor.gstType || "",
    taxTreatment: vendor.taxTreatment || "",
    vendorType: vendor.vendorType || "Individual",
    displayName: vendor.displayName || "",
    uniqueKey: vendor._id,
    email: vendor.email || "",
    showEmail: vendor.showEmail || false,
    contact: vendor.contact || "",
    phone: vendor.phone || "",
    showPhone: vendor.showPhone || false,
    address: vendor.address
      ? `${vendor.address.streetAddress || ""}, ${vendor.address.city || ""}, ${
          vendor.address.state || ""
        }, ${vendor.address.country || ""}`.replace(/^[, ]+|[, ]+$/g, "")
      : "",
    customFields: [],
    bankAccounts:
      vendor.bankAccounts?.map((account) => ({
        id: Math.random().toString(36),
        accountHolderName: account.accountHolderName || "",
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        ifsc: account.ifsc,
        branch: account.branch || "",
        accountType: account.accountType,
      })) || [],
    attachments: vendor.attachments || [],
  };

  const handleSubmit = async (values: VendorFormValues) => {
    setFormError(null);

    try {
      // Transform the form values to match the API payload structure
      const vendorPayload: UpdateVendorPayload = {
        name: values.name,
        displayName: values.displayName,
        vendorType: values.vendorType,
        industry: values.industry,
        email: values.email,
        showEmail: values.showEmail || false,
        phone: values.phone,
        contact: values.contact,
        showPhone: values.showPhone || false,
        gstin: values.gstin,
        gstType: values.gstType,
        panNumber: values.panNumber,
        taxTreatment: values.taxTreatment as
          | "Registered Business"
          | "Unregistered Business"
          | "Consumer"
          | "Overseas",
        address: {
          country: values.country,
          state: values.state,
          city: values.city,
          postalCode: values.postalCode,
          streetAddress: values.streetAddress,
        },
        bankAccounts: values.bankAccounts?.map((account) => ({
          accountHolderName: account.accountHolderName,
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          ifsc: account.ifsc,
          branch: account.branch,
          accountType: account.accountType as "Savings" | "Current" | "Other",
        })),
        attachments: values.attachments,
      };

      updateVendor(
        { vendorId: vendor._id, data: vendorPayload },
        {
          onSuccess: () => {
            router.push("/finance/vendors");
          },
          onError: (error: any) => {
            console.error("Error updating vendor:", error);
            setFormError(
              error?.response?.data?.message ||
                error.message ||
                "Failed to update vendor. Please try again."
            );
          },
        }
      );
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      setFormError(
        error.message || "Failed to update vendor. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-10">
        <div className="flex items-center mb-6">
          <Button
            type="button"
            onClick={() => router.push("/finance/vendors")}
            variant="outline"
            size="sm"
            className="flex items-center mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex-1">
            Edit Vendor
          </h1>
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm font-medium">{formError}</div>
          </div>
        )}

        <VendorForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={isUpdating ? "Updating..." : "Update Vendor"}
          loading={isUpdating}
          onCancel={() => router.push("/finance/vendors")}
        />
      </div>
    </div>
  );
}
