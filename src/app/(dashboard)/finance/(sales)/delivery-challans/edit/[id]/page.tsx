"use client";

import React, { useState, useEffect } from "react";
import DeliveryChallanForm, {
  DeliveryChallanFormValues,
} from "@/components/finance/deliveryChallan/DeliveryChallanForm";
import { useDeliveryChallanStore } from "@/stores/financeStore/useDeliveryChallanStore";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useItems } from "@/hooks/useItemQueries";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

export default function EditDeliveryChallanPage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  const { user } = useAuthStore();
  const { data: itemsData } = useItems(user?.companyId || "");
  const items = itemsData?.result?.items || [];
  const { singleChallan, fetchChallanById, updateChallan } =
    useDeliveryChallanStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] =
    useState<DeliveryChallanFormValues | null>(null);

  // Get challan ID from URL
  const challanId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Fetch challan data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!challanId) {
        setError("No challan ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching challan with ID:", challanId);
        await fetchChallanById(challanId);
      } catch (err: any) {
        console.error("Error loading challan:", err);
        setError(err?.message || "Failed to load delivery challan");
        setLoading(false);
      }
    };
    loadData();
  }, [challanId, fetchChallanById]);

  // Transform API data to form values when singleChallan changes
  useEffect(() => {
    if (!singleChallan) {
      console.log("No singleChallan data yet");
      return;
    }

    console.log("Single Challan Data received:", singleChallan);

    try {
      // Convert date from ISO format to YYYY-MM-DD
      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      // Find client details - check both id formats
      const clientIdToFind =
        singleChallan.clientId?.id ||
        singleChallan.clientId?._id ||
        singleChallan.clientId;
      const client = clients.find(
        (c) => c.id === clientIdToFind || c._id === clientIdToFind
      );

      console.log("Client ID to find:", clientIdToFind);
      console.log("Found client:", client);
      console.log("Available clients:", clients);

      const formValues = {
        quotationTitle: singleChallan.title || "",
        quotationNumber: singleChallan.deliveryChallanNumber || "",
        date: formatDate(singleChallan.date),
        dueDate: singleChallan.dueDate ? formatDate(singleChallan.dueDate) : "",
        clientId: clientIdToFind || "",
        clientDetails: {
          name: singleChallan.clientId?.name || client?.businessName || "",
          gstin: singleChallan.clientId?.gstin || client?.gstin || "",
          address:
            singleChallan.clientId?.address?.street ||
            client?.address?.street ||
            "",
          contact: singleChallan.clientId?.phone || client?.phone || "",
          email: singleChallan.clientId?.email || client?.email || "",
        },
        businessDetails: singleChallan.businessDetails || {
          name: "",
          gstin: "",
          address: "",
          contact: "",
          email: "",
        },
        taxType: singleChallan.taxType || "exclusive",
        taxConfiguration: singleChallan.taxConfiguration || "SGST_CGST",
        items:
          singleChallan.items?.map((item: any) => {
            // Recalculate amount based on quantity and rate
            const baseAmount = (item.quantity || 0) * (item.rate || 0);
            const afterDiscount = baseAmount - (item.discount || 0);

            let calculatedAmount = afterDiscount;

            // Add tax if exclusive
            if (singleChallan.taxType === "exclusive") {
              if (singleChallan.taxConfiguration === "IGST") {
                calculatedAmount += (afterDiscount * (item.igst || 0)) / 100;
              } else {
                calculatedAmount +=
                  (afterDiscount * ((item.sgst || 0) + (item.cgst || 0))) / 100;
              }
            }

            return {
              name: item.name || "",
              description: item.description || "",
              hsn: item.hsn || "",
              unit: item.unit || "pcs",
              quantity: item.quantity || 0,
              qty: item.quantity || item.qty || 0, // Add qty field for ItemTable compatibility
              rate: item.rate || 0,
              discount: item.discount || 0,
              discountType: item.discountType || "flat",
              taxType: item.taxType || "none",
              taxRate: item.taxRate || 0,
              taxAmount: item.taxAmount || 0,
              cgstAmount: item.cgstAmount || 0,
              sgstAmount: item.sgstAmount || 0,
              igstAmount: item.igstAmount || 0,
              amount: calculatedAmount,
              cess: item.cess || [],
              cgst: item.cgst || 0,
              sgst: item.sgst || 0,
              igst: item.igst || 0,
            };
          }) || [],
        discountType: singleChallan.discountType || "flat",
        discountValue: singleChallan.discountValue || 0,
        shipping: singleChallan.shipping || 0,
        roundOff: singleChallan.roundOff || false,
        showHSN: singleChallan.showHSN || false,
        showUnit: singleChallan.showUnit || false,
        terms: singleChallan.terms || "",
        notes: singleChallan.notes || "",
        attachments: [],
        showSignature: singleChallan.showSignature || false,
        cessList: singleChallan.cessList || [],
        phases: singleChallan.phases || [],
      };

      console.log("Setting initial values:", formValues);
      setInitialValues(formValues);
      setLoading(false);
    } catch (err: any) {
      console.error("Error transforming data:", err);
      setError("Failed to transform challan data");
      setLoading(false);
    }
  }, [singleChallan, clients]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading delivery challan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push("/finance/delivery-challans")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Delivery challan not found</p>
        <button
          onClick={() => router.push("/finance/delivery-challans")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleUpdate = async (values: DeliveryChallanFormValues) => {
    setLoading(true);
    try {
      if (challanId) {
        // Transform form values to API payload
        const payload = {
          deliveryChallanIds: [challanId], // Backend expects array of IDs
          deliveryChallanNumber: values.quotationNumber,
          date: values.date,
          clientId: values.clientId,
          taxType: values.taxType,
          discountType: values.discountType,
          discountValue: values.discountValue,
          shipping: values.shipping,
          roundOff: values.roundOff,
          showHSN: values.showHSN,
          showUnit: values.showUnit,
          showSignature: values.showSignature,
          items: values.items,
          terms: values.terms,
          notes: values.notes,
          businessDetails: values.businessDetails,
          taxConfiguration: values.taxConfiguration,
        };

        console.log("Updating challan with ID:", challanId);
        console.log("Updating challan with payload:", payload);
        await updateChallan(challanId, payload);
        router.push("/finance/delivery-challans");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err?.message || "Failed to update delivery challan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeliveryChallanForm
      initialValues={initialValues}
      onSubmit={handleUpdate}
      mode="edit"
      loading={loading}
      mockClients={clients}
      mockProducts={items}
    />
  );
}
