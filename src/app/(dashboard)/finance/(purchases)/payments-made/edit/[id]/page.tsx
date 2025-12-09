"use client";
import React from "react";
import PaymentsMadeForm, { PaymentsMadeFormValues } from "@/finance/paymentsMade/PaymentsMadeForm";
import { usePaymentsMadeStore } from "@/financeStore/usePaymentsMadeStore";
import { useRouter, useParams } from "next/navigation";

export default function PaymentsMadeEditPage() {
  const { id } = useParams();
  const getPayment = usePaymentsMadeStore((state) => state.getPayment);
  const updatePayment = usePaymentsMadeStore((state) => state.updatePayment);
  const router = useRouter();

  const payment = getPayment(id as string);

  if (!payment) {
    return <div className="max-w-2xl mx-auto p-8 text-center text-red-500">Payment not found.</div>;
  }

  const handleSubmit = (values: PaymentsMadeFormValues) => {
    updatePayment(payment.id, values);
    router.push("/dashboard/payments-made");
  };

  return (
    <PaymentsMadeForm mode="edit" initialValues={payment} onSubmit={handleSubmit} />
  );
}
