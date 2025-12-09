"use client";
import React, { useState } from "react";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useRouter } from "next/navigation";
import VendorForm, { VendorFormValues } from "@/components/finance/vendor/VendorForm";

export default function CreateVendorPage() {
  const createVendor = useVendorStore((state) => state.createVendor);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues: VendorFormValues = {
    name: "",
    industry: "",
    country: "India",
    state: "",
    city: "",
    postalCode: "",
    streetAddress: "",
    gstin: "",
    panNumber: "",
    gstType: "",
    taxTreatment: "",
    vendorType: "Individual",
    displayName: "",
    uniqueKey: Date.now().toString(),
    email: "",
    showEmail: false,
    contact: "",
    phone: "",
    showPhone: false,
    address: "",
    customFields: [],
    bankAccounts: [],
    attachments: [],
  };

  const handleSubmit = async (values: VendorFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      // Transform the form values to match the API payload structure
      const vendorPayload = {
        name: values.name,
        displayName: values.displayName,
        vendorType: values.vendorType,
        industry: values.industry,
        email: values.email, // Required field
        showEmail: values.showEmail || false,
        phone: values.phone, // Required field
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

      await createVendor(vendorPayload);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setSubmitting(false);
        router.push("/finance/vendors");
      }, 1200);
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      setError(error.message || 'Failed to create vendor. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 ">
      <div className="w-full max-w-5xl bg-white p-10">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">Create Vendor</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm font-medium">
              {error}
            </div>
          </div>
        )}
        <VendorForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={submitting ? "Saving..." : "Save"}
          loading={submitting}
          onCancel={() => router.back()}
        />
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-base font-medium transition-all">
            Vendor created successfully!
          </div>
        )}
      </div>
    </div>
  );
} 