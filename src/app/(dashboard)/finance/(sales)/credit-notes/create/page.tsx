import { CreateCreditNote } from "@/view/dashboard/finance/sales/creditNotes";
import { Suspense } from "react";


export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      
      <CreateCreditNote/>
    </Suspense>
  );
}
