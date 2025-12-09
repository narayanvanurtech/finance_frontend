"use client";
import { useSearchParams } from "next/navigation";
import { useCategoryStore } from "@/financeStore/useCategoryStore";
import { useSubcategoryStore } from "@/financeStore/useSubcategoryStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import SubcategoryModal from "@/finance/SubcategoryModal";

function SubcategoriesContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const { categories } = useCategoryStore();
  const parentCategory = categories.find((cat) => cat._id === categoryId);
  const {
    subcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useSubcategoryStore();
  const filteredSubcategories = useMemo(
    () => subcategories.filter((sub) => sub.category._id === categoryId),
    [subcategories, categoryId]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Open modal for create or edit
  const openModal = (subcategory?: {
    _id: string;
    name: string;
    description?: string;
  }) => {
    if (subcategory) {
      setEditId(subcategory._id);
      setName(subcategory.name);
      setDescription(subcategory.description || "");
    } else {
      setEditId(null);
      setName("");
      setDescription("");
    }
    setModalOpen(true);
  };

  // Handle create or edit
  const handleSave = async (modalName: string, modalDescription: string) => {
    if (modalName.trim() === "" || !categoryId) return;
    if (editId !== null) {
      await updateSubcategory(editId, {
        name: modalName.trim(),
        description: modalDescription.trim(),
      });
    } else {
      await createSubcategory({
        name: modalName.trim(),
        description: modalDescription.trim(),
        category: categoryId,
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
      deleteSubcategory(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link
          href="/dashboard/inventory/catagory"
          className="text-muted-foreground hover:text-primary underline text-sm"
        >
          &larr; Back to Categories
        </Link>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subcategories</h1>
          {parentCategory && (
            <div className="text-muted-foreground text-sm">
              for Category:{" "}
              <span className="font-semibold">{parentCategory.name}</span>
            </div>
          )}
        </div>
        <Button onClick={() => openModal()}>Add Subcategory</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4 font-semibold">Name</th>
              <th className="py-2 px-4 font-semibold">Description</th>
              <th className="py-2 px-4 font-semibold">No. of Items</th>
              <th className="py-2 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubcategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-6">
                  No subcategories yet. Add your first subcategory!
                </td>
              </tr>
            ) : (
              filteredSubcategories.map((sub) => (
                <tr key={sub._id} className="border-t">
                  <td className="py-2 px-4">
                    <Link
                      href={`/user/finance/inventory/items?subcategoryId=${sub._id}`}
                      className="text-primary underline hover:opacity-80"
                    >
                      {sub.name}
                    </Link>
                  </td>
                  <td className="py-2 px-4">
                    {sub.description || (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">0</td>
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
                        <DropdownMenuItem onClick={() => openModal(sub)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(sub._id)}
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
            <DialogTitle>Delete Subcategory</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this subcategory?</div>
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

export default function SubcategoriesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SubcategoriesContent />
    </Suspense>
  );
}
