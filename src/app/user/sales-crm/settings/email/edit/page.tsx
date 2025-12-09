"use client";

import React, { Suspense } from "react";
import EditEmailTemplatePageContent from "./EditEmailTemplatePageContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditEmailTemplatePageContent />
    </Suspense>
  );
}
