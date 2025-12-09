"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryStore } from "@/stores/financeStore/useCategoryStore";
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
import { useSubcategoryStore } from "@/stores/financeStore/useSubcategoryStore";
import CategoryModal from "@/components/finance/CategoryModal";
import SubcategoryModal from "@/components/finance/SubcategoryModal";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { useItemStore } from "@/stores/financeStore/useItemStore";
import { Item } from "@/api/finance/itemApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function EditItemPage() {
  const params = useParams();
  const itemId = params.id as string;
  const router = useRouter();
  
  const {
    currentItem,
    loading,
    error,
    getItemById,
    updateItem,
    clearCurrentItem,
    clearError,
    uploadItemImage,
    deleteItemImage,
  } = useItemStore();

  const { categories, fetchCategories, createCategory } = useCategoryStore();
  const { subcategories, fetchSubcategories, createSubcategory } = useSubcategoryStore();
  const { vendors, fetchVendors, searchVendors, searchResults, clearSearchResults, loading: vendorLoading } = useVendorStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "goods" as "goods" | "service",
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

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  
  // Tax configuration
  const [taxType, setTaxType] = useState<"inter" | "intra">("inter");
  const [autoSplitGST, setAutoSplitGST] = useState(true);
  const [totalGST, setTotalGST] = useState("");
  
  // Vendor selection
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [itemNotFound, setItemNotFound] = useState(false);

  // Debounced search function
  const debouncedSearchVendors = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (searchTerm.trim()) {
            try {
              await searchVendors(searchTerm.trim());
            } catch (error) {
              console.error("Failed to search vendors:", error);
            }
          } else {
            clearSearchResults();
          }
        }, 300); // 300ms debounce
      };
    })(),
    [searchVendors, clearSearchResults]
  );

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchVendors(),
          getItemById(itemId),
        ]);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setItemNotFound(true);
        }
      }
    };

    loadData();

    return () => {
      clearCurrentItem();
      clearError();
    };
  }, [itemId, fetchCategories, fetchVendors, getItemById, clearCurrentItem, clearError]);

  // Populate form when currentItem changes
  useEffect(() => {
    if (currentItem) {
      const categoryName = typeof currentItem.category === 'object' 
        ? currentItem.category.name 
        : currentItem.category;
      
      const subcategoryName = typeof currentItem.subcategory === 'object' 
        ? currentItem.subcategory.name 
        : currentItem.subcategory;

      const vendorName = typeof currentItem.preferredVendor === 'object' 
        ? (currentItem.preferredVendor?.name || currentItem.preferredVendor?.vendorName || "") 
        : currentItem.preferredVendor;

      setForm({
        name: currentItem.name || "",
        description: currentItem.description || "",
        type: currentItem.type || "goods",
        category: categoryName || "",
        subcategory: subcategoryName || "",
        hsn: currentItem.hsn || "",
        unit: currentItem.unit || "",
        weight: currentItem.weight || "",
        igst: currentItem.igst?.toString() || "",
        sgst: currentItem.sgst?.toString() || "",
        cgst: currentItem.cgst?.toString() || "",
        length: currentItem.length || "",
        width: currentItem.width || "",
        height: currentItem.height || "",
        dimensionUnit: currentItem.dimensionUnit || "cm",
        sellingPrice: currentItem.sellingPrice?.toString() || "",
        salesDescription: currentItem.salesDescription || "",
        costPrice: currentItem.costPrice?.toString() || "",
        purchaseDescription: currentItem.purchaseDescription || "",
        preferredVendor: vendorName || "",
        trackInventory: currentItem.trackInventory || false,
        openingStock: currentItem.openingStock?.toString() || "",
        currentStock: currentItem.currentStock?.toString() || "",
        lowStockThreshold: currentItem.lowStockThreshold?.toString() || "",
        highStockThreshold: currentItem.highStockThreshold?.toString() || "",
        expiryDate: currentItem.expiryDate ? new Date(currentItem.expiryDate).toISOString().split('T')[0] : "",
      });

      setSelectedVendor(vendorName || "");

      // Set tax type based on current item
      if (currentItem.igst && currentItem.igst > 0) {
        setTaxType("inter");
      } else if ((currentItem.sgst && currentItem.sgst > 0) || (currentItem.cgst && currentItem.cgst > 0)) {
        setTaxType("intra");
        setTotalGST(((currentItem.sgst || 0) + (currentItem.cgst || 0)).toString());
      }

      // Set image preview if exists
      if (currentItem.imageUrl) {
        setImagePreview(currentItem.imageUrl);
      }
    }
  }, [currentItem]);

  // Set selected vendor when both currentItem and vendors are loaded
  useEffect(() => {
    if (currentItem && vendors.length > 0) {
      let vendorToSelect = "";
      
      if (typeof currentItem.preferredVendor === 'object' && currentItem.preferredVendor) {
        // If preferredVendor is an object, try to find it by ID first, then by name
        const vendorId = currentItem.preferredVendor._id;
        const vendorName = currentItem.preferredVendor.name || currentItem.preferredVendor.vendorName;
        
        const foundVendor = vendors.find((v: any) => v._id === vendorId || v.name === vendorName);
        if (foundVendor) {
          vendorToSelect = foundVendor.name;
        }
      } else if (typeof currentItem.preferredVendor === 'string' && currentItem.preferredVendor) {
        // If preferredVendor is a string, it could be either an ID or a name
        const foundVendor = vendors.find((v: any) => 
          v._id === currentItem.preferredVendor || v.name === currentItem.preferredVendor
        );
        if (foundVendor) {
          vendorToSelect = foundVendor.name;
        } else {
          // If not found in vendors list, treat it as a name
          vendorToSelect = currentItem.preferredVendor;
        }
      }
      
      if (vendorToSelect && vendorToSelect !== selectedVendor) {
        setSelectedVendor(vendorToSelect);
      }
    }
  }, [currentItem, vendors, selectedVendor]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const selectedCategoryObj = categories.find(
      (cat: Category) => cat.name === form.category
    );
    if (selectedCategoryObj && selectedCategoryObj._id) {
      fetchSubcategories({ category: selectedCategoryObj._id });
    }
  }, [form.category, categories, fetchSubcategories]);

  // Filter subcategories for the selected category
  const selectedCategoryObj = categories.find(
    (cat: Category) => cat.name === form.category
  );
  const filteredSubcategories =
    selectedCategoryObj && subcategories
      ? subcategories.filter(
          (sub) => sub.category._id === selectedCategoryObj._id
        )
      : [];

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
        setImagePreview(currentItem?.imageUrl || null);
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
    if (!form.sellingPrice) errs.sellingPrice = "Selling price is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    
    if (Object.keys(errs).length === 0 && currentItem) {
      try {
        // Find the actual category and subcategory objects
        const categoryObj = categories.find(
          (cat: Category) => cat.name === form.category
        );
        const subcategoryObj = subcategories.find(
          (sub) => sub.name === form.subcategory
        );
        const vendorObj = vendors.find(
          (vendor: any) => vendor.name === form.preferredVendor
        );

        const updateData: Partial<Item> = {
          name: form.name,
          description: form.description,
          type: form.type,
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
          preferredVendor: vendorObj?._id || "",
          trackInventory: form.trackInventory,
          openingStock: parseFloat(form.openingStock) || 0,
          currentStock: parseFloat(form.currentStock) || 0,
          lowStockThreshold: parseFloat(form.lowStockThreshold) || 0,
          highStockThreshold: parseFloat(form.highStockThreshold) || 0,
          expiryDate: form.expiryDate || undefined,
        };

        await updateItem(currentItem._id, updateData);

        // Handle image upload/deletion if changed
        if (newImageFile) {
          await uploadItemImage(currentItem._id, newImageFile);
        } else if (!imagePreview && currentItem.imageUrl) {
          await deleteItemImage(currentItem._id);
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
      await createCategory({ name, description });
      await fetchCategories();
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
      await createSubcategory({
        name,
        description,
        category: selectedCategory._id,
      });
      await fetchSubcategories({ category: selectedCategory._id });
      setForm((f) => ({ ...f, subcategory: name }));
      setShowSubcategoryModal(false);
    } catch (error) {
      console.error("Failed to create subcategory:", error);
    }
  };

  const filteredVendors = searchValue ? searchResults : vendors;

  const handleVendorSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearchVendors(value);
  };

  const handleVendorSelect = (vendor: any) => {
    setForm(prev => ({ ...prev, preferredVendor: vendor.name }));
    setSelectedVendor(vendor.name);
    setOpenCombobox(false);
    setSearchValue("");
    clearSearchResults();
  };

  const handleOpenChange = (open: boolean) => {
    setOpenCombobox(open);
    if (!open) {
      setSearchValue("");
      clearSearchResults();
    }
  };

  const clearVendorSelection = () => {
    setSelectedVendor("");
    setForm(prev => ({ ...prev, preferredVendor: "" }));
    setSearchValue("");
    clearSearchResults();
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setNewImageFile(null);
  };

  // Loading state
  if (loading) {
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
  if (error || itemNotFound) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            {itemNotFound ? "Item Not Found" : "Error Loading Item"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {itemNotFound 
              ? "The item you're looking for doesn't exist." 
              : error || "An unexpected error occurred"}
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
          <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-0 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 mt-4 md:mt-0">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Item</h1>
            <p className="text-muted-foreground">SKU: {currentItem.sku}</p>
          </div>
        </div>

        {/* Display global error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
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
                  Type *
                </label>
                <div className="flex gap-4 p-2 rounded mt-1">
                  <label className="flex items-center gap-1 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="type"
                      value="goods"
                      checked={form.type === "goods"}
                      onChange={(e) => setForm({...form, type: e.target.value as "goods" | "service"})}
                      className="accent-[var(--color-primary)]"
                    />
                    Goods
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="type"
                      value="service"
                      checked={form.type === "service"}
                      onChange={(e) => setForm({...form, type: e.target.value as "goods" | "service"})}
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
                    onValueChange={(val) => setForm({ ...form, category: val, subcategory: "" })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: Category) => (
                        <SelectItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="p-2"
                    onClick={() => setShowCategoryModal(true)}
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
                    disabled={!form.category || !filteredSubcategories.length}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !form.category
                            ? "Select category first"
                            : filteredSubcategories.length
                            ? "Select subcategory"
                            : "No subcategories available"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map((sub) => (
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
        {form.type === "goods" && (
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
                <span className="text-sm font-medium">Track inventory for this item</span>
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
        {form.type === "goods" && (
          <Card className="p-6 mb-6">
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
              <label className="block text-xs font-semibold mb-1">Weight</label>
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
                  Selling Price (INR) *
                </label>
                <Input
                  type="number"
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 1200"
                />
                {errors.sellingPrice && (
                  <div className="text-xs mt-1 text-destructive">
                    {errors.sellingPrice}
                  </div>
                )}
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
                        onValueChange={handleVendorSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {vendorLoading && searchValue ? "Searching..." : 
                           searchValue ? "No vendors found." : "No vendors available"}
                        </CommandEmpty>
                        {filteredVendors.length > 0 ? (
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
                        ) : (
                          <CommandEmpty>
                            {vendorLoading && searchValue ? "Searching..." : 
                             searchValue ? "No vendors found." : "No vendors available"}
                          </CommandEmpty>
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
                    onClick={clearVendorSelection}
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
                      // Find vendor by name, or by ID if selectedVendor is an ID
                      const vendor = filteredVendors.find(
                        (v: any) => v.name === selectedVendor || v._id === selectedVendor
                      );
                      return vendor ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          {vendor.email} • {vendor.phone}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="w-full max-w-3xl flex justify-end gap-2 mt-4">
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
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 rounded font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Item"}
        </Button>
      </div>
      
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
            style={{ outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
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
