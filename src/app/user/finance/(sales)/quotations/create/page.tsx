
import CreateQuotationPage from "@/components/user/finance/sales/Quotation";
import { Suspense } from "react";

// OR wherever the component lives — reuse the same component

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateQuotationPage />
    </Suspense>
  );
}