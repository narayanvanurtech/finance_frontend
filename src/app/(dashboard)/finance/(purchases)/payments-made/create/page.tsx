"use client";
import React from "react";
import PaymentsMadeForm, { PaymentsMadeFormValues } from "@/finance/paymentsMade/PaymentsMadeForm";
import { usePaymentsMadeStore } from "@/financeStore/usePaymentsMadeStore";
import { useRouter } from "next/navigation";

export default function PaymentsMadeCreatePage() {
  const createPayment = usePaymentsMadeStore((state) => state.createPayment);
  const router = useRouter();

  const handleSubmit = (values: PaymentsMadeFormValues) => {
    const id = Date.now().toString();
    createPayment({ ...values, id });
    router.push("/dashboard/payments-made");
  };

  return (
    <PaymentsMadeForm mode="create" onSubmit={handleSubmit} />
  );
}
