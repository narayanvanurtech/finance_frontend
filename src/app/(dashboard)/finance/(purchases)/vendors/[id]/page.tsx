"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useGetPurchaseOrders } from "@/hooks/usePurchaseOrderQueries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Calendar,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import type { PurchaseOrder } from "@/api/finance/purchaseOrderApi";

const statusColors = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-800",
  acknowledged: "bg-amber-100 text-amber-800",
  partial_delivery: "bg-purple-100 text-purple-800",
  complete: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

const statusIcons = {
  draft: Clock,
  sent: FileText,
  acknowledged: CheckCircle,
  partial_delivery: Package,
  complete: CheckCircle,
  cancelled: XCircle,
};

export default function VendorPurchasesPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const { vendors, fetchVendors, loading: vendorLoading } = useVendorStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch vendor details
  useEffect(() => {
    if (!vendors.length) {
      fetchVendors();
    }
  }, [vendors.length, fetchVendors]);

  // Find current vendor
  const vendor = vendors.find((v) => v._id === vendorId);

  // Fetch purchase orders for this vendor
  const {
    data: purchaseOrdersData,
    isLoading: purchaseOrdersLoading,
    refetch,
  } = useGetPurchaseOrders({
    page: currentPage,
    limit: itemsPerPage,
    vendorId: vendorId,
  });

  const purchaseOrders = purchaseOrdersData?.result?.purchaseOrders || [];
  const pagination = purchaseOrdersData?.result?.pagination;

  const calculateTotalAmount = (po: PurchaseOrder) => {
    const itemsTotal = po.items.reduce((sum, item) => {
      const total = item.rate * item.quantity;
      const discount =
        item.discountType === "percentage"
          ? (total * (item.discount || 0)) / 100
          : item.discount || 0;

      return sum + (total - discount);
    }, 0);

    const orderDiscount =
      po.discountType === "percentage"
        ? (itemsTotal * (po.discountValue || 0)) / 100
        : po.discountValue || 0;

    return itemsTotal - orderDiscount + (po.shipping || 0);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  // Calculate stats
  const stats = {
    totalPurchases: purchaseOrders.length,
    totalAmount: purchaseOrders.reduce(
      (sum, po) => sum + calculateTotalAmount(po),
      0
    ),
    completedOrders: purchaseOrders.filter((po) => po.status === "received")
      .length,
    pendingOrders: purchaseOrders.filter(
      (po) => po.status === "draft" || po.status === "approved"
    ).length,
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (pagination && page > pagination.totalPages)) return;
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  if (vendorLoading || purchaseOrdersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Vendor Not Found</h2>
          <p className="text-gray-600 mt-2">
            The vendor you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/finance/vendors")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/finance/vendors")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-600 mt-1">Vendor Purchase History</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/finance/vendors/edit/${vendor._id}`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Vendor
        </Button>
      </div>

      {/* Vendor Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Display Name */}
            {vendor.displayName && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Display Name</p>
                  <p className="font-medium">{vendor.displayName}</p>
                </div>
              </div>
            )}

            {/* Email */}
            {vendor.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{vendor.email}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {(vendor.phone || vendor.contact) && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {vendor.phone || vendor.contact}
                  </p>
                </div>
              </div>
            )}

            {/* GSTIN */}
            {vendor.gstin && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">GSTIN</p>
                  <p className="font-medium">{vendor.gstin}</p>
                </div>
              </div>
            )}

            {/* Address */}
            {vendor.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {[
                      vendor.address.streetAddress,
                      vendor.address.city,
                      vendor.address.state,
                      vendor.address.postalCode,
                      vendor.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalPurchases}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Amount */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.completedOrders}
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>All purchase orders for this vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-600">
                          No purchase orders found for this vendor
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseOrders.map((po) => {
                    const StatusIcon =
                      statusIcons[po.status as keyof typeof statusIcons];
                    return (
                      <TableRow key={po._id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="text-blue-600 font-semibold">
                            {po.purchaseOrderNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {format(
                              new Date(po.purchaseOrderDate),
                              "MMM dd, yyyy"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`inline-flex items-center gap-1 ${
                              statusColors[
                                po.status as keyof typeof statusColors
                              ]
                            }`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {po.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              po.priority === "high"
                                ? "destructive"
                                : po.priority === "medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {po.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(calculateTotalAmount(po))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/finance/purchase-orders/edit/${po._id}`
                              )
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
