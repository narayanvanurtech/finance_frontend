"use client";
import React, { useEffect, useState } from "react";
import PaymentReceivedForm, {
  type PaymentsMadeFormValues,
} from "@/components/finance/paymentReceived/PaymentReivedForm";
import { usePaymentReceivedStore } from "@/stores/financeStore/usePaymentReceivedStore";
import { useRouter, useParams } from "next/navigation";
import type { PaymentReceived } from "@/api/finance/payment-receivedApi";

export default function PaymentReceivedEditPage() {
  const { id } = useParams();
  const getPayment = usePaymentReceivedStore((state) => state.getPayment);
  const updatePayment = usePaymentReceivedStore((state) => state.updatePayment);
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentReceived | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayment = async () => {
      if (id) {
        const data = await getPayment(id as string);
        setPayment(data);
        setLoading(false);
      }
    };
    loadPayment();
  }, [id, getPayment]);

  if (loading) {
    return <div className="max-w-2xl mx-auto p-8 text-center">Loading...</div>;
  }

  if (!payment) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-red-500">
        Payment not found.
      </div>
    );
  }

  // Map PaymentReceived to PaymentsMadeFormValues
  const initialValues: PaymentsMadeFormValues = {
    clientId:
      typeof payment.clientId === "string"
        ? payment.clientId
        : payment.clientId._id,
    paymentDate: payment.receiptDate,
    paymentType: payment.paymentType,
    paymentRecords: payment.paymentRecords,
    allocations: payment.allocations,
    attachments: payment.attachments,
  };

  const handleSubmit = async (values: PaymentsMadeFormValues) => {
    await updatePayment(payment._id, values);
    router.push("/user/finance/payment-received");
  };

  return (
    <PaymentReceivedForm
      mode="edit"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
