"use client";
import { useSearchParams } from "next/navigation";
import { useCategoryStore } from "@/stores/financeStore/useCategoryStore";
import { useSubcategoryStore } from "@/stores/financeStore/useSubcategoryStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import SubcategoryModal from "@/components/finance/SubcategoryModal";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import { toast } from "sonner";
import { color } from "framer-motion";

function SubcategoriesContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const { user } = useAuthStore();
  const { categories } = useCategoryStore();
  const parentCategory = categories.find((cat) => cat._id === categoryId);
  
  const { 
    subcategories, 
    loading, 
    error, 
    fetchSubcategories, 
    createSubcategory, 
    updateSubcategory, 
    deleteSubcategory,
    clearError 
  } = useSubcategoryStore();
  
  const filteredSubcategories = useMemo(() => 
    subcategories.filter((sub) => sub.category._id === categoryId), 
    [subcategories, categoryId]
  );

  const [addSubcategoryModalOpen, setAddSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  


  // Loading states for individual actions
  const [actionLoading, setActionLoading] = useState<{
    create: boolean;
    update: boolean;
    delete: boolean;
  }>({
    create: false,
    update: false,
    delete: false
  });

  // Fetch subcategories on component mount and when categoryId changes
  useEffect(() => {
    if (categoryId) {
      fetchSubcategories({ category: categoryId });
    }
  }, [categoryId, fetchSubcategories]);



  const showSuccessMessage = (title: string, message: string) => {
    toast.success(title, { description: message });
  };

  // Open modal for create or edit
  const openModal = (subcategory?: any) => {
    setEditingSubcategory(subcategory || null);
    setAddSubcategoryModalOpen(true);
  };

  const handleAddSubcategory = async (name: string, description: string) => {
    if (!categoryId) return;
    
    setActionLoading(prev => ({ ...prev, create: true }));
    clearError();
    
    try {
      await createSubcategory({
        name: name.trim(),
        description: description.trim(),
        category: categoryId,
        isActive: true,
      });
      
      // Refetch subcategories after adding
      await fetchSubcategories({ category: categoryId });
      
      showSuccessMessage(
        "Success",
        `"${name.trim()}" has been successfully created.`
      );
      
    } catch (error: any) {
      console.error("Failed to create subcategory:", error);
      toast.error("Failed to create subcategory", {
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, create: false }));
      setAddSubcategoryModalOpen(false);

    }
  };

  const handleEditSubcategory = async (name: string, description: string) => {
    if (!editingSubcategory || !categoryId) return;
    
    setActionLoading(prev => ({ ...prev, update: true }));
    clearError();
    
    try {
      await updateSubcategory(editingSubcategory._id, {
        name: name.trim(),
        description: description.trim(),
      });
      fetchSubcategories({ category: categoryId });
      showSuccessMessage(
        "Success",
        `"${name.trim()}" has been successfully updated.`
      );
      
      setEditingSubcategory(null);
      setAddSubcategoryModalOpen(false);
    } catch (error: any) {
      console.error("Failed to update subcategory:", error);
      toast.error("Failed to update subcategory", {
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleDeleteSubcategory = (subcategory: any) => {
    setSubcategoryToDelete({
      id: subcategory._id,
      name: subcategory.name,
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subcategoryToDelete) return;

    setActionLoading(prev => ({ ...prev, delete: true }));
    clearError();

    try {
      await deleteSubcategory(subcategoryToDelete.id);
      
      setShowDeleteModal(false);
      setSubcategoryToDelete(null);
      
      showSuccessMessage(
        "Success",
        `"${subcategoryToDelete.name}" has been successfully deleted.`
      );
    } catch (error: any) {
      console.error("Error deleting subcategory:", error);
      toast.error("Failed to delete subcategory", {
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSubcategoryToDelete(null);
    clearError();
  };

  const openEditModal = (subcategory: any) => {
    setEditingSubcategory(subcategory);
    setAddSubcategoryModalOpen(true);
  };

  const handleModalClose = () => {
    setAddSubcategoryModalOpen(false);
    setEditingSubcategory(null);
  };

  // Loading state
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


  return (
    <div className="w-full">
      <div
        className="max-w-[98vw] w-full mx-auto px-4 sm:px-6"
        style={{
          background: "var(--color-card)",
          color: "var(--color-card-foreground)",
        }}
      >
        {/* Breadcrumb */}
        <div className="pt-6 mb-4">
          <Link 
            href="/finance/inventory/category" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Categories
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Subcategories</h1>
            {parentCategory && (
              <p className="text-sm text-gray-600 mt-1">
                Managing subcategories for{" "}
                <span className="font-medium text-gray-900">{parentCategory.name}</span>
              </p>
            )}
          </div>
          <Button onClick={() => openModal()}>
            Add Subcategory
          </Button>
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
                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-1/5">
                  Name
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-2/5">
                  Description
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] w-1/6">
                  Items
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
                : filteredSubcategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-12">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-medium mb-2">No subcategories yet</div>
                        <div className="text-sm mb-4">Add your first subcategory to get started!</div>
                        <Button onClick={() => openModal()}>
                          Add Subcategory
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubcategories.map((sub, idx) => (
                    <tr
                      key={sub._id}
                      className="transition-colors border-b border-zinc-300 bg-[var(--color-card)] hover:bg-[var(--color-muted)]/60 text-sm"
                    >
                      <td className="px-4 py-4 whitespace-nowrap font-medium w-1/5">
                        <Link 
                          href={`/finance/inventory/items?subcategoryId=${sub._id}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {sub.name}
                        </Link>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)] w-2/5">
                        {sub.description || <span className="text-gray-400">—</span>}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-[var(--color-muted-foreground)] w-1/6">
                        0
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-[var(--color-muted-foreground)] w-1/6">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "—"}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium w-1/12">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0" type="button" aria-label="Actions">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(sub)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSubcategory(sub)} 
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
        <SubcategoryModal
          open={addSubcategoryModalOpen}
          mode={editingSubcategory ? "edit" : "create"}
          initialName={editingSubcategory?.name || ""}
          initialDescription={editingSubcategory?.description || ""}
          onSave={editingSubcategory ? handleEditSubcategory : handleAddSubcategory}
          onCancel={() => {
            clearError();
            handleModalClose();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          show={showDeleteModal}
          title="Delete Subcategory"
          message={
            <div>
              <p>Are you sure you want to delete the subcategory <strong>"{subcategoryToDelete?.name}"</strong>?</p>
              <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>
            </div>
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText={actionLoading.delete ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          type="danger"
          disableConfirm={actionLoading.delete}
          disableCancel={actionLoading.delete}
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