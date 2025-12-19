"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCategoryStore } from "@/stores/financeStore/useCategoryStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Package } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const { user } = useAuthStore();
  const { categories, updateCategory, updating, fetchCategories } =
    useCategoryStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  useEffect(() => {
    // Fetch categories if not already loaded
    if (categories.length === 0) {
      fetchCategories();
    }

    // Find the category to edit
    const category = categories.find((cat) => cat._id === categoryId);

    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
      });
      setLoading(false);
    } else if (categories.length > 0) {
      // Category not found
      toast.error("Category not found");
      router.push("/finance/inventory/category");
    }
  }, [categoryId, categories, fetchCategories, router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.companyId) {
      toast.error("Error", {
        description: "User not authenticated",
      });
      return;
    }

    try {
      await updateCategory(categoryId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      });

      toast.success("Success", {
        description: "Category updated successfully!",
      });

      router.push("/finance/inventory/category");
    } catch (error: any) {
      console.error("Failed to update category:", error);
      toast.error("Failed to update category", {
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (loading) {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-background)" }}
      >
        <div className="animate-pulse text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <p className="text-[var(--color-muted-foreground)]">
            Loading category...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/finance/inventory/category"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Package className="h-6 w-6" />
            </div>
            Edit Category
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
            Update category information
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-lg border border-[var(--color-border)] p-6 shadow-sm"
          style={{ background: "var(--color-card)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter category name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
                disabled={updating}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter category description (optional)"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={errors.description ? "border-red-500" : ""}
                disabled={updating}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300"
                disabled={updating}
              />
              <Label htmlFor="isActive" className="text-sm font-medium">
                Active
              </Label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={updating}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                {updating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Category
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/finance/inventory/category")}
                disabled={updating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
