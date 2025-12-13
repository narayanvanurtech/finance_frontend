"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorForm, {
  VendorFormValues,
} from "@/components/finance/vendor/VendorForm";
import { useCreateVendor } from "@/hooks/useVendorQueries";
import { CreateVendorPayload } from "@/api/finance/vendorApi";

export default function CreateVendorPage() {
  const router = useRouter();

  const [showToast, setShowToast] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Create vendor mutation using React Query
  const { mutate: createVendor, isPending: isCreating } = useCreateVendor();

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
    setFormError(null);

    try {
      // Transform the form values to match the API payload structure
      const vendorPayload: CreateVendorPayload = {
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

      createVendor(vendorPayload, {
        onSuccess: () => {
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            router.push("/finance/vendors");
          }, 1200);
        },
        onError: (error: any) => {
          console.error("Error creating vendor:", error);
          setFormError(
            error?.response?.data?.message ||
              error.message ||
              "Failed to create vendor. Please try again."
          );
        },
      });
    } catch (error: any) {
      console.error("Error creating vendor:", error);
      setFormError(
        error.message || "Failed to create vendor. Please try again."
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
            Create Vendor
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
          submitLabel={isCreating ? "Creating..." : "Create Vendor"}
          loading={isCreating}
          onCancel={() => router.push("/finance/vendors")}
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
