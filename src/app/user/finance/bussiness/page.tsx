"use client";
import React, { useState } from "react";
import { useBussinessStore } from "@/financeStore/useBussinessStore";
import AddBussinessModal from "@/finance/AddBussinessModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BussinessPage() {
  const details = useBussinessStore((s) => s.details);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Business Details</h1>
        {!details && <AddBussinessModal />}
      </div>
      {details ? (
        <Card className="relative">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-4 right-4"
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          <AddBussinessModal open={editOpen} setOpen={setEditOpen} initialValues={details || undefined} />
          <CardContent className="p-6 space-y-2">
            <div><span className="font-medium">Business Name:</span> {details.businessName}</div>
            {details.brandName && <div><span className="font-medium">Brand Name:</span> {details.brandName}</div>}
            <div><span className="font-medium">Team Size:</span> {details.teamSize}</div>
            {details.website && <div><span className="font-medium">Website:</span> {details.website}</div>}
            <div><span className="font-medium">Phone:</span> {details.phone}</div>
            <div><span className="font-medium">Country:</span> {details.country}</div>
            <div><span className="font-medium">Currency:</span> {details.currency}</div>
            <div><span className="font-medium">GST Registered:</span> {details.hasGst ? "Yes" : "No"}</div>
            {details.hasGst && details.gstNumber && (
              <div><span className="font-medium">GST Number:</span> {details.gstNumber}</div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-muted-foreground text-center py-10">
          <p>No business details found.</p>
          <p className="mt-2">Click "Add Business" to get started.</p>
        </div>
      )}
    </div>
  );
}
