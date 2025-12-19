"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCategoryStore } from "@/stores/financeStore/useCategoryStore";
import { useSubcategoryStore } from "@/stores/financeStore/useSubcategoryStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Layers, Search, Tag } from "lucide-react";
import { FiMoreVertical, FiTrash2, FiEdit } from "react-icons/fi";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import { toast } from "sonner";

function SubcategoriesContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories } = useCategoryStore();
  const parentCategory = categories.find((cat) => cat._id === categoryId);

  const {
    subcategories,
    loading,
    fetchSubcategories,
    deleteSubcategory,
    clearError,
  } = useSubcategoryStore();

  const filteredSubcategories = useMemo(() => {
    if (!Array.isArray(subcategories)) return [];
    return subcategories.filter((sub) => {
      if (!sub.category) return false;
      const subCatId =
        typeof sub.category === "object" ? sub.category._id : sub.category;
      return subCatId === categoryId;
    });
  }, [subcategories, categoryId]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const searchFilteredSubcategories = useMemo(
    () =>
      filteredSubcategories.filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [filteredSubcategories, searchTerm]
  );

  // Pagination calculations
  const totalItems = searchFilteredSubcategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubcategories = searchFilteredSubcategories.slice(
    startIndex,
    endIndex
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  useEffect(() => {
    if (!categoryId) {
      router.push("/finance/inventory/category");
      return;
    }
    if (user?.companyId) {
      fetchSubcategories({ companyId: user.companyId, category: categoryId });
    }
  }, [categoryId, fetchSubcategories, router, user]);

  const handleDeleteConfirm = async () => {
    if (!subcategoryToDelete) return;
    setDeleting(true);
    clearError();
    try {
      await deleteSubcategory(subcategoryToDelete._id);
      toast.success("Subcategory deleted successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete subcategory");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSubcategoryToDelete(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-background)]">
      <div className="max-w-[98vw] mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/finance/inventory/category"
          className="flex items-center gap-2 text-sm text-gray-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers /> Subcategories
            </h1>
            {parentCategory && (
              <p className="text-sm text-gray-500 mt-1">
                Category: {parentCategory.name}
              </p>
            )}
          </div>
          <Link
            href={`/finance/inventory/subcategory/create?categoryId=${categoryId}`}
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Total Subcategories
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {filteredSubcategories.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Active Subcategories
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {filteredSubcategories.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Filtered Results
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {searchFilteredSubcategories.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search subcategories..."
            className="w-full pl-9 py-2 border rounded-md"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Created</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <tr
                      key={`skeleton-${idx}`}
                      className="animate-pulse border-b"
                    >
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                      </td>
                    </tr>
                  ))
              ) : paginatedSubcategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    <Tag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <div className="font-medium mb-1">
                      {searchTerm
                        ? "No subcategories found"
                        : "No subcategories yet"}
                    </div>
                    <div className="text-sm">
                      {searchTerm
                        ? "Try adjusting your search"
                        : "Add your first subcategory!"}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSubcategories.map((sub) => (
                  <tr
                    key={sub._id}
                    onClick={() =>
                      router.push(
                        `/finance/inventory/subcategory/edit/${sub._id}?categoryId=${categoryId}`
                      )
                    }
                    className="cursor-pointer border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-blue-600">
                      {sub.name}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {sub.description || "—"}
                    </td>

                    <td className="px-4 py-3 text-center text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Popover
                        open={openPopoverId === sub._id}
                        onOpenChange={(open) =>
                          setOpenPopoverId(open ? sub._id : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded hover:bg-gray-200"
                          >
                            <FiMoreVertical />
                          </button>
                        </PopoverTrigger>

                        <PopoverContent align="end" className="w-40 p-2">
                          <Link
                            href={`/finance/inventory/subcategory/edit/${sub._id}?categoryId=${categoryId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded"
                          >
                            <FiEdit /> Edit
                          </Link>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubcategoryToDelete(sub);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-100 rounded w-full"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalItems > 0 && (
          <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-[var(--color-muted-foreground)]">
                  Items per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="px-3 py-1 border border-[var(--color-border)] rounded bg-[var(--color-card)] text-[var(--color-foreground)]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Pagination info */}
              <div className="text-sm text-[var(--color-muted-foreground)]">
                Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(endIndex, totalItems)} of {totalItems} subcategories
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-[var(--color-border)] rounded bg-[var(--color-card)] text-[var(--color-foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-muted)]/60"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 border rounded ${
                              currentPage === page
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-[var(--color-card)] text-[var(--color-foreground)] border-[var(--color-border)] hover:bg-[var(--color-muted)]/60"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-2 text-[var(--color-muted-foreground)]"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-[var(--color-border)] rounded bg-[var(--color-card)] text-[var(--color-foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-muted)]/60"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete dialog */}
        <ConfirmationDialog
          show={showDeleteModal}
          title="Delete Subcategory"
          message={`Are you sure you want to delete "${subcategoryToDelete?.name}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          confirmText={deleting ? "Deleting..." : "Delete"}
          type="danger"
        />
      </div>
    </div>
  );
}

export default function SubcategoriesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SubcategoriesContent />
    </Suspense>
  );
}
