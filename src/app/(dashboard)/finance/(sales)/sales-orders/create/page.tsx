"use client";

import React, { useState, useEffect } from "react";
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
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `SO-${datePart}-${randomPart}`;
};

export default function CreateSalesOrderPage() {
  const { clients } = useClientStore();
  const { data: itemsData } = useItems("");
  const items = itemsData?.result?.items || [];
  const {
    createSalesOrder,
    previewOrderNumber,
    saveDraft,
    getDraft,
    clearDraft,
    fetchSalesOrders, // Add this to refetch after creation
    setCompanyId, // Add this to ensure companyId is set
  } = useSalesOrderStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { details } = useBussinessStore();
  const [orderNumber, setOrderNumber] = useState("");
  const [formValues, setFormValues] = useState<SalesOrderFormValues | null>(
    null
  );

  // Fetch order number on component mount
  useEffect(() => {
    const fetchOrderNumber = async () => {
      if (!user?.companyId) {
        // Fallback to manual generation if no companyId
        setOrderNumber(generateOrderNumber());
        return;
      }

      try {
        const number = await previewOrderNumber(user.companyId);
        setOrderNumber(number);
      } catch (error: any) {
        console.error("❌ API ERROR:", error);
        console.log("❌ API RESPONSE:", error.response?.data);
        console.log("❌ API STATUS:", error.response?.status);
        // Fallback to manual generation
        setOrderNumber(generateOrderNumber());
      }
    };

    fetchOrderNumber();
  }, [previewOrderNumber, user?.companyId]);

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      toast.info("Draft loaded from previous session");
    }
  }, [getDraft]);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (formValues) {
        // Save entire form state for draft
        saveDraft(formValues);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formValues, saveDraft]);

  const mappedBusinessDetails = {
    name: details?.businessName || "",
    gstin: details?.gstNumber || "",
    address: details?.website || "",
    contact: details?.phone || "",
    email: "",
  };

  // Load draft on mount and merge with initial values
  const loadedDraft = getDraft();

  const defaultInitialValues: SalesOrderFormValues = loadedDraft
    ? {
        type: "salesOrder",
        orderTitle: loadedDraft.orderTitle || "",
        orderNumber: orderNumber || generateOrderNumber(),
        orderDate:
          loadedDraft.orderDate || new Date().toISOString().slice(0, 10),
        deliveryDate: loadedDraft.deliveryDate || "",
        clientId: loadedDraft.clientId || "",
        clientDetails: {
          name: loadedDraft.clientDetails?.name || "",
          gstin: loadedDraft.clientDetails?.gstin || "",
          address: loadedDraft.clientDetails?.address || "",
          contact: loadedDraft.clientDetails?.contact || "",
          email: loadedDraft.clientDetails?.email || "",
        },
        businessDetails: {
          name: loadedDraft.businessDetails?.name || mappedBusinessDetails.name,
          gstin:
            loadedDraft.businessDetails?.gstin || mappedBusinessDetails.gstin,
          address:
            loadedDraft.businessDetails?.address ||
            mappedBusinessDetails.address,
          contact:
            loadedDraft.businessDetails?.contact ||
            mappedBusinessDetails.contact,
          email:
            loadedDraft.businessDetails?.email || mappedBusinessDetails.email,
        },
        taxType: loadedDraft.taxType || "IGST",
        cessList: [],
        items: loadedDraft.items || [
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
        ],
        discountType:
          loadedDraft.discountType === "percent" ? "percent" : "flat",
        discountValue: loadedDraft.discountValue || 0,
        shipping: loadedDraft.shipping || 0,
        roundOff: loadedDraft.roundOff || false,
        showHSN: loadedDraft.showHSN || false,
        showUnit: loadedDraft.showUnit || false,
        terms: loadedDraft.terms || "",
        notes: loadedDraft.notes || "",
        attachments: [],
        showSignature: loadedDraft.showSignature || false,
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
      };

  const handleCreate = async (values: SalesOrderFormValues) => {
    setLoading(true);
    try {
      // Validate clientId
      if (!values.clientId || values.clientId.trim() === "") {
        toast.error("Please select a client");
        setLoading(false);
        return;
      }
      // Validate items
      if (!values.items || values.items.length === 0) {
        toast.error("Please add at least one item");
        setLoading(false);
        return;
      }

      if (!user?.companyId) {
        toast.error("Company ID not found");
        setLoading(false);
        return;
      }

      // Sanitize items - Map to backend expected format
      const sanitizedItems = values.items.map((item: any) => ({
        itemId: item.itemId || item._id || undefined,
        name: item.name,
        description: item.description || "",
        quantity: Number(item.qty),
        rate: Number(item.rate),
        taxRate: Number(item.igst || item.taxRate || 0),
        discount: Number(item.discount || 0),
        hsn: item.hsn || "",
        unit: item.unit || "pcs",
      }));

      // Get client details for shipping address
      const selectedClient = clients.find(
        (c: any) => String(c.id || c._id) === values.clientId
      );

      // Create payload matching backend structure
      const payload: CreateSalesOrderPayload = {
        clientId: values.clientId,
        orderDate: values.orderDate,
        expectedDeliveryDate: values.deliveryDate || undefined,
        items: sanitizedItems,
        shippingAddress: selectedClient?.address
          ? {
              street:
                typeof selectedClient.address === "string"
                  ? selectedClient.address
                  : selectedClient.address.street || "N/A",
              city:
                typeof selectedClient.address === "string"
                  ? "N/A"
                  : selectedClient.address.city || "N/A",
              state:
                typeof selectedClient.address === "string"
                  ? "N/A"
                  : selectedClient.address.state || "N/A",
              country:
                typeof selectedClient.address === "string"
                  ? "India"
                  : selectedClient.address.country || "India",
              zipCode:
                typeof selectedClient.address === "string"
                  ? "000000"
                  : selectedClient.address.postalCode || "000000",
            }
          : undefined,
        terms: values.terms || undefined,
        notes: values.notes || undefined,
        status: "draft",
      };

      // API will create sales order with companyId in query param
      const createdOrder = await createSalesOrder(payload, user.companyId);

      console.log("✅ Sales Order Created:", createdOrder);

      // Clear draft after successful creation
      clearDraft();

      // Ensure companyId is set in store
      setCompanyId(user.companyId);

      // Refetch the sales orders list before navigation to ensure fresh data
      await fetchSalesOrders();

      toast.success("Sales Order created successfully");

      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        router.push("/finance/sales-orders");
      }, 100);
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

  // Handle form value changes for auto-save
  const handleFormChange = (values: SalesOrderFormValues) => {
    setFormValues(values);
  };

  // if (!orderNumber) {
  //   return <div>Loading...</div>;
  // }

  return (
    <SalesOrderForm
      initialValues={defaultInitialValues}
      onSubmit={handleCreate}
      mode="create"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
    />
  );
}
