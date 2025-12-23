"use client";

import React, { useState, useEffect } from "react";
import DeliveryChallanForm, {
  DeliveryChallanFormValues,
} from "@/components/finance/deliveryChallan/DeliveryChallanForm";
import { useDeliveryChallanStore } from "@/stores/financeStore/useDeliveryChallanStore";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useRouter } from "next/navigation";
import { useItems } from "@/hooks/useItemQueries";



const generateChallanNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `DC-${datePart}-${randomPart}`;
};

export default function CreateDeliveryChallanPage() {
  const { clients } = useClientStore();
  const { details } = useBussinessStore();
  const { user } = useAuthStore();
  const { data: itemsData } = useItems(user?.companyId || "");
  const items = itemsData?.result?.items || [];
  const createChallan = useDeliveryChallanStore((state) => state.createChallan);
  const setCompanyId = useDeliveryChallanStore((state) => state.setCompanyId);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const businessStoreDetails = details;

  // Set companyId when component mounts
  useEffect(() => {
    if (user?.companyId) {
      setCompanyId(user.companyId);
    }
  }, [user?.companyId, setCompanyId]);

  // if (!businessStoreDetails) {
  //   return <div>Loading business details...</div>;
  // }

  const mappedBusinessDetails = {
    name: businessStoreDetails?.businessName || "",
    gstin: businessStoreDetails?.gstNumber || "",
    address: businessStoreDetails?.website || "",
    contact: businessStoreDetails?.phone || "",
    email: "",
  };

  const defaultInitialValues: DeliveryChallanFormValues = {
    quotationTitle: "",
    quotationNumber: generateChallanNumber(),
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    clientId: "",
    clientDetails: {
      name: "",
      gstin: "",
      address: "",
      contact: "",
      email: "",
    },
    businessDetails: mappedBusinessDetails,
    taxType: "exclusive",
    taxConfiguration: "SGST_CGST",
    cessList: [],
    items: [
      {
        name: "",
        description: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        igst: 0,
        sgst: 0,
        cgst: 0,
        amount: 0,
        hsn: "",
        unit: "pcs",
      },
    ],
    discountType: "flat",
    discountValue: 0,
    shipping: 0,
    roundOff: false,
    showHSN: false,
    showUnit: false,
    terms: "",
    notes: "",
    attachments: [],
    showSignature: false,
    phases: [],
  };

  const handleCreate = async (values: DeliveryChallanFormValues) => {
    if (!user?.companyId) {
      return;
    }

    setLoading(true);
    try {
      // Ensure companyId is set before creating
      setCompanyId(user.companyId);
      await createChallan(values);
      router.push("/finance/delivery-challans");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeliveryChallanForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
    />
  );
}
