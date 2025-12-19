"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import {
  useGetCategories,
  useDeleteCategory,
} from "@/hooks/useCategoryQueries";
import { Button } from "@/components/ui/button";
import { Plus, Package, Search, Layers } from "lucide-react";
import { FiMoreVertical, FiTrash2, FiEdit, FiEye } from "react-icons/fi";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Link from "next/link";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import { toast } from "sonner";

export default function CategoriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build filters for the query
  const filters = useMemo(() => {
    const f: any = {
      companyId: user?.companyId || "",
    };
    if (debouncedSearchTerm) f.search = debouncedSearchTerm;
    f.page = currentPage;
    f.limit = itemsPerPage;
    return f;
  }, [debouncedSearchTerm, currentPage, itemsPerPage, user?.companyId]);

  // Fetch categories using React Query
  const { data: categoriesData, isLoading, refetch } = useGetCategories(filters, {
    enabled: !!user?.companyId,
  });
  const deleteCategoryMutation = useDeleteCategory();

  // Extract categories from response
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as any)?.categories || (categoriesData as any)?.data || [];

  const pagination = (categoriesData as any)?.pagination || (categoriesData as any)?.result?.pagination || {
    total: Math.ceil((categories?.length || 0) / itemsPerPage),
    count: categories?.length || 0,
    page: currentPage,
    limit: itemsPerPage,
  };

  const handleViewCategory = (categoryId: string) => {
    router.push(`/finance/inventory/subcategory?categoryId=${categoryId}`);
  };

  // Helper function to get subcategories count
  const getSubcategoriesCount = (category: any) => {
    if (typeof category.subcategoriesCount === 'number') {
      return category.subcategoriesCount;
    }
    return 0;
  };

  // Filter categories based on search
  const filteredCategories = categories || [];

  const handleDeleteCategory = (category: any) => {
    setCategoryToDelete({
      id: category._id,
      name: category.name,
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      toast.success("Success", {
        description: `Category "${categoryToDelete.name}" has been successfully deleted.`,
      });
      refetch();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category", {
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred",
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

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

  // Show skeleton while fetching data
  if (isLoading && (!categories || categories.length === 0)) {
    return (
      <div
        className="max-w-[98vw] w-full mx-auto rounded-md shadow-sm p-4 sm:p-6 md:p-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="h-12 bg-gray-200 rounded"></div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-[98vw] w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <Package className="h-6 w-6" />
                </div>
                Inventory Categories
              </h1>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
                Organize and manage your product categories
              </p>
            </div>
            <Link href="/finance/inventory/category/create">
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Total Categories
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {categories?.length || 0}
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
                  Active Categories
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                  {categories?.length || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
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
                  {filteredCategories.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-lg border border-[var(--color-border)] mt-6">
          <table
            className="min-w-full divide-y rounded-lg overflow-hidden text-sm"
            style={{ borderColor: "var(--color-border)" }}
          >
            <thead
              className="sticky top-0 z-10"
              style={{ background: "var(--color-muted)" }}
            >
              <tr>
                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-1/4">
                  Name
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-2/5">
                  Description
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-1/6">
                  Subcategories
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-1/6">
                  Status
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-medium uppercase tracking-wider rounded-tr-lg text-[var(--color-muted-foreground)] w-1/12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ background: "var(--color-card)" }}>
              {isLoading ? (
                // Loading skeleton
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                      </td>
                    </tr>
                  ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-12">
                    <div className="flex flex-col items-center">
                      <Package className="h-16 w-16 text-gray-300 mb-4" />
                      <div className="text-lg font-medium mb-2">
                        {searchTerm
                          ? "No categories found"
                          : "No categories yet"}
                      </div>
                      <div className="text-sm mb-4">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Add your first category to get started!"}
                      </div>
                      {!searchTerm && (
                        <Link href="/finance/inventory/category/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category: any, idx: any) => (
                  <tr
                    key={category?._id}
                    onClick={() =>
                      router.push(
                        `/finance/inventory/category/edit/${category._id}`
                      )
                    }
                    className="transition-colors border-b border-zinc-300 bg-[var(--color-card)] hover:bg-[var(--color-muted)]/60 text-sm cursor-pointer"
                  >
                    <td className="px-4 py-4 whitespace-nowrap font-medium w-1/4">
                      <Link
                        href={`/finance/inventory/category/edit/${category?._id}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline group"
                      >
                        <Package className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        {category?.name}
                      </Link>
                    </td>

                    <td className="px-4 py-4 text-sm text-[var(--color-muted-foreground)] w-2/5">
                      <div className="line-clamp-2">
                        {category?.description || (
                          <span className="text-gray-400 italic">
                            No description
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center w-1/6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCategory(category._id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full hover:from-purple-200 hover:to-pink-200 transition-all hover:scale-105 font-medium"
                        title="View subcategories"
                      >
                        <Layers className="h-3 w-3" />
                        {getSubcategoriesCount(category)}
                      </button>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center w-1/6">
                      {category?.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium w-1/12">
                      <Popover
                        open={openPopoverId === category._id}
                        onOpenChange={(isOpen) =>
                          setOpenPopoverId(isOpen ? category._id : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                            aria-label="Category actions"
                          >
                            <FiMoreVertical />
                          </button>
                        </PopoverTrigger>

                        <PopoverContent className="w-44 p-2" align="end">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCategory(category._id);
                                setOpenPopoverId(null);
                              }}
                              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2"
                              aria-label="View Subcategories"
                            >
                              <FiEye className="w-4 h-4" />
                              View Subcategories
                            </button>

                            <Link
                              href={`/finance/inventory/category/edit/${category._id}`}
                              onClick={() => setOpenPopoverId(null)}
                              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
                              aria-label="Edit Category"
                            >
                              <FiEdit className="w-4 h-4" />
                              Edit
                            </Link>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category);
                                setOpenPopoverId(null);
                              }}
                              className="px-3 py-2 rounded hover:bg-gray-100 text-red-600 text-sm text-left flex items-center gap-2"
                              aria-label="Delete Category"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
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
        {!isLoading && pagination && pagination.total > 0 && (
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
                Showing{" "}
                {pagination.count === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                to {Math.min(currentPage * itemsPerPage, pagination.count)} of{" "}
                {pagination.count} categories
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
                  {Array.from(
                    { length: pagination.total },
                    (_, i) => i + 1
                  ).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === pagination.total ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
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
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.total}
                  className="px-3 py-1 border border-[var(--color-border)] rounded bg-[var(--color-card)] text-[var(--color-foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-muted)]/60"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          show={showDeleteModal}
          title="Delete Category"
          message={
            <div>
              <p>
                Are you sure you want to delete the category{" "}
                <strong>"{categoryToDelete?.name}"</strong>?
              </p>
              <p className="mt-2 text-sm text-gray-600">
                This action cannot be undone.
              </p>
            </div>
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText={deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          type="danger"
          disableConfirm={deleteCategoryMutation.isPending}
          disableCancel={deleteCategoryMutation.isPending}
        />
      </div>
    </div>
  );
}
