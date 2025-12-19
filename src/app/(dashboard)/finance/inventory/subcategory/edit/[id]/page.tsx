"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSubcategoryStore } from "@/stores/financeStore/useSubcategoryStore";
import { useCategoryStore } from "@/stores/financeStore/useCategoryStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Layers } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function EditSubcategoryContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const subcategoryId = params.id as string;
  const categoryId = searchParams.get("categoryId");

  const { user } = useAuthStore();
  const {
    subcategories,
    updateSubcategory,
    loading: updating,
    fetchSubcategories,
  } = useSubcategoryStore();
  const { categories, fetchCategories } = useCategoryStore();

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
    // Fetch categories if not loaded
    if (categories.length === 0 && user?.companyId) {
      fetchCategories();
    }

    // Fetch subcategories if not loaded
    if (subcategories.length === 0 && categoryId && user?.companyId) {
      fetchSubcategories({ companyId: user.companyId, category: categoryId });
    }

    // Find the subcategory to edit
    const subcategory = subcategories.find((sub) => sub._id === subcategoryId);

    if (subcategory) {
      setFormData({
        name: subcategory.name,
        description: subcategory.description || "",
        isActive: subcategory.isActive,
      });
      setLoading(false);
    } else if (subcategories.length > 0) {
      // Subcategory not found
      toast.error("Subcategory not found");
      if (categoryId) {
        router.push(`/finance/inventory/subcategory?categoryId=${categoryId}`);
      } else {
        router.push("/finance/inventory/category");
      }
    }
  }, [
    subcategoryId,
    categoryId,
    subcategories,
    categories,
    fetchSubcategories,
    fetchCategories,
    router,
    user,
  ]);

  const subcategory = subcategories.find((sub) => sub._id === subcategoryId);
  const parentCategory = categories.find(
    (cat) =>
      cat._id ===
      (categoryId ||
        (typeof subcategory?.category === "object"
          ? subcategory?.category._id
          : subcategory?.category))
  );

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Subcategory name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Subcategory name must be at least 2 characters";
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
      await updateSubcategory(subcategoryId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      });

      toast.success("Success", {
        description: "Subcategory updated successfully!",
      });

      const redirectCategoryId =
        categoryId ||
        (typeof subcategory?.category === "object"
          ? subcategory?.category._id
          : subcategory?.category);

      if (redirectCategoryId) {
        router.push(
          `/finance/inventory/subcategory?categoryId=${redirectCategoryId}`
        );
      } else {
        router.push("/finance/inventory/category");
      }
    } catch (error: any) {
      console.error("Failed to update subcategory:", error);
      toast.error("Failed to update subcategory", {
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
          <Layers className="h-12 w-12 mx-auto mb-4 text-purple-500" />
          <p className="text-[var(--color-muted-foreground)]">
            Loading subcategory...
          </p>
        </div>
      </div>
    );
  }

  const backUrl = categoryId
    ? `/finance/inventory/subcategory?categoryId=${categoryId}`
    : "/finance/inventory/category";

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subcategories
          </Link>
          <h1 className="text-3xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <Layers className="h-6 w-6" />
            </div>
            Edit Subcategory
          </h1>
          {parentCategory && (
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
              Update subcategory in{" "}
              <span className="font-semibold text-[var(--color-foreground)] px-2 py-1 bg-[var(--color-muted)] rounded">
                {parentCategory.name}
              </span>
            </p>
          )}
        </div>

        {/* Form */}
        <div
          className="rounded-lg border border-[var(--color-border)] p-6 shadow-sm"
          style={{ background: "var(--color-card)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subcategory Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Subcategory Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter subcategory name"
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
                placeholder="Enter subcategory description (optional)"
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
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                {updating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Subcategory
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(backUrl)}
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

export default function EditSubcategoryPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <EditSubcategoryContent />
    </Suspense>
  );
}
