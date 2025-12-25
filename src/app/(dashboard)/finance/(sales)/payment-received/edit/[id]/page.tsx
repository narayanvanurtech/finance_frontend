"use client";
import React, { useEffect, useState } from "react";
import PaymentsMadeForm, {
  PaymentsMadeFormValues,
} from "@/components/finance/paymentReceived/PaymentReivedForm";
import { usePaymentReceivedStore } from "@/stores/financeStore/usePaymentReceivedStore";
import { useRouter, useParams } from "next/navigation";

export default function PaymentReceivedEditPage() {
  const { id } = useParams();
  const getPayment = usePaymentReceivedStore((s) => s.getPayment);
  const updatePayment = usePaymentReceivedStore((s) => s.updatePayment);
  const router = useRouter();

  const [payment, setPayment] = useState<PaymentsMadeFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  // -------- LOAD PAYMENT --------
  useEffect(() => {
    if (!id) return;

    getPayment(id as string).then((data) => {
      if (!data) {
        setLoading(false);
        return;
      }

      // 🟢 FORMAT RESPONSE FOR FORM
      const firstPaymentRecord = data.paymentRecords?.[0] || {};
      
      const formatted: PaymentsMadeFormValues = {
        clientId:
          typeof data.clientId === "object" ? data.clientId._id : data.clientId,
        paymentDate: data.receiptDate?.split("T")[0] || "",
        paymentType: data.paymentType || "Receipt",

        // ---- Payment Records fill - ensure all fields are set
        paymentMode: firstPaymentRecord.paymentMethod || "",
        paidThrough: firstPaymentRecord.depositedTo || "",
        amountPaid: firstPaymentRecord.amountReceived?.toString() || "",
        referenceNo: firstPaymentRecord.referenceId || "",
        notes: firstPaymentRecord.notes || "",

        // ---- Invoice match by InvoiceId (could be _id or invoiceNumber)
        selectedInvoices: data.allocations?.map((a) => a.invoiceId).filter(Boolean) || [],

        allocations: data.allocations || [],
        paymentRecords: data.paymentRecords || [],
      };

      setPayment(formatted);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Fetching Payment...</div>
    );

  if (!payment)
    return (
      <div className="p-10 text-center text-red-500">Payment Not Found!</div>
    );

  // -------- Update Submit --------
  const handleSubmit = async (values: PaymentsMadeFormValues) => {
    await updatePayment(id as string, values);
    router.push("/finance/payment-received");
  };

  return (
    <PaymentsMadeForm
      mode="edit"
      initialValues={payment}
      onSubmit={handleSubmit}
    />
  );
}
