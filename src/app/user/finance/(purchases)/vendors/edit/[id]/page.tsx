"use client";
import React, { useState } from "react";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useRouter, useParams } from "next/navigation";
import VendorForm, { VendorFormValues } from "@/finance/vendor/VendorForm";

export default function EditVendorPage() {
  const { id } = useParams();
  const vendorId = String(id);
  const vendors = useVendorStore((state) => state.vendors);
  const updateVendor = useVendorStore((state) => state.updateVendor);
  const vendor = vendors.find((v) => v._id === vendorId);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center text-gray-500 text-xl">
          Vendor not found.
        </div>
      </div>
    );
  }

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
    uniqueKey: Date.now().toString(),
    email: vendor.email || "",
    showEmail: vendor.showEmail || false,
    contact: vendor.contact || "",
    phone: vendor.phone || "",
    showPhone: vendor.showPhone || false,
    address: vendor.address
      ? `${vendor.address.streetAddress || ""}, ${vendor.address.city || ""}, ${
          vendor.address.state || ""
        }`.trim()
      : "",
    customFields: [],
    bankAccounts:
      vendor.bankAccounts?.map((ba, idx) => ({
        id: `${idx}`,
        bankName: ba.bankName,
        accountNumber: ba.accountNumber,
        ifsc: ba.ifsc,
        branch: ba.branch,
        accountType: ba.accountType,
      })) || [],
    attachments: vendor.attachments ? [...vendor.attachments] : [],
  };

  const handleSubmit = async (values: VendorFormValues) => {
    setSubmitting(true);
    try {
      await updateVendor(vendor._id, values as any);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setSubmitting(false);
        router.push("/dashboard/vendors");
      }, 1200);
    } catch (error) {
      console.error("Error updating vendor:", error);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 ">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">
          Edit Vendor
        </h1>
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
