"use client";
import { useCategoryStore } from "@/stores/financeStore/useCategoryStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import CategoryModal from "@/components/finance/CategoryModal";

export default function CategoriesPage() {
  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Open modal for create or edit
  const openModal = (category?: {
    _id: string;
    name: string;
    description?: string;
  }) => {
    if (category) {
      setEditId(category._id);
      setName(category.name);
      setDescription(category.description || "");
    } else {
      setEditId(null);
      setName("");
      setDescription("");
    }
    setModalOpen(true);
  };

  // Handle create or edit
  const handleSave = async (modalName: string, modalDescription: string) => {
    if (modalName.trim() === "") return;
    if (editId !== null) {
      await updateCategory(editId, {
        name: modalName.trim(),
        description: modalDescription.trim(),
      });
    } else {
      await createCategory({
        name: modalName.trim(),
        description: modalDescription.trim(),
      });
    }
    setModalOpen(false);
    setName("");
    setDescription("");
    setEditId(null);
  };

  // Handle delete
  const handleDelete = () => {
    if (deleteId !== null) {
      deleteCategory(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => openModal()}>Add Category</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4 font-semibold">Name</th>
              <th className="py-2 px-4 font-semibold">Description</th>
              <th className="py-2 px-4 font-semibold">No. of Subcategories</th>
              <th className="py-2 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-6">
                  No categories yet. Add your first category!
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className="border-t">
                  <td className="py-2 px-4">
                    <Link
                      href={`/user/finance/inventory/subcategory?categoryId=${cat._id}`}
                      className="text-primary underline hover:opacity-80"
                    >
                      {cat.name}
                    </Link>
                  </td>
                  <td className="py-2 px-4">
                    {cat.description || (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {cat.subcategoriesCount || 0}
                  </td>
                  <td className="py-2 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal(cat)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(cat._id)}
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
        open={modalOpen}
        mode={editId !== null ? "edit" : "create"}
        initialName={name}
        initialDescription={description}
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
      />
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this category?</div>
          <DialogFooter>
            <Button onClick={() => setDeleteId(null)} variant="outline">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
