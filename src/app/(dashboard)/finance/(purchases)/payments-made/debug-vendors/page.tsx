"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useDebugListAllVendors,
  useDebugVendorData,
} from "@/hooks/usePaymentMadeQueries";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiFileText,
  FiDollarSign,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";
import { Button } from "@mui/material";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DebugVendorsPage() {
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter()
  // Fetch all vendors
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    error: vendorsError,
  } = useDebugListAllVendors();

  // Fetch selected vendor details
  const {
    data: vendorDebugData,
    isLoading: vendorDataLoading,
    error: vendorDataError,
  } = useDebugVendorData(selectedVendorId, !!selectedVendorId);

  const vendors = vendorsData?.result || [];
  const vendorDetails = vendorDebugData?.result;

  // Filter vendors by search term
  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Debug Vendors & Purchases
          </h1>
          <p className="text-gray-600 mt-1">
            View vendor details and their purchase history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendors List */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              All Vendors
            </h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vendors..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {vendorsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg animate-pulse bg-gray-50"
                >
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : vendorsError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">
                  Failed to load vendors
                </p>
                <p className="text-red-600 text-sm mt-1">
                  {(vendorsError as any)?.message || "Unknown error"}
                </p>
              </div>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No vendors found matching your search"
                : (<Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="p-2"
                    onClick={() => router.push("/finance/vendors/create")}
                  >
                    <Plus className="w-4 h-4" /> <h1>Add New Vendor</h1>
                  </Button>)}
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredVendors.map((vendor: any) => (
                <button
                  key={vendor._id}
                  onClick={() => setSelectedVendorId(vendor._id)}
                  className={`w-full p-4 border rounded-lg text-left transition hover:shadow-md ${
                    selectedVendorId === vendor._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {vendor.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() || "V"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {vendor.name || "Unnamed Vendor"}
                      </p>
                      {vendor.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <FiMail className="w-3 h-3" />
                          {vendor.email}
                        </p>
                      )}
                      {vendor.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <FiPhone className="w-3 h-3" />
                          {vendor.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Vendor Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Vendor Details
          </h2>

          {!selectedVendorId ? (
            <div className="text-center py-12 text-gray-500">
              <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Select a vendor to view details</p>
            </div>
          ) : vendorDataLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : vendorDataError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">
                  Failed to load vendor details
                </p>
                <p className="text-red-600 text-sm mt-1">
                  {(vendorDataError as any)?.message || "Unknown error"}
                </p>
              </div>
            </div>
          ) : vendorDetails ? (
            <div className="space-y-6">
              {/* Vendor Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Vendor Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">
                      {vendorDetails.vendor?.name || "N/A"}
                    </span>
                  </div>
                  {vendorDetails.vendor?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">
                        {vendorDetails.vendor.email}
                      </span>
                    </div>
                  )}
                  {vendorDetails.vendor?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">
                        {vendorDetails.vendor.phone}
                      </span>
                    </div>
                  )}
                  {vendorDetails.vendor?.gstNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST Number:</span>
                      <span className="font-medium text-gray-900">
                        {vendorDetails.vendor.gstNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-600 font-medium">
                      Total Purchases
                    </span>
                    <FiFileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(vendorDetails.totalPurchases || 0)}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-green-600 font-medium">
                      Total Paid
                    </span>
                    <FiDollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(vendorDetails.totalPaid || 0)}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-orange-600 font-medium">
                      Balance
                    </span>
                    <FiAlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-lg font-bold text-orange-900">
                    {formatCurrency(vendorDetails.balance || 0)}
                  </p>
                </div>
              </div>

              {/* Purchase Orders */}
              {vendorDetails.purchaseOrders &&
                vendorDetails.purchaseOrders.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FiFileText className="w-4 h-4" />
                      Purchase Orders ({vendorDetails.purchaseOrders.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {vendorDetails.purchaseOrders.map((po: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded border border-gray-200 text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {po.purchaseOrderNumber || po.poNumber || `PO-${idx + 1}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {po.purchaseDate
                                  ? new Date(po.purchaseDate).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(po.totalAmount || 0)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {po.status || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Payout Receipts */}
              {vendorDetails.payoutReceipts &&
                vendorDetails.payoutReceipts.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4" />
                      Payout Receipts ({vendorDetails.payoutReceipts.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {vendorDetails.payoutReceipts.map(
                        (receipt: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded border border-gray-200 text-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {receipt.receiptNumber ||
                                    receipt.receiptNo ||
                                    `Receipt-${idx + 1}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {receipt.receiptDate
                                    ? new Date(
                                        receipt.receiptDate
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(
                                    receipt.totalAmountPaid || receipt.totalAmount || 0
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {receipt.paymentType || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No data available for this vendor
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
