import CreateDeliveryChallanPage from "@/components/finance/sales/CreateDeliveryChallanPage";
import { Suspense } from "react";


// If your CreateInvoicePage is in a different location use the correct path, e.g:
// import CreateInvoicePage from "@/components/finance/invoice/CreateInvoicePage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
     <CreateDeliveryChallanPage/>
    </Suspense>
  );
}