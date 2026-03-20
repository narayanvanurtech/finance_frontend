import CreateExpensePage from "@/components/finance/purchase/CreateExpensePage";
import { Suspense } from "react";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <CreateExpensePage/>
    </Suspense>
  );
}