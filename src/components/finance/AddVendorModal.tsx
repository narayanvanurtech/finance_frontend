import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import VendorForm, {
  VendorFormValues,
} from "@/components/finance/vendor/VendorForm";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { Button } from "@/components/ui/button";
import type { CreateVendorPayload } from "@/api/finance/vendorApi";

interface AddVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddVendorModal({
  open,
  onOpenChange,
  onSuccess,
}: AddVendorModalProps) {
  const createVendor = useVendorStore((state) => state.createVendor);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    await createVendor(values as CreateVendorPayload);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setSubmitting(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vendor</DialogTitle>
        </DialogHeader>
        <VendorForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={submitting ? "Saving..." : "Save"}
          loading={submitting}
          onCancel={() => onOpenChange(false)}
        />
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-base font-medium transition-all">
            Vendor created successfully!
          </div>
        )}
        <DialogClose asChild>
          <Button variant="outline" className="mt-4 w-full">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
