"use client";

import React, { useState, useEffect, useMemo } from "react";
import SalesOrderForm, {
  SalesOrderFormValues,
} from "@/components/finance/salesOrder/SalesOrderForm";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItems } from "@/hooks/useItemQueries";
import { useSalesOrderStore } from "@/stores/financeStore/useSalesOrderStore";
import { useRouter } from "next/navigation";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { CreateSalesOrderPayload } from "@/api/finance/salesOrderApi";
import { toast } from "sonner";

const generateOrderNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `SO-${datePart}-${randomPart}`;
};

export default function CreateSalesOrderPage() {
  const router = useRouter();
  const { clients } = useClientStore();
  const { user } = useAuthStore();
  const { details } = useBussinessStore();
  const {
    createSalesOrder,
    previewOrderNumber,
    saveDraft,
    getDraft,
    clearDraft,
    fetchSalesOrders,
    setCompanyId,
  } = useSalesOrderStore();

  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [formValues, setFormValues] =
    useState<SalesOrderFormValues | null>(null);

  /**
   * ✅ FIXED: Pass companyId
   */
  const { data: itemsData } = useItems(user?.companyId ?? "", {
    enabled: !!user?.companyId,
  });

  const items = itemsData?.result?.items || [];

  /**
   * Optional: If your form expects price field
   */
  const mappedProducts = useMemo(() => {
    return items.map((item: any) => ({
      ...item,
      price: item.sellingPrice,
    }));
  }, [items]);


  //console.log("mapperProducts....98767890",mappedProducts)

  /**
   * Fetch order number
   */
  useEffect(() => {
    const fetchOrderNumber = async () => {
      if (!user?.companyId) {
        setOrderNumber(generateOrderNumber());
        return;
      }

      try {
        const number = await previewOrderNumber(user.companyId);
        setOrderNumber(number);
      } catch {
        setOrderNumber(generateOrderNumber());
      }
    };

    fetchOrderNumber();
  }, [previewOrderNumber, user?.companyId]);

  /**
   * Draft handling
   */
  const loadedDraft = getDraft();

  useEffect(() => {
    if (loadedDraft) {
      toast.info("Draft loaded from previous session");
    }
  }, [loadedDraft]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (formValues) {
        saveDraft(formValues);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formValues, saveDraft]);

  const mappedBusinessDetails = {
    name: details?.businessName || "",
    gstin: details?.gstNumber || "",
    address: details?.website || "",
    contact: details?.phone || "",
    email: "",
  };

  const defaultInitialValues: SalesOrderFormValues = loadedDraft
    ? {
        ...loadedDraft,
        orderNumber: orderNumber || generateOrderNumber(),
      }
    : {
        type: "salesOrder",
        orderTitle: "",
        orderNumber: orderNumber || generateOrderNumber(),
        orderDate: new Date().toISOString().slice(0, 10),
        deliveryDate: "",
        clientId: "",
        clientDetails: {
          name: "",
          gstin: "",
          address: "",
          contact: "",
          email: "",
        },
        businessDetails: mappedBusinessDetails,
        taxType: "IGST",
        cessList: [],
        items: [
          {
            itemId:"",
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
        signature:""
      };

  const handleCreate = async (values: SalesOrderFormValues) => {
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

      if (!user?.companyId) {
        toast.error("Company ID not found");
        return;
      }

      //console.log(".....nbgfrijcdhbgydsc........dcnhbdcgdgc....",values.items)


      const sanitizedItems = values.items.map((item: any) => ({
        itemId: item.itemId || item._id,
        name: item.name,
        description: item.description || "",
        quantity: Number(item.qty),
        rate: Number(item.rate),
        taxRate: Number(item.igst || item.taxRate || 0),
        discount: Number(item.discount || 0),
        hsn: item.hsn || "",
        unit: item.unit || "pcs",
      }));

      //console.log("SanitizedItems",sanitizedItems)

      const payload: CreateSalesOrderPayload = {
        clientId: values.clientId,
        orderDate: values.orderDate,
        expectedDeliveryDate: values.deliveryDate || undefined,
        items: sanitizedItems,
        terms: values.terms || undefined,
        notes: values.notes || undefined,
        status: "draft",
        signature:values.signature,
        showSignature:values.showSignature
      };

     const res =  await createSalesOrder(payload, user.companyId);
      clearDraft();
      setCompanyId(user.companyId);
      await fetchSalesOrders();

      toast.success("Sales Order created successfully");

      router.push(`/finance/sales-orders/preview/${res.id || res._id}`);
    } catch (error: any) {
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Error creating sales order"
      );
    } finally {
      setLoading(false);
    }
  };



  //console.log("Sales Order",items)
  return (
    <SalesOrderForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockClients={clients}
      mockProducts={mappedProducts}
      loading={loading}
    />
  );
}
