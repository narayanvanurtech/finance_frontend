"use client";

import React, { useState, useEffect } from "react";
import SalesOrderForm, {
  SalesOrderFormValues,
} from "@/components/finance/salesOrder/SalesOrderForm";
import { useSalesOrderStore } from "@/stores/financeStore/useSalesOrderStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItems } from "@/hooks/useItemQueries";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import { toast } from "sonner";
import { getAllItems } from "@/api/finance/itemApi";

export default function EditSalesOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { clients } = useClientStore();
  const businessDetails = useBussinessStore((s) => s.details);
const { data: itemsData, isLoading: itemsLoading } = useItems(
  user?.companyId ?? "",
  {
    enabled: !!user?.companyId,   // 🚀 prevents empty API call
  }
);

const items = itemsData?.result?.items || [];
  const [allCategory ,setAllCategory]=useState([])
  const { currentSalesOrder, fetchSalesOrderById, updateSalesOrder } =
    useSalesOrderStore();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] =
    useState<SalesOrderFormValues | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("");

  // Get sales order ID from URL
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;


  console.log("Company Id Mcnn39874637",user?.companyId)

  // Fetch sales order data
  useEffect(() => {
    const fetchData = async () => {
      if (orderId && user?.companyId) {
        try {
          const order = await fetchSalesOrderById(orderId, user.companyId);

          console.log("🔍 Raw API Response:", order);

          if (order) {
            // Track the order status
            setOrderStatus(order.status || "draft");

            // Extract client info from nested clientId object
            const client: any = order.clientId || {};
            const clientAddress: any =
              typeof client.address === "object" ? client.address : {};

            // Get business details from store or API
            const businessData =
              order.businessDetails ||
              (businessDetails
                ? {
                    name: businessDetails.businessName || "",
                    gstin: businessDetails.gstNumber || "",
                    address: businessDetails.website || "",
                    contact: businessDetails.phone || "",
                    email: "",
                    state: businessDetails.state || "",
                  }
                : {
                    name: "",
                    gstin: "",
                    address: "",
                    contact: "",
                    email: "",
                    state: "",
                  });

            setInitialValues({
              type: "salesOrder",
              orderTitle:
                (order as any).salesOrderTitle ||
                order.orderTitle ||
                "Sales Order",
              orderNumber:
                (order as any).salesOrderNumber || order.orderNumber || "",
              orderDate:
                order.orderDate?.split("T")[0] ||
                new Date().toISOString().slice(0, 10),
              deliveryDate:
                (order as any).expectedDeliveryDate?.split("T")[0] ||
                order.deliveryDate?.split("T")[0] ||
                "",
              clientId:
                typeof order.clientId === "string"
                  ? order.clientId
                  : client._id || client.id || "",
              clientDetails: {
                name:
                  order.clientDetails?.name ||
                  client.businessName ||
                  client.name ||
                  "",
                gstin: order.clientDetails?.gstin || client.gstin || "",
                address:
                  order.clientDetails?.address ||
                  clientAddress.street ||
                  (typeof client.address === "string" ? client.address : "") ||
                  "",
                contact:
                  order.clientDetails?.contact ||
                  client.phone ||
                  client.contact ||
                  "",
                email: order.clientDetails?.email || client.email || "",
              },
              businessDetails: {
                name: businessData.name || "",
                gstin: businessData.gstin || "",
                address: businessData.address || "",
                contact: businessData.contact || "",
                email: businessData.email || "",
                state:
                  (businessData as any).state ||
                  (businessDetails as any)?.state ||
                  "",
              },
              taxType:
                order.taxType === "inclusive" || order.taxType === "exclusive"
                  ? order.taxType
                  : "exclusive",
              cessList: (order.cessList || []).map((cess: any) => ({
                name: cess.name,
                rate: cess.rate,
                showInInvoice: cess.showInInvoice,
                type: "cess" as const,
              })),
              items:
                order.items?.map((item: any) => {
                  // Determine tax configuration based on taxType
                  const taxType = item.taxType || "none";
                  let igst = 0;
                  let cgst = 0;
                  let sgst = 0;
                  let taxRate = item.taxRate || 0;

                  if (taxType === "igst") {
                    igst = taxRate;
                  } else if (taxType === "cgst_sgst") {
                    cgst = taxRate / 2;
                    sgst = taxRate / 2;
                  }

                  return {
                    itemId: item.itemId || "",
                    name: item.name || "",
                    description: item.description || "",
                    qty: item.quantity || 0,
                    rate: item.rate || 0,
                    discount: item.discount || 0,
                    taxRate: taxRate,
                    taxType: taxType,
                    igst: igst,
                    sgst: sgst,
                    cgst: cgst,
                    amount: item.amount || 0,
                    hsn: item.hsn || "",
                    unit: item.unit || "pcs",
                  };
                }) || [],
              discountType:
                order.discountType === "percent" ? "percent" : "flat",
              discountValue: order.discountValue || 0,
              shipping: order.shipping || 0,
              roundOff: order.roundOff === true,
              showHSN: order.showHSN === true,
              showUnit: order.showUnit === true,
              terms: order.terms || "dueOnReceipt",
              notes: order.notes || "",
              attachments: [],
              showSignature: order.showSignature === true,
              signature:order.signature
            });

            console.log("✅ Initial Values Set");
          }
        } catch (error) {
          console.error("❌ Fetch Error:", error);
          toast.error("Failed to load sales order");
          router.push("/finance/sales-orders");
        }
      }
    };

    fetchData();
  }, [orderId, user?.companyId, fetchSalesOrderById, router]);


  const handleUpdate = async (values: SalesOrderFormValues) => {
    if (!user?.companyId) {
      toast.error("Company ID is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderTitle: values.orderTitle,
        orderDate: values.orderDate,
        deliveryDate: values.deliveryDate,
        clientId: values.clientId,
        clientDetails: values.clientDetails,
        businessDetails: values.businessDetails,
        taxType: values.taxType,
        cessList: values.cessList?.map((cess: any) => ({
          name: cess.name,
          rate: cess.rate,
          showInInvoice: cess.showInInvoice,
        })),
        items: values.items.map((item: any) => ({
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          quantity: item.qty,
          rate: item.rate,
          discount: item.discount,
          taxRate: item.taxRate || item.igst || 0,
          taxType: item.taxType || "none",
          hsn: item.hsn,
          unit: item.unit,
        })),
        discountType:
          values.discountType === "percent" ||
          values.discountType === "percentage"
            ? ("percent" as const)
            : ("flat" as const),
        discountValue: values.discountValue,
        shipping: values.shipping,
        roundOff: values.roundOff,
        showHSN: values.showHSN,
        showUnit: values.showUnit,
        terms: values.terms,
        notes: values.notes,
        showSignature: values.showSignature,
        signature:values.signature
      };

      await updateSalesOrder(orderId, user.companyId, payload);
      toast.success("Sales order updated successfully");
      router.push("/finance/sales-orders");
    } catch (error) {
      console.error("❌ Update Error:", error);
      toast.error("Failed to update sales order");
    } finally {
      setLoading(false);
    }
  };

  if (!initialValues) {
    return <div className="p-8 text-center">Loading sales order...</div>;
  }

  // Check if order status is one that should disable editing
  const isEditDisabled =
    orderStatus === "cancelled" ||
    orderStatus === "delivered" ||
    orderStatus === "shipped";

  return (
    <SalesOrderForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
      disabled={isEditDisabled}
    />
  );
}
