
import CreatePerformaInvoicePage from "@/components/user/finance/sales/PerformaInvoice";
import { Suspense } from "react";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePerformaInvoicePage />
    </Suspense>
  );
}