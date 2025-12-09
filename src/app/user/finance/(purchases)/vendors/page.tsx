"use client";
import React, { useState } from "react";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FiMoreHorizontal } from "react-icons/fi";

export default function VendorsPage() {
  const vendors = useVendorStore((state) => state.vendors);
  const deleteVendor = useVendorStore((state) => state.deleteVendor);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Custom delete handler
  const handleDelete = async (id: string) => {
    try {
      await deleteVendor(id);
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  return (
    <div className="min-h-screen  w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Vendors
          </h1>
          <Button
            className="rounded-lg px-6 py-2 text-base font-semibold border border-[var(--color-primary)] hover:opacity-90 transition shadow-sm"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
            onClick={() => router.push("/dashboard/vendors/create")}
          >
            + Create Vendor
          </Button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {vendors.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-lg">
              No vendors found. Click "Create Vendor" to add your first vendor.
            </div>
          ) : (
            <div className="overflow-x-auto md:overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Industry
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      City
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-2 font-medium">{vendor.name}</td>
                      <td className="px-4 py-2">{vendor.industry || "-"}</td>
                      <td className="px-4 py-2">{vendor.email || "-"}</td>
                      <td className="px-4 py-2">{vendor.phone || "-"}</td>
                      <td className="px-4 py-2">
                        {vendor.address?.city || "-"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="relative inline-block text-left">
                          <button
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            aria-haspopup="true"
                            aria-expanded={deleteId === vendor._id}
                            onClick={() =>
                              setDeleteId(
                                deleteId === vendor._id ? null : vendor._id
                              )
                            }
                          >
                            <FiMoreHorizontal className="text-xl text-gray-500" />
                          </button>
                          {deleteId === vendor._id && (
                            <div className="absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg focus:outline-none">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  setDeleteId(null);
                                  router.push(
                                    `/dashboard/vendors/edit/${vendor._id}`
                                  );
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setShowConfirm(true);
                                  setDeleteId(vendor._id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Confirm Delete Dialog */}
              {showConfirm && deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
                    <div className="text-lg font-semibold mb-4">
                      Delete Vendor?
                    </div>
                    <div className="mb-6 text-gray-600">
                      Are you sure you want to delete this vendor? This action
                      cannot be undone.
                    </div>
                    <div className="flex justify-end gap-2">
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
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
