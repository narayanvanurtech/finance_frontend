"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/api/finance/categoryApi";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Check, ChevronsUpDown, ArrowLeft } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import CategoryModal from "@/components/finance/CategoryModal";
import SubcategoryModal from "@/components/finance/SubcategoryModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  useItemById,
  useUpdateItem,
  useUploadItemImage,
  useDeleteItemImage,
  useUpdateItemImage,
} from "@/hooks/useItemQueries";
import {
  useGetCategories,
  useCreateCategory,
} from "@/hooks/useCategoryQueries";
import {
  useGetSubcategories,
  useCreateSubcategory,
} from "@/hooks/useSubcategoryQueries";
import { useGetVendors } from "@/hooks/useVendorQueries";
import { Vendor } from "@/api/finance/vendorApi";

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // If it's a relative path from backend, prepend the API base URL
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  // Remove trailing slash from baseURL if exists
  const cleanBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  // Ensure imagePath starts with /
  const cleanImagePath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;
  return `${cleanBaseURL}/public${cleanImagePath}`;
};

export default function EditItemPage() {
  const params = useParams();
  const itemId = params.id as string;
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>(() => {
    // Initialize companyId from localStorage immediately
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentCompanyId") || "";
    }
    return "";
  });

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    type: "Good",
    category: "",
    subcategory: "",
    hsn: "",
    unit: "",
    weight: "",
    igst: "",
    sgst: "",
    cgst: "",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    sellingPrice: "",
    salesDescription: "",
    costPrice: "",
    purchaseDescription: "",
    preferredVendor: "",
    trackInventory: false,
    openingStock: "",
    currentStock: "",
    lowStockThreshold: "",
    highStockThreshold: "",
    expiryDate: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>("");

  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [taxType, setTaxType] = useState<"inter" | "intra">("inter");
  const [autoSplitGST, setAutoSplitGST] = useState(true);
  const [totalGST, setTotalGST] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Update companyId if it changes in localStorage (optional, for real-time updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedCompanyId = localStorage.getItem("currentCompanyId") || "";
      if (storedCompanyId !== companyId) {
        setCompanyId(storedCompanyId);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [companyId]);

  // React Query hooks
  const {
    data: itemData,
    isLoading: itemLoading,
    error: itemError,
  } = useItemById(companyId, itemId);
  console.log("itemData", itemData);
  const currentItem = itemData?.result;

  const {
    mutateAsync: updateItem,
    isPending: updateLoading,
    error: updateError,
  } = useUpdateItem(companyId, itemId);

  const { mutateAsync: uploadImageMutation } = useUploadItemImage();
  const { mutateAsync: deleteImageMutation } = useDeleteItemImage();
  const { mutateAsync: updateImageMutation } = useUpdateItemImage(itemId);
  const { mutateAsync: createCategoryMutation } = useCreateCategory();
  const { mutateAsync: createSubcategoryMutation } = useCreateSubcategory();

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategories({ companyId }, { enabled: !!companyId });

  const categories = useMemo(
    () => categoriesData?.categories || [],
    [categoriesData]
  );

  // Get selected category object
  const selectedCategoryObj = useMemo(
    () => categories.find((cat: Category) => cat.name === form.category),
    [categories, form.category]
  );

  // Fetch subcategories for selected category
  const { data: subcategories = [], isLoading: subcategoriesLoading } =
    useGetSubcategories(
      {
        companyId,
        category: selectedCategoryObj?._id,
      },
      {
        enabled: !!companyId && !!selectedCategoryObj?._id,
      }
    );

  // Fetch vendors
  const { data: vendorsResponse } = useGetVendors();
  const vendors = useMemo(
    () => vendorsResponse?.result?.vendors || [],
    [vendorsResponse]
  );

  // Filter subcategories for the selected category
  const filteredSubcategories = useMemo(
    () =>
      selectedCategoryObj && subcategories
        ? subcategories.filter(
            (sub: any) => sub.category._id === selectedCategoryObj._id
          )
        : [],
    [selectedCategoryObj, subcategories]
  );

  // Populate form when currentItem changes
  useEffect(() => {
    if (currentItem) {
      const categoryName =
        typeof currentItem.category === "object"
          ? currentItem.category.name
          : currentItem.category;

      const subcategoryName =
        typeof currentItem.subcategory === "object"
          ? currentItem.subcategory.name
          : currentItem.subcategory;

      const vendorName =
        typeof (currentItem as any).preferredVendor === "object"
          ? (currentItem as any).preferredVendor?.name ||
            (currentItem as any).preferredVendor?.vendorName ||
            ""
          : (currentItem as any).preferredVendor;

      setForm({
        name: currentItem.name || "",
        sku: (currentItem as any).sku || "",
        description: currentItem.description || "",
        type: currentItem.type === "goods" ? "Good" : "Service",
        category: categoryName || "",
        subcategory: subcategoryName || "",
        hsn: currentItem.hsn || "",
        unit: currentItem.unit || "",
        weight: (currentItem as any).weight || "",
        igst: (currentItem as any).igst?.toString() || "",
        sgst: (currentItem as any).sgst?.toString() || "",
        cgst: (currentItem as any).cgst?.toString() || "",
        length: (currentItem as any).length || "",
        width: (currentItem as any).width || "",
        height: (currentItem as any).height || "",
        dimensionUnit: (currentItem as any).dimensionUnit || "cm",
        sellingPrice: currentItem.sellingPrice?.toString() || "",
        salesDescription: (currentItem as any).salesDescription || "",
        costPrice: currentItem.costPrice?.toString() || "",
        purchaseDescription: (currentItem as any).purchaseDescription || "",
        preferredVendor: vendorName || "",
        trackInventory: currentItem.trackInventory || false,
        openingStock: (currentItem as any).openingStock?.toString() || "",
        currentStock: currentItem.currentStock?.toString() || "",
        lowStockThreshold: currentItem.lowStockThreshold?.toString() || "",
        highStockThreshold:
          (currentItem as any).highStockThreshold?.toString() || "",
        expiryDate: (currentItem as any).expiryDate
          ? new Date((currentItem as any).expiryDate)
              .toISOString()
              .split("T")[0]
          : "",
      });

      setSelectedVendor(vendorName || "");

      // Set tax type based on current item
      const itemWithTax = currentItem as any;
      if (itemWithTax.igst && itemWithTax.igst > 0) {
        setTaxType("inter");
      } else if (
        (itemWithTax.sgst && itemWithTax.sgst > 0) ||
        (itemWithTax.cgst && itemWithTax.cgst > 0)
      ) {
        setTaxType("intra");
        setTotalGST(
          ((itemWithTax.sgst || 0) + (itemWithTax.cgst || 0)).toString()
        );
      }

      // Set image preview if exists
      if (currentItem.imageUrl) {
        console.log(
          "sdfdsfdsfsdfdsfdsfdsfs",
          getImageUrl(currentItem.imageUrl)
        );

        setImagePreview(getImageUrl(currentItem.imageUrl));
      }
    }
  }, [currentItem]);

  // Set selected vendor when both currentItem and vendors are loaded
  useEffect(() => {
    if (currentItem && Array.isArray(vendors) && vendors.length > 0) {
      let vendorToSelect = "";
      const itemWithVendor = currentItem as any;

      if (
        typeof itemWithVendor.preferredVendor === "object" &&
        itemWithVendor.preferredVendor
      ) {
        const vendorId = itemWithVendor.preferredVendor._id;
        const vendorName =
          itemWithVendor.preferredVendor.name ||
          itemWithVendor.preferredVendor.vendorName;

        const foundVendor = vendors.find(
          (v: any) => v._id === vendorId || v.name === vendorName
        );
        if (foundVendor) {
          vendorToSelect = (foundVendor as any).name;
        }
      } else if (
        typeof itemWithVendor.preferredVendor === "string" &&
        itemWithVendor.preferredVendor
      ) {
        const foundVendor = vendors.find(
          (v: any) =>
            v._id === itemWithVendor.preferredVendor ||
            v.name === itemWithVendor.preferredVendor
        );
        if (foundVendor) {
          vendorToSelect = (foundVendor as any).name;
        } else {
          vendorToSelect = itemWithVendor.preferredVendor;
        }
      }

      if (vendorToSelect && vendorToSelect !== selectedVendor) {
        setSelectedVendor(vendorToSelect);
      }
    }
  }, [currentItem, vendors, selectedVendor]);

  const COMMON_UNITS = [
    { value: "pcs", label: "pcs" },
    { value: "box", label: "box" },
    { value: "kg", label: "kg" },
    { value: "g", label: "g" },
    { value: "m", label: "m" },
    { value: "cm", label: "cm" },
    { value: "inch", label: "inch" },
    { value: "set", label: "set" },
    { value: "dozen", label: "dozen" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const files = (e.target as HTMLInputElement).files;

    if (type === "file") {
      const file = files && files[0] ? files[0] : null;
      setNewImageFile(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(getImageUrl(currentItem?.imageUrl) || null);
      }
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.name) errs.name = "Name is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);

    if (!companyId) {
      setErrors({ ...errs, companyId: "Company ID is required" });
      return;
    }

    if (Object.keys(errs).length === 0 && currentItem) {
      try {
        // Find the actual category and subcategory objects
        const categoryObj = categories.find(
          (cat: Category) => cat.name === form.category
        );
        const subcategoryObj = subcategories.find(
          (sub: any) => sub.name === form.subcategory
        );
        const vendorObj = vendors.find(
          (vendor: Vendor) => vendor.name === form.preferredVendor
        );

        const updateData: any = {
          companyId,
          name: form.name,
          sku: form.sku,
          description: form.description,
          type: form.type === "Good" ? "goods" : "service",
          category: categoryObj?._id || "",
          subcategory: subcategoryObj?._id || "",
          hsn: form.hsn,
          unit: form.unit,
          weight: form.weight,
          length: form.length,
          width: form.width,
          height: form.height,
          dimensionUnit: form.dimensionUnit,
          igst: parseFloat(form.igst) || 0,
          sgst: parseFloat(form.sgst) || 0,
          cgst: parseFloat(form.cgst) || 0,
          sellingPrice: parseFloat(form.sellingPrice) || 0,
          salesDescription: form.salesDescription,
          costPrice: parseFloat(form.costPrice) || 0,
          purchaseDescription: form.purchaseDescription,
          trackInventory: form.trackInventory,
          openingStock: parseFloat(form.openingStock) || 0,
          currentStock: parseFloat(form.currentStock) || 0,
          lowStockThreshold: parseFloat(form.lowStockThreshold) || 0,
          highStockThreshold: parseFloat(form.highStockThreshold) || 0,
        };

        // Add expiryDate only if provided
        if (form.expiryDate) {
          updateData.expiryDate = form.expiryDate;
        }

        // Only add preferredVendor if it's selected
        if (vendorObj?._id) {
          updateData.preferredVendor = vendorObj._id;
        }

        await updateItem(updateData);

        // Handle image upload/deletion if changed
        if (newImageFile) {
          // Use the new updateImageMutation for seamless image replacement
          await updateImageMutation(newImageFile);
        } else if (!imagePreview && currentItem.imageUrl) {
          // Delete image if removed
          await deleteImageMutation(currentItem._id);
        }

        // Navigate back to items list
        router.push("/finance/inventory/items");
      } catch (error) {
        console.error("Failed to update item:", error);
      }
    }
  };

  // Handler for adding new category via modal
  const handleAddCategory = async (name: string, description: string) => {
    try {
      await createCategoryMutation({
        companyId,
        name,
        description,
      });
      setForm((f) => ({ ...f, category: name }));
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  // Handler for adding new subcategory via modal
  const handleAddSubcategory = async (name: string, description: string) => {
    const selectedCategory = categories.find(
      (cat: Category) => cat.name === form.category
    );
    if (!selectedCategory) {
      alert("Please select a category before adding a subcategory.");
      return;
    }
    try {
      await createSubcategoryMutation({
        companyId,
        name,
        description,
        category: selectedCategory._id,
      });
      setForm((f) => ({ ...f, subcategory: name }));
      setShowSubcategoryModal(false);
    } catch (error) {
      console.error("Failed to create subcategory:", error);
    }
  };

  const filteredVendors = vendors.filter(
    (vendor: any) =>
      vendor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      vendor.phone.includes(searchValue)
  );

  const handleVendorSelect = (vendor: any) => {
    setForm((prev) => ({ ...prev, preferredVendor: vendor.name }));
    setSelectedVendor(vendor.name);
    setOpenCombobox(false);
    setSearchValue("");
  };

  const handleOpenChange = (open: boolean) => {
    setOpenCombobox(open);
    if (!open) {
      setSearchValue("");
    }
  };

  const clearSelection = () => {
    setSelectedVendor("");
    setForm((prev) => ({ ...prev, preferredVendor: "" }));
    setSearchValue("");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setNewImageFile(null);
  };

  const loading = itemLoading || updateLoading;
  const errorMessage =
    itemError instanceof Error
      ? itemError.message
      : updateError instanceof Error
      ? updateError.message
      : null;

  // Loading state - also show loading when companyId is not yet available
  if (!companyId || itemLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading item details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (itemError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Error Loading Item</h3>
          <p className="text-muted-foreground mb-4">
            {errorMessage || "An unexpected error occurred"}
          </p>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // No current item state
  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Item Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The item you're looking for doesn't exist.
          </p>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-0 md:p-8 flex flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 mt-4 md:mt-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Item</h1>
            <p className="text-muted-foreground">
              SKU: {(currentItem as any).sku || "N/A"}
            </p>
          </div>
        </div>

        {/* Display global error */}
        {updateError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              {(updateError as any)?.response?.data?.message ||
                (updateError as any)?.message ||
                "Failed to update item"}
            </p>
          </div>
        )}

        {/* Basic Info Card */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Form Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Apple iPhone 15"
                />
                {errors.name && (
                  <div className="text-xs mt-1 text-destructive">
                    {errors.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  SKU
                </label>
                <Input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. DELL-INS-2025"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Type *
                </label>
                <div className="flex gap-4 p-2 rounded mt-1">
                  <label className="flex items-center gap-1 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="type"
                      value="Good"
                      checked={form.type === "Good"}
                      onChange={handleChange}
                      className="accent-[var(--color-primary)]"
                    />
                    Good
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="type"
                      value="Service"
                      checked={form.type === "Service"}
                      onChange={handleChange}
                      className="accent-[var(--color-primary)]"
                    />
                    Service
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Category
                </label>
                <div className="flex gap-2 items-center">
                  <Select
                    value={form.category || ""}
                    onValueChange={(val) =>
                      setForm({ ...form, category: val, subcategory: "" })
                    }
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No categories
                        </SelectItem>
                      ) : (
                        categories.map((cat: Category) => (
                          <SelectItem key={cat._id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="p-2"
                    onClick={() => setShowCategoryModal(true)}
                    disabled={categoriesLoading}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Subcategory
                </label>
                <div className="flex gap-2 items-center">
                  <Select
                    value={form.subcategory || ""}
                    onValueChange={(val) =>
                      setForm({ ...form, subcategory: val })
                    }
                    disabled={
                      !form.category ||
                      subcategoriesLoading ||
                      !filteredSubcategories.length
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !form.category
                            ? "Select category first"
                            : filteredSubcategories.length
                            ? "Select subcategory"
                            : "No subcategories "
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map((sub: any) => (
                        <SelectItem key={sub._id} value={sub.name}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="p-2"
                    onClick={() => setShowSubcategoryModal(true)}
                    disabled={!form.category}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Unit</label>
                <Select
                  value={
                    COMMON_UNITS.some((u) => u.value === form.unit)
                      ? form.unit
                      : "other"
                  }
                  onValueChange={(val) => {
                    if (val === "other") {
                      setForm({ ...form, unit: "" });
                    } else {
                      setForm({ ...form, unit: val });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(!COMMON_UNITS.some((u) => u.value === form.unit) ||
                  form.unit === "") && (
                  <Input
                    className="mt-2"
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="Enter custom unit"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  HSN/SAC
                </label>
                <Input
                  type="text"
                  name="hsn"
                  value={form.hsn || ""}
                  onChange={handleChange}
                  placeholder="e.g. 8471"
                />
              </div>
            </div>
            {/* Right: Image Upload */}
            <div className="w-full md:w-60 flex flex-col items-center md:items-end">
              <label className="block text-xs font-semibold mb-1 self-start">
                Image
              </label>
              <div className="mb-2 text-xs text-muted-foreground self-start">
                Upload a new image to update. Max size: 2MB
              </div>
              <DragDropImageUpload
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setNewImageFile={setNewImageFile}
                onRemove={handleRemoveImage}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold mb-1">
              Description
            </label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Short description of the item"
            />
          </div>
        </Card>

        {/* Inventory Tracking Card */}
        {form.type === "Good" && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Inventory Management</h2>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="trackInventory"
                  checked={form.trackInventory}
                  onChange={handleChange}
                  className="accent-[var(--color-primary)]"
                />
                <span className="text-sm font-medium">
                  Track inventory for this item
                </span>
              </label>
            </div>

            {form.trackInventory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Opening Stock
                  </label>
                  <Input
                    type="number"
                    name="openingStock"
                    value={form.openingStock}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Current Stock
                  </label>
                  <Input
                    type="number"
                    name="currentStock"
                    value={form.currentStock}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 75"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Low Stock Threshold
                  </label>
                  <Input
                    type="number"
                    name="lowStockThreshold"
                    value={form.lowStockThreshold}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    High Stock Threshold
                  </label>
                  <Input
                    type="number"
                    name="highStockThreshold"
                    value={form.highStockThreshold}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 1000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Dimensions Card */}
        {form.type === "Good" && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Dimensions</h2>
              <div className="flex gap-2 items-center mb-4">
                <Input
                  type="number"
                  name="length"
                  value={form.length}
                  onChange={handleChange}
                  placeholder="Length"
                  min="0"
                  className="w-1/4"
                />
                <span className="mx-1">×</span>
                <Input
                  type="number"
                  name="width"
                  value={form.width}
                  onChange={handleChange}
                  placeholder="Width"
                  min="0"
                  className="w-1/4"
                />
                <span className="mx-1">×</span>
                <Input
                  type="number"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="Height"
                  min="0"
                  className="w-1/4"
                />
                <Select
                  value={form.dimensionUnit}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, dimensionUnit: val }))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="mm">mm</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Weight
                </label>
                <Input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="e.g. 1.5 (kg)"
                  min="0"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Tax Card */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Tax Information</h2>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1">Tax Type</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="taxType"
                  value="inter"
                  checked={taxType === "inter"}
                  onChange={() => {
                    setTaxType("inter");
                    setForm((f) => ({ ...f, igst: "", sgst: "", cgst: "" }));
                  }}
                  className="accent-[var(--color-primary)]"
                />
                Inter-state (IGST)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="taxType"
                  value="intra"
                  checked={taxType === "intra"}
                  onChange={() => {
                    setTaxType("intra");
                    setForm((f) => ({ ...f, igst: "", sgst: "", cgst: "" }));
                  }}
                  className="accent-[var(--color-primary)]"
                />
                Intra-state (CGST + SGST)
              </label>
            </div>
          </div>
          {taxType === "intra" && (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSplitGST"
                checked={autoSplitGST}
                onChange={(e) => {
                  setAutoSplitGST(e.target.checked);
                  if (e.target.checked) {
                    setForm((f) => ({
                      ...f,
                      cgst: f.sgst || f.cgst || "",
                      sgst: f.sgst || f.cgst || "",
                    }));
                  }
                }}
                className="accent-[var(--color-primary)]"
              />
              <label
                htmlFor="autoSplitGST"
                className="text-xs select-none cursor-pointer"
              >
                Auto-calculate CGST/SGST (split equally)
              </label>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taxType === "inter" ? (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  IGST (%)
                </label>
                <Input
                  type="number"
                  name="igst"
                  value={form.igst || ""}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 18"
                />
              </div>
            ) : (
              <>
                {autoSplitGST ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Total GST (%)
                      </label>
                      <Input
                        type="number"
                        name="totalGST"
                        value={totalGST}
                        onChange={(e) => {
                          setTotalGST(e.target.value);
                          const half = e.target.value
                            ? (Number(e.target.value) / 2).toString()
                            : "";
                          setForm((f) => ({ ...f, sgst: half, cgst: half }));
                        }}
                        min="0"
                        placeholder="e.g. 18"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        SGST (%)
                      </label>
                      <Input
                        type="number"
                        name="sgst"
                        value={form.sgst || ""}
                        readOnly
                        placeholder="Auto-calculated"
                        tabIndex={-1}
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        CGST (%)
                      </label>
                      <Input
                        type="number"
                        name="cgst"
                        value={form.cgst || ""}
                        readOnly
                        placeholder="Auto-calculated"
                        tabIndex={-1}
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        SGST (%)
                      </label>
                      <Input
                        type="number"
                        name="sgst"
                        value={form.sgst || ""}
                        onChange={handleChange}
                        min="0"
                        placeholder="e.g. 9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        CGST (%)
                      </label>
                      <Input
                        type="number"
                        name="cgst"
                        value={form.cgst || ""}
                        onChange={handleChange}
                        min="0"
                        placeholder="e.g. 9"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Sales & Purchase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Sales Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Selling Price (INR)
                </label>
                <Input
                  type="number"
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 1200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Description
                </label>
                <Textarea
                  name="salesDescription"
                  value={form.salesDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Sales Description"
                />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Purchase Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Cost Price (INR)
                </label>
                <Input
                  type="number"
                  name="costPrice"
                  value={form.costPrice}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Description
                </label>
                <Textarea
                  name="purchaseDescription"
                  value={form.purchaseDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Purchase Description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Vendor
                </label>
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                    onClick={() => setOpenCombobox(true)}
                  >
                    {selectedVendor || "Select preferred vendor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="p-2"
                    title="Add new vendor"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Vendor Selection Dialog */}
                <Dialog open={openCombobox} onOpenChange={handleOpenChange}>
                  <DialogContent className="p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search vendors..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>No vendors found.</CommandEmpty>
                        {filteredVendors.length > 0 && (
                          <CommandGroup>
                            {filteredVendors.map((vendor: any) => (
                              <CommandItem
                                key={vendor._id}
                                value={vendor.name}
                                onSelect={() => handleVendorSelect(vendor)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedVendor === vendor.name
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {vendor.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {vendor.email} • {vendor.phone}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </DialogContent>
                </Dialog>

                {/* Clear button for selected vendor */}
                {selectedVendor && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={clearSelection}
                  >
                    Clear Selection
                  </Button>
                )}

                {/* Display selected vendor info */}
                {selectedVendor && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <div className="text-sm">
                      <strong>Selected:</strong> {selectedVendor}
                    </div>
                    {(() => {
                      const vendor = filteredVendors.find(
                        (v: any) =>
                          v.name === selectedVendor || v._id === selectedVendor
                      );
                      return vendor ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          {(vendor as any).email} • {(vendor as any).phone}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex justify-end gap-2 mt-4 mb-6">
          <Button
            type="button"
            variant="outline"
            className="px-4 py-2 rounded font-semibold border border-muted-foreground text-muted-foreground hover:bg-muted"
            onClick={handleGoBack}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Item"}
          </Button>
        </div>
      </form>

      {/* Modals for Category and Subcategory */}
      <CategoryModal
        open={showCategoryModal}
        mode="create"
        onSave={handleAddCategory}
        onCancel={() => setShowCategoryModal(false)}
      />
      <SubcategoryModal
        open={showSubcategoryModal}
        mode="create"
        onSave={handleAddSubcategory}
        onCancel={() => setShowSubcategoryModal(false)}
      />
    </div>
  );
}

function DragDropImageUpload({
  imagePreview,
  setImagePreview,
  setNewImageFile,
  onRemove,
}: {
  imagePreview: string | null;
  setImagePreview: (v: string | null) => void;
  setNewImageFile: (file: File | null) => void;
  onRemove: () => void;
}) {
  const [dragActive, setDragActive] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fileInfo, setFileInfo] = React.useState<{
    name: string;
    size: number;
  } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB.");
      return;
    }
    setNewImageFile(file);
    setFileInfo({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
    setFileInfo(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className={`w-full md:w-56 h-36 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer transition-colors relative outline-none ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-muted"
      } ${error ? "border-red-500" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
        setHovered(false);
      }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      role="button"
      aria-label="Upload image"
      onKeyDown={handleKeyDown}
      style={{ position: "relative" }}
    >
      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {dragActive && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-70 flex flex-col items-center justify-center z-10 rounded">
          <span className="text-blue-700 font-semibold">
            Drop image to upload
          </span>
        </div>
      )}
      {imagePreview ? (
        <div className="relative w-full h-full flex items-center justify-center group">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-28 rounded border w-auto mx-auto"
          />
          <button
            type="button"
            aria-label="Remove image"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md z-20 border-2 border-white"
            style={{
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
            onClick={handleRemove}
            tabIndex={0}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleRemove(e as any);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Remove image</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
                stroke="white"
              />
            </svg>
            <span className="sr-only">Remove image</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="mb-1 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm9 3a4 4 0 100 8 4 4 0 000-8z"
            />
          </svg>
          <span className="text-xs text-muted-foreground text-center">
            Drag & drop or click to upload image
          </span>
        </div>
      )}
      <div className="w-full mt-2 text-center">
        {fileInfo && imagePreview && !error && (
          <span className="block text-xs text-muted-foreground truncate">
            {fileInfo.name} ({formatSize(fileInfo.size)})
          </span>
        )}
        {error && (
          <span className="block text-xs text-red-600 mt-1">{error}</span>
        )}
      </div>
    </div>
  );
}
