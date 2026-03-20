"use client";
import React, { useEffect, useState } from "react";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import AddBussinessModal from "@/components/finance/AddBussinessModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axios";



export interface BankDetails {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  accountType?: string;
}

export interface BusinessDetails {
  businessName?: string;
  brandName?: string;
  teamSize?: string;
  phone?: string;
  country?: string;
  state?: string;
  contact?:string;
  currency?: string;
  igstn?: string;
  hasGst?: boolean;
  gstNumber?: string;
  website?: string;
  logo?: string;
  qrcode?: string;
  bankDetails?: BankDetails;
  email?:string;
  address?:string;
}

export default function BussinessPage() {
  const details: BusinessDetails | null =
  useBussinessStore((s: any) => s.details);
  const [editOpen, setEditOpen] = useState(false);

  let token = null

if (typeof window !== "undefined") {
  token = localStorage.getItem("token")
}

    // useEffect(()=>{
    //   async function fetchBusinessDetails(){
    // const res =  await axiosInstance.get('/api/v1/finance/setting/business/',{
    //   headers:{
    //     "Authorization":`Bearer ${token}`,
    //   },
    // })
    // console.log("Business Details kjnbvgbhkjn=====>>>>>",res.data)
    //    }
    //    fetchBusinessDetails()
    // },[])

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Business Details
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your company information and banking details
          </p>
        </div>

        {!details ? (
          <AddBussinessModal />
        ) : (
          <Button
            className="px-6 rounded-xl shadow-sm"
            onClick={() => setEditOpen(true)}
          >
            Edit Details
          </Button>
        )}
      </div>

      {details ? (
        <div className="space-y-8">
          
          {/* Logo & QR Section */}
          <Card className="rounded-2xl shadow-sm border">
            <CardContent className="p-8">
              <h2 className="text-lg font-semibold mb-6">
                Branding Assets
              </h2>

              <div className="flex gap-12 flex-wrap">
                {details.logo && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Logo</p>
                    <div className="bg-gray-50 p-4 rounded-xl border shadow-sm">
                      <img
                        src={details.logo}
                        alt="Logo"
                        className="h-20 object-contain"
                      />
                    </div>
                  </div>
                )}

                {details.qrcode && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      QR Code
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl border shadow-sm">
                      <img
                        src={details.qrcode}
                        alt="QR Code"
                        className="h-28 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="rounded-2xl shadow-sm border">
            <CardContent className="p-8">
              <h2 className="text-lg font-semibold mb-6">
                Business Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <Info label="Business Name" value={details.businessName} />
                <Info label="Brand Name" value={details.brandName} />
                <Info label="Team Size" value={details.teamSize} />
                <Info label="Phone" value={details.phone} />
                <Info label="Country" value={details.country} />
                <Info label="State" value={details.state} />
                <Info label="Currency" value={details.currency} />
                <Info label="IGSTN" value={details.igstn || "-"} />
                <Info label="Email" value={details.email || "abc@gmail.com"} />
                <Info label="Contact" value={details.contact} />
                <Info label="Address" value={details.address} />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    GST Registered
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      details.hasGst
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {details.hasGst ? "Yes" : "No"}
                  </span>
                </div>

                {details.hasGst && (
                  <Info label="GST Number" value={details.gstNumber} />
                )}

                {details.website && (
                  <div className="col-span-1 md:col-span-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Website
                    </p>
                    <a
                      href={details.website}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {details.website}
                    </a>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>

          {/* Bank Section */}
          {details.bankDetails && (
            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="p-8">
                <h2 className="text-lg font-semibold mb-6">
                  Bank Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <Info
                    label="Account Holder"
                    value={details.bankDetails.accountHolderName}
                  />
                  <Info
                    label="Bank Name"
                    value={details.bankDetails.bankName}
                  />
                  <Info
                    label="Account Number"
                    value={details.bankDetails.accountNumber}
                  />
                  <Info
                    label="IFSC Code"
                    value={details.bankDetails.ifscCode}
                  />
                  <Info
                    label="Branch Name"
                    value={details.bankDetails.branchName}
                  />
                  <Info
                    label="Account Type"
                    value={details.bankDetails.accountType}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-2xl py-20 text-center">
          <h3 className="text-lg font-semibold">
            No Business Details Found
          </h3>
          <p className="text-muted-foreground mt-2">
            Click "Add Business" to create your company profile.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {details && (
        <AddBussinessModal
          open={editOpen}
          setOpen={setEditOpen}
          initialValues={details}
        />
      )}
    </div>
  );
}

/* 🔹 Reusable Info Component */
function Info({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}