"use client";

import React, { useState, useEffect } from "react";
import SalesOrderForm, {
  SalesOrderFormValues,
} from "@/components/finance/salesOrder/SalesOrderForm";
import { useSalesOrderStore } from "@/stores/financeStore/useSalesOrderStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItemStore } from "@/stores/financeStore/useItemStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { toast } from "sonner";

export default function EditSalesOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { clients } = useClientStore();
  const { items } = useItemStore();
  const { currentSalesOrder, fetchSalesOrderById, updateSalesOrder } =
    useSalesOrderStore();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] =
    useState<SalesOrderFormValues | null>(null);

  // Get sales order ID from URL
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Fetch sales order data
  useEffect(() => {
    const fetchData = async () => {
      if (orderId && user?.companyId) {
        try {
          const order = await fetchSalesOrderById(orderId, user.companyId);
          if (order) {
            setInitialValues({
              type: "salesOrder",
              orderTitle:
                order.orderTitle || (order as any).salesOrderTitle || "",
              orderNumber:
                (order as any).salesOrderNumber || order.orderNumber || "",
              orderDate:
                order.orderDate?.split("T")[0] ||
                new Date().toISOString().slice(0, 10),
              deliveryDate:
                order.deliveryDate?.split("T")[0] ||
                (order as any).expectedDeliveryDate?.split("T")[0] ||
                "",
              clientId:
                typeof order.clientId === "string"
                  ? order.clientId
                  : (order.clientId as any)?._id ||
                    (order.clientId as any)?.id ||
                    "",
              clientDetails: {
                name:
                  order.clientDetails?.name ||
                  (order as any).client?.businessName ||
                  (typeof order.clientId === "object" &&
                    (order.clientId as any)?.email) ||
                  "",
                gstin:
                  order.clientDetails?.gstin ||
                  (order as any).client?.gstin ||
                  "",
                address:
                  order.clientDetails?.address ||
                  (order as any).client?.address?.street ||
                  "",
                contact:
                  order.clientDetails?.contact ||
                  (order as any).client?.phone ||
                  "",
                email:
                  order.clientDetails?.email ||
                  (order as any).client?.email ||
                  "",
              },
              businessDetails: {
                name: order.businessDetails?.name || "",
                gstin: order.businessDetails?.gstin || "",
                address: order.businessDetails?.address || "",
                contact: order.businessDetails?.contact || "",
                email: order.businessDetails?.email || "",
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
                order.items?.map((item: any) => ({
                  itemId: item.itemId,
                  name: item.name,
                  description: item.description || "",
                  qty: item.quantity,
                  rate: item.rate,
                  discount: item.discount || 0,
                  igst: item.igst || item.taxRate || 0,
                  sgst: item.sgst || 0,
                  cgst: item.cgst || 0,
                  amount: item.amount || 0,
                  hsn: item.hsn || "",
                  unit: item.unit || "pcs",
                })) || [],
              discountType:
                order.discountType === "percent" ? "percent" : "flat",
              discountValue: order.discountValue || 0,
              shipping: order.shipping || 0,
              roundOff: order.roundOff || false,
              showHSN: order.showHSN !== undefined ? order.showHSN : false,
              showUnit: order.showUnit !== undefined ? order.showUnit : false,
              terms: order.terms || "",
              notes: order.notes || "",
              attachments: [],
              showSignature: order.showSignature || false,
            });
          }
        } catch (error) {
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
      await updateSalesOrder(orderId, user.companyId, {
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
          taxRate: item.igst || item.taxRate,
          hsn: item.hsn,
          unit: item.unit,
        })),
        discountType: values.discountType === "percent" ? "percent" : "flat",
        discountValue: values.discountValue,
        shipping: values.shipping,
        roundOff: values.roundOff,
        showHSN: values.showHSN,
        showUnit: values.showUnit,
        terms: values.terms,
        notes: values.notes,
        showSignature: values.showSignature,
      });
      router.push("/finance/sales-orders");
    } catch (error) {
      toast.error("Failed to update sales order");
    } finally {
      setLoading(false);
    }
  };

  if (!initialValues) {
    return <div className="p-8 text-center">Loading sales order...</div>;
  }

  return (
    <SalesOrderForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      mockClients={clients}
      mockProducts={items}
      loading={loading}
    />
  );
}
