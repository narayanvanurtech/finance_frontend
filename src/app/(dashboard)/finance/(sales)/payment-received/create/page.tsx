"use client";
import { useState } from "react";
import PaymentReceivedForm, {
  PaymentsMadeFormValues,
} from "@/components/finance/paymentReceived/PaymentReivedForm";
import { usePaymentReceivedStore } from "@/stores/financeStore/usePaymentReceivedStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PaymentReceivedCreatePage() {
  const { createPayment, fetchPayments, setCompanyId } =
    usePaymentReceivedStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: PaymentsMadeFormValues) => {
    if (!user?.companyId) return toast.error("Company ID Required");

    setLoading(true);
    try {
      setCompanyId(user.companyId);

      await createPayment(values);

      await fetchPayments(); // refresh list before navigation
      toast.success("Payment Recorded Successfully");
      router.push("/finance/payment-received");
    } catch {
      toast.error("Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentReceivedForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
