"use client";
import React from "react";
import PaymentReceivedForm, {
  type PaymentsMadeFormValues,
} from "@/components/finance/paymentReceived/PaymentReivedForm";
import { usePaymentReceivedStore } from "@/stores/financeStore/usePaymentReceivedStore";
import { useRouter } from "next/navigation";

export default function PaymentReceivedCreatePage() {
  const createPayment = usePaymentReceivedStore((state) => state.createPayment);
  const router = useRouter();

  const handleSubmit = async (values: PaymentsMadeFormValues) => {
    await createPayment(values);
    router.push("/user/finance/payment-received");
  };

  return <PaymentReceivedForm mode="create" onSubmit={handleSubmit} />;
}
