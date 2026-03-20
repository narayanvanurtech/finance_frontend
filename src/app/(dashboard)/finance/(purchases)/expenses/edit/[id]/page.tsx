"use client";

import React, { useState, useEffect } from "react";
import ExpenseForm, {
  ExpenseFormValues,
} from "@/components/finance/expenses/ExpenseForm";
import { useParams, useRouter } from "next/navigation";
import {
  useGetPurchaseById,
  useUpdatePurchase,
  useAddAttachment,
} from "@/hooks/usePurchaseExpenseQueries";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useBussinessStore } from "@/financeStore/useBussinessStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";

import Link from "next/link";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useItems } from "@/hooks/useItemQueries";

export default function EditExpensePage() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const purchaseId = Array.isArray(params.id) ? params.id[0] : params.id;
const { data: itemsData, isLoading: itemsLoading } = useItems(
  user?.companyId ?? "",
  {
    enabled: !!user?.companyId,   // 🚀 prevents empty API call
  }
);
const items = itemsData?.result?.items || [];
  // Fetch vendors and business details
  const { vendors, fetchVendors } = useVendorStore();
  const { details: businessDetails } = useBussinessStore();

  // Fetch purchase data - only if purchaseId exists
  const {
    data: purchaseData,
    isLoading,
    isError,
    error,
  } = useGetPurchaseById(purchaseId, !!purchaseId);
  const { mutate: updatePurchase, isPending: isUpdating } = useUpdatePurchase();
  const { mutate: addAttachment, isPending: isUploadingAttachment } =
    useAddAttachment();

  const [initialValues, setInitialValues] = useState<ExpenseFormValues | null>(
    null
  );

  // Fetch vendors on mount
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Debug logging
  useEffect(() => {
    console.log("Purchase ID:", purchaseId);
    console.log("Purchase Data:", purchaseData);
    console.log("Is Loading:", isLoading);
    console.log("Is Error:", isError);
    console.log("Error:", error);
  }, [purchaseId, purchaseData, isLoading, isError, error]);

  // Early return if no purchase ID
  if (!purchaseId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Invalid Expense ID
            </h2>
            <p className="text-gray-600 mb-6">
              No expense ID provided in the URL.
            </p>
            <Link href="/finance/expenses">
              <Button className="gap-2">
                <FiArrowLeft />
                Back to Expenses
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (purchaseData?.data) {
      const purchase = purchaseData.data as any;

      // Extract vendor details properly from vendorId or vendorSnapshot
      const vendorInfo =
        typeof purchase.vendorId === "object"
          ? purchase.vendorId
          : purchase.vendorSnapshot || {};

      // Create properly structured vendor details like invoice clientDetails
      const vendorDetails = {
        name: vendorInfo.name || vendorInfo.email || "",
        email: vendorInfo.email || "",
        gstin: vendorInfo.gstin || "",
        address: vendorInfo.address || "",
        contact: vendorInfo.phone || vendorInfo.contact || "",
      };

      // Map business details from store or API
      const mappedBusinessDetails = businessDetails || (
        typeof purchase.companyId === "object" ? {
          businessName: purchase.companyId.businessName || purchase.companyId.companyName,
          gstNumber: purchase.companyId.gstNumber || purchase.companyId.gstin,
          website: purchase.companyId.website || purchase.companyId.address,
          phone: purchase.companyId.phone || purchase.companyId.contact,
        } : null
      );

      // Map phases from API response
      const mappedPhases = (purchase.phases || []).map((phase: any) => ({
        title: phase.title || "",
        percentage: parseFloat(phase.percentage || 0),
        dueDate: phase.dueDate
          ? new Date(phase.dueDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));

      // Transform API data to form values
      const formValues: ExpenseFormValues = {
        expenseNo: purchase.billNumber || "",
        invoiceNo: purchase.billNumber || "",
        purchaseDate: purchase.billDate
          ? new Date(purchase.billDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        dueDate: "",
        vendorId:
          typeof purchase.vendorId === "object"
            ? purchase.vendorId._id
            : purchase.vendorId || "",
        vendorDetails: vendorDetails,
        businessDetails: mappedBusinessDetails,
        items: (purchase.items || []).map((item: any) => {
          // Calculate SGST and CGST from taxRate if taxType is cgst_sgst
          let sgst = parseFloat(item.sgst || 0);
          let cgst = parseFloat(item.cgst || 0);
          let igst = parseFloat(item.igst || 0);
          
          if (item.taxType === "cgst_sgst" && item.taxRate && (!sgst && !cgst)) {
            const halfTax = parseFloat(item.taxRate) / 2;
            sgst = halfTax;
            cgst = halfTax;
          } else if (item.taxType === "igst" && item.taxRate && !igst) {
            igst = parseFloat(item.taxRate);
          }

          return {
            name: item.name || "",
            description: item.description || "",
            qty: parseFloat(item.quantity || item.qty || 1),
            quantity: parseFloat(item.quantity || item.qty || 1),
            rate: parseFloat(item.rate || 0),
            discount: parseFloat(item.discount || 0),
            discountType: item.discountType || "flat",
            taxType: item.taxType || "cgst_sgst",
            taxRate: parseFloat(item.taxRate || 0),
            igst: igst,
            sgst: sgst,
            cgst: cgst,
            cess: Array.isArray(item.cess) ? item.cess : [],
            hsn: item.hsn || "",
            unit: item.unit || "pcs",
            amount: parseFloat(item.amount || 0),
          };
        }),
        discountType: purchase.discountType || "flat",
        discountValue: parseFloat(purchase.discountValue || 0),
        shipping: parseFloat(purchase.shipping || 0),
        roundOff: purchase.roundOff ?? false,
        showHSN: purchase.showHSN ?? false,
        showUnit: purchase.showUnit ?? false,
        terms: purchase.terms || "",
        notes: purchase.notes || "",
        attachments: [],
        signature:purchase.signature || "",
        showSignature: purchase.showSignature ?? false,
        expenseCategory: purchase.purchaseType || "goods",
        paymentMode: purchase.paymentStatus || "pending",
        phases: mappedPhases,
        taxType: purchase.taxType || "exclusive",
      };

      console.log("📦 Mapped Vendor Details:", vendorDetails);
      console.log("📦 Raw Items from API:", purchase.items);
      console.log("📦 Mapped Items:", formValues.items);
      console.log("📦 Mapped Phases:", mappedPhases);
      console.log("📦 Tax Type:", purchase.taxType);
      setInitialValues(formValues);
    }
  }, [purchaseData]);

  const handleUpdate = async (values: ExpenseFormValues) => {
    // Transform form values to API payload
    const payload = {
      vendorId: values.vendorId,
      billDate: values.purchaseDate,
      taxType: (values.taxType || "exclusive") as "inclusive" | "exclusive",
      discountType: values.discountType as "flat" | "percentage",
      discountValue: values.discountValue || 0,
      shipping: values.shipping || 0,
      roundOff: values.roundOff,
      showHSN: values.showHSN,
      showUnit: values.showUnit,
      signature:values.signature,
      showSignature: values.showSignature,
      purchaseType: (values.expenseCategory || "goods") as "goods" | "services",
      priority: "medium" as const,
      items: values.items.map((item: any) => {
        // Calculate taxRate based on item configuration
        let taxRate = 0;
        let taxType: "cgst_sgst" | "igst" | "nil" = "nil";
        
        if (item.taxType === "igst" && item.igst) {
          taxType = "igst";
          taxRate = Number(item.igst) || 0;
        } else if (item.taxType === "cgst_sgst" || (item.sgst && item.cgst)) {
          taxType = "cgst_sgst";
          taxRate = (Number(item.sgst) || 0) + (Number(item.cgst) || 0);
        } else if (item.taxRate) {
          taxRate = Number(item.taxRate);
          taxType = item.taxType || "cgst_sgst";
        }

        return {
          name: item.name,
          hsn: item.hsn || "",
          unit: item.unit || "pcs",
          quantity: parseFloat(item.quantity || item.qty || 1),
          rate: parseFloat(item.rate || 0),
          discount: parseFloat(item.discount || 0),
          discountType: (item.discountType || "flat") as "flat" | "percentage",
          taxType: taxType,
          taxRate: taxRate,
          cess: item.cess && Array.isArray(item.cess) ? item.cess : [],
        };
      }),
      phases: values.phases && values.phases.length > 0 ? values.phases : undefined,
      terms: values.terms || "",
      notes: values.notes || "",
    };

    console.log("📤 Update Payload:", payload);

    updatePurchase(
      { purchaseId, data: payload },
      {
        onSuccess: () => {
          // Upload attachments if any
          if (values.attachments && values.attachments.length > 0) {
            // Upload each attachment
            values.attachments.forEach((file) => {
              addAttachment(
                { purchaseId, data: { file } },
                {
                  onSuccess: () => {
                    console.log(
                      `Attachment ${file.name} uploaded successfully`
                    );
                  },
                  onError: (error) => {
                    console.error(`Failed to upload ${file.name}:`, error);
                  },
                }
              );
            });
          }

          router.push("/finance/expenses");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expense...</p>
          <p className="text-xs text-gray-400 mt-2">ID: {purchaseId}</p>
        </div>
      </div>
    );
  }

  if (isError || !initialValues) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Expense Not Found
            </h2>
            <p className="text-gray-600 mb-2">
              The expense you're looking for doesn't exist or has been deleted.
            </p>
            {error && (
              <p className="text-xs text-red-600 mb-4">
                Error: {(error as any)?.message || "Unknown error"}
              </p>
            )}
            <p className="text-xs text-gray-400 mb-6">
              Purchase ID: {purchaseId}
            </p>
            <Link href="/finance/expenses">
              <Button className="gap-2">
                <FiArrowLeft />
                Back to Expenses
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <ExpenseForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        mode="edit"
        loading={isUpdating || isUploadingAttachment}
        mockVendors={vendors}
        mockProducts={items}
      />
    </div>
  );
}
