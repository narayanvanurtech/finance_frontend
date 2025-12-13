"use client";

import React, { useState } from "react";
import {
  useGetPurchaseOrders,
  useDeletePurchaseOrder,
} from "@/hooks/usePurchaseOrderQueries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FiMoreHorizontal } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function PurchaseOrdersListPage() {
  const {
    data: purchaseOrdersData,
    isLoading,
    refetch,
  } = useGetPurchaseOrders();
  const { mutate: deletePurchaseOrder } = useDeletePurchaseOrder();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const purchaseOrders = purchaseOrdersData?.result?.purchaseOrders || [];

  const handleDelete = (purchaseOrderId: string) => {
    deletePurchaseOrder(purchaseOrderId, {
      onSuccess: () => {
        setShowConfirm(false);
        setDeleteId(null);
        refetch();
      },
    });
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Purchase Orders
          </h1>
          <Button
            className="rounded-lg px-6 py-2 text-base font-semibold border border-[var(--color-primary)] hover:opacity-90 transition shadow-sm"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
            onClick={() => router.push("/dashboard/purchase-orders/create")}
          >
            + Add Purchase Order
          </Button>
        </div>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {isLoading ? (
            <div className="text-center text-gray-500 py-16 text-lg">
              Loading purchase orders...
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-lg">
              No purchase orders found. Click "Add Purchase Order" to add your
              first purchase order.
            </div>
          ) : (
            <div className="overflow-x-auto md:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      PO No
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Supplier Invoice No
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Order Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Due Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {purchaseOrders.map((po) => {
                    const total =
                      (po.items || []).reduce(
                        (sum, item) => sum + (Number(item.amount) || 0),
                        0
                      ) + (Number(po.shipping) || 0);
                    return (
                      <tr
                        key={po._id}
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/user/finance/purchase-orders/view/${po._id}`
                          )
                        }
                      >
                        <td className="px-4 py-2 font-medium">
                          {po.purchaseOrderNumber}
                        </td>
                        <td className="px-4 py-2">
                          {po.vendorDetails?.name || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {po.vendorDetails?.name || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(po.purchaseOrderDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          {po.expectedDeliveryDate
                            ? new Date(
                                po.expectedDeliveryDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-2">₹{total.toFixed(2)}</td>
                        <td
                          className="px-4 py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <FiMoreHorizontal className="text-xl text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/user/finance/purchase-orders/edit/${po._id}`
                                  )
                                }
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  setShowConfirm(true);
                                  setDeleteId(po._id);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Confirm Delete Dialog */}
              {showConfirm && deleteId !== null && (
                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Purchase Order?</DialogTitle>
                    </DialogHeader>
                    <div className="mb-6 text-gray-600">
                      Are you sure you want to delete this purchase order? This
                      action cannot be undone.
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowConfirm(false);
                          setDeleteId(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(deleteId!)}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
