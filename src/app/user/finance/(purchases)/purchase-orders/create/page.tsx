import CreatePurchaseOrderPage from "@/components/user/finance/purchase/PurchaseOrder";
import { Suspense } from "react";

// OR wherever the component lives — reuse the same component

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePurchaseOrderPage />
    </Suspense>
  );
}