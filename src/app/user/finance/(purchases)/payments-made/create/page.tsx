"use client";
import React from "react";
import PaymentsMadeForm, { PaymentsMadeFormValues } from "@/components/finance/paymentsMade/PaymentsMadeForm";
import { useCreatePayoutReceipt } from "@/hooks/usePaymentMadeQueries";
import { useRouter } from "next/navigation";

export default function PaymentsMadeCreatePage() {
  const router = useRouter();
  const { mutate: createPayment, isPending } = useCreatePayoutReceipt();

  const handleSubmit = (values: PaymentsMadeFormValues) => {
    createPayment(values, {
      onSuccess: () => {
        router.push("/finance/payments-made");
      },
    });
  };

  return (
    <PaymentsMadeForm mode="create" onSubmit={handleSubmit} loading={isPending} />
  );
}
