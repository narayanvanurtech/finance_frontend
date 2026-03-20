// This page.tsx itself needs "use client" because of the store error
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import with ssr:false to fully prevent server rendering
const QuotationPreviewPage = dynamic(
  () => import("../../../../../../components/finance/sales/QuotationPreview"), // your actual component path
  { ssr: false }
);

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuotationPreviewPage />
    </Suspense>
  );
}