"use client";

import React, { useState, useEffect, useMemo } from "react";
import InvoiceForm, {
  InvoiceFormValues,
} from "@/components/finance/invoice/InvoiceForm";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItems } from "@/hooks/useItemQueries";
import { useRouter } from "next/navigation";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { toast } from "sonner";
import { useInvoiceStore } from "@/stores/financeStore/useInvoiceStore";
import type { Item } from "@/api/finance/itemApi";

const generateInvoiceNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `INV-${datePart}-${randomPart}`;
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const { clients } = useClientStore();
  const { user } = useAuthStore();
  const { details } = useBussinessStore();
  const createInvoice = useInvoiceStore((state) => state.createInvoice);

  const [loading, setLoading] = useState(false);

  /**
   * ✅ Fetch items using companyId
   * Only runs when user.companyId exists
   */
  const { data: itemsData } = useItems(user?.companyId ?? "", {
    enabled: !!user?.companyId,
  });

  const items: Item[] = itemsData?.result?.items || [];

  /**
   * ✅ Map products for InvoiceForm
   */
  const mappedProducts = useMemo(() => {
    return items.map((item: Item) => ({
      ...item,
      price: item.sellingPrice,
    }));
  }, [items]);

  /**
   * ✅ Initial Item Row
   */
  const [initialItems, setInitialItems] = useState<
    InvoiceFormValues["items"]
  >([
    {
      name: "",
      description: "",
      qty: 1,
      rate: 0,
      discount: 0,
      igst: 0,
      sgst: 0,
      cgst: 0,
      amount: 0,
      hsn: "",
      unit: "pcs",
    },
  ]);

  /**
   * ✅ Load bulk items from localStorage (if any)
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const bulkItems = localStorage.getItem("bulkInvoiceItems");

    if (bulkItems) {
      try {
        const parsed = JSON.parse(bulkItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInitialItems(
            parsed.map((item: any) => ({
              name: item.name || "",
              description: item.description || "",
              qty: 1,
              rate: item.sellingPrice || 0,
              discount: 0,
              igst: 0,
              sgst: 0,
              cgst: 0,
              amount: 0,
              hsn: item.hsn || "",
              unit: item.unit || "pcs",
            }))
          );
        }
      } catch {
        // ignore parsing errors
      }

      localStorage.removeItem("bulkInvoiceItems");
    }
  }, []);

  /**
   * ✅ Map business details safely
   */
  const mappedBusinessDetails = {
    name: details?.businessName || "",
    gstin: details?.gstNumber || "",
    address: details?.website || "",
    contact: details?.phone || "",
    email: "",
  };

  /**
   * ✅ Default form values
   */
  const defaultInitialValues: InvoiceFormValues = {
    type: "invoice",
    invoiceTitle: "",
    invoiceNumber: generateInvoiceNumber(),
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
    items: initialItems,
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
    signature:"",
    phases: [],
  };

  /**
   * ✅ Handle Create Invoice
   */
  const handleCreate = async (values: InvoiceFormValues) => {
    setLoading(true);

    try {
      if (!values.clientId?.trim()) {
        toast.error("Please select a client");
        return;
      }

      if (!values.items?.length) {
        toast.error("Please add at least one item");
        return;
      }

      const sanitizedItems = values.items.map((item: any) => ({
        ...item,
        qty: Number(item.qty) || 0,
        rate: Number(item.rate) || 0,
        discount: Number(item.discount) || 0,
        igst: Number(item.igst) || 0,
        sgst: Number(item.sgst) || 0,
        cgst: Number(item.cgst) || 0,
        amount: Number(item.amount) || 0,
        taxRate: Number(item.taxRate) || 0,
      }));

      const payload: InvoiceFormValues = {
        ...values,
        items: sanitizedItems,
        discountValue: Number(values.discountValue) || 0,
        shipping: Number(values.shipping) || 0,
      };

     const res =  await createInvoice(payload);

      toast.success(res.message)
      router.push(`/finance/invoices/preview/${res.data.id}`);
    } catch (error: any) {
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Error creating invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <InvoiceForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockClients={clients}
      mockProducts={mappedProducts}
      loading={loading}
    />
  );
}
