import BussinessPage from "@/components/finance/business/BusinessPage";
import { Suspense } from "react";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BussinessPage />
    </Suspense>
  );
}