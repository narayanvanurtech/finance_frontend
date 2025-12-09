"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useRouter, useParams } from "next/navigation";
import VendorForm, { VendorFormValues } from "@/components/finance/vendor/VendorForm";

export default function EditVendorPage() {
  const { id } = useParams();
  const vendorId = id as string;
  const { selectedVendor, loading, error, getVendorById, updateVendor, clearError } = useVendorStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (vendorId) {
      clearError();
      getVendorById(vendorId).finally(() => setIsLoading(false));
    }
  }, [vendorId, getVendorById, clearError]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
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

  if (error || !selectedVendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">
            {error || "Vendor not found."}
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

  const vendor = selectedVendor;

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
    address: vendor.address ? 
      `${vendor.address.streetAddress || ""}, ${vendor.address.city || ""}, ${vendor.address.state || ""}, ${vendor.address.country || ""}`.replace(/^[, ]+|[, ]+$/g, '') 
      : "",
    customFields: [],
    bankAccounts: vendor.bankAccounts?.map(account => ({
      id: Math.random().toString(36),
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      ifsc: account.ifsc,
      branch: account.branch,
      accountType: account.accountType
    })) || [],
    attachments: vendor.attachments || [],
  };

  const handleSubmit = async (values: VendorFormValues) => {
    setSubmitting(true);
    setFormError(null);
    try {
      // Transform the form values to match the API payload structure
      const vendorPayload = {
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
        taxTreatment: values.taxTreatment as "Registered Business" | "Unregistered Business" | "Consumer" | "Overseas",
        address: {
          country: values.country,
          state: values.state,
          city: values.city,
          postalCode: values.postalCode,
          streetAddress: values.streetAddress,
        },
        bankAccounts: values.bankAccounts?.map(account => ({
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          ifsc: account.ifsc,
          branch: account.branch,
          accountType: account.accountType as "Savings" | "Current" | "Other"
        })),
        attachments: values.attachments
      };

      await updateVendor(vendor._id, vendorPayload);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setSubmitting(false);
        router.push("/finance/vendors");
      }, 1200);
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      setFormError(error.message || 'Failed to update vendor. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white p-10">
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
          <h1 className="text-3xl font-bold text-center tracking-tight flex-1">Edit Vendor</h1>
        </div>
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm font-medium">
              {formError}
            </div>
          </div>
        )}
        <VendorForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={submitting ? "Updating..." : "Update"}
          loading={submitting}
          onCancel={() => router.back()}
        />
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-base font-medium transition-all">
            Vendor updated successfully!
          </div>
        )}
      </div>
    </div>
  );
}
