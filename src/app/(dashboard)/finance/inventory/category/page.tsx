"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCategoryStore, Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/stores/financeStore/useCategoryStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import CategoryModal from "@/components/finance/CategoryModal";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";

export default function CategoriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    categories,
    loading,
    creating,
    updating,
    deleting,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  } = useCategoryStore();

  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });

  useEffect(() => {
    if (user?.companyId) {
      fetchCategories();
    }
  }, [user?.companyId, fetchCategories]);

  // Bulk selection effect removed

  const handleViewCategory = (categoryId: string) => {
    router.push(`/finance/inventory/subcategory?categoryId=${categoryId}`);
  };

  const handleAddCategory = async (name: string, description: string) => {
    if (!user?.companyId) return;
    clearError();
    try {
      const categoryData: CreateCategoryPayload = {
        name: name,
        description: description,
      };
      await createCategory(categoryData);
      setAddCategoryModalOpen(false);
      setSuccessMessage({
        title: "Success",
        message: "Category created successfully!",
      });
      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    } catch (error: any) {
      // Store will handle the error, we don't need to set local error
      console.error("Failed to create category:", error);
    }
  };

  const handleEditCategory = async (name: string, description: string) => {
    if (!editingCategory || !user?.companyId) return;
    clearError();
    try {
      const categoryData: UpdateCategoryPayload = {
        name: name,
        description: description,
      };
      await updateCategory(editingCategory._id, categoryData);
      setEditingCategory(null);
      setAddCategoryModalOpen(false);
      setSuccessMessage({
        title: "Success",
        message: "Category updated successfully!",
      });
      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    } catch (error: any) {
      // Store will handle the error, we don't need to set local error
      console.error("Failed to update category:", error);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete({
      id: category._id,
      name: category.name,
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete || deleting) return;

    clearError();

    try {
      await deleteCategory(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setSuccessMessage({
        title: "Success",
        message: `Category "${categoryToDelete.name}" has been successfully deleted.`,
      });
      setShowSuccessDialog(true);

      // Auto hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    } catch (error: any) {
      // Store will handle the error, we don't need to set local error
      console.error("Error deleting category:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
    clearError();
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setAddCategoryModalOpen(true);
  };

  const handleModalClose = () => {
    setAddCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Bulk selection handlers removed

  if (loading) {
    return (
      <div
        className="max-w-[98vw] w-full mx-auto rounded-md shadow-sm p-4 sm:p-6 md:p-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, idx) => (
              <div key={idx} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="max-w-[98vw] w-full mx-auto rounded-md shadow-sm p-4 sm:p-6 md:p-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => {
            clearError();
            fetchCategories();
          }}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="max-w-[98vw] w-full mx-auto px-4 sm:px-6"
        style={{
          background: "var(--color-card)",
          color: "var(--color-card-foreground)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-6">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your inventory categories
            </p>
          </div>
          <Button onClick={() => setAddCategoryModalOpen(true)}>
            Add Category
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Filter Section */}
        {isFilterActive && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search by name..."
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset filters logic here
                }}
              >
                Clear Filters
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // Apply filters logic here
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

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
                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-1/5">
                  Name
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-2/5">
                  Description
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-1/6">
                  Subcategories
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-1/6">
                  Created At
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-medium uppercase tracking-wider rounded-tr-lg text-[var(--color-muted-foreground)] w-1/12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ background: "var(--color-card)" }}>
              {loading
                ? // Loading skeleton
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
                : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-12">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-medium mb-2">No categories yet</div>
                        <div className="text-sm mb-4">Add your first category to get started!</div>
                        <Button onClick={() => setAddCategoryModalOpen(true)}>
                          Add Category
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category, idx) => (
                    <tr
                      key={category?._id}
                      className="transition-colors border-b border-zinc-300 bg-[var(--color-card)] hover:bg-[var(--color-muted)]/60 text-sm"
                    >
                      <td className="px-4 py-4 whitespace-nowrap font-medium w-1/5">
                        <Link 
                          href={`/finance/inventory/subcategory?categoryId=${category?._id}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {category?.name}
                        </Link>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)] w-2/5">
                        {category?.description || <span className="text-gray-400">—</span>}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-[var(--color-muted-foreground)] w-1/6">
                        0
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-[var(--color-muted-foreground)] w-1/6">
                        {category?.createdAt ? new Date(category?.createdAt).toLocaleDateString() : "—"}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium w-1/12">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0" type="button" aria-label="Actions">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCategory(category._id)}>
                              View Subcategories
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(category)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory(category)} 
                              className="text-red-600 focus:text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Modal */}
        <CategoryModal
          open={addCategoryModalOpen}
          mode={editingCategory ? "edit" : "create"}
          initialName={editingCategory?.name || ""}
          initialDescription={editingCategory?.description || ""}
          onSave={editingCategory ? handleEditCategory : handleAddCategory}
          onCancel={() => {
            clearError();
            handleModalClose();
          }}
          error={error}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          show={showDeleteModal}
          title="Delete Category"
          message={
            <div>
              <p>Are you sure you want to delete the category <strong>"{categoryToDelete?.name}"</strong>?</p>
              <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText={deleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          type="danger"
          disableConfirm={deleting}
          disableCancel={deleting}
        />

        {/* Success Dialog */}
        <ConfirmationDialog
          show={showSuccessDialog}
          title={successMessage.title}
          message={successMessage.message}
          onConfirm={() => setShowSuccessDialog(false)}
          onCancel={() => setShowSuccessDialog(false)}
          confirmText="OK"
          type="success"
        />
      </div>
    </div>
  );
}
