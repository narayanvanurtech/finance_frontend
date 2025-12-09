"use client";

import React, { Suspense } from "react";
import AddDealPageContent from "./AddDealPageContent";

export default function AddDealPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddDealPageContent />
    </Suspense>
  );
}