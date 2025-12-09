"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryStore } from "@/financeStore/useCategoryStore";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useSubcategoryStore } from "@/financeStore/useSubcategoryStore";
import CategoryModal from "@/finance/CategoryModal";
import SubcategoryModal from "@/finance/SubcategoryModal";
import { useVendorStore } from "@/financeStore/useVendorStore";
import { useRouter, useParams } from "next/navigation";
import { useItemStore } from "@/financeStore/useItemStore";

export default function EditItemPage() {
  const params = useParams();
  const itemId = params.id;
  const allItems = useItemStore((state) => state.items);
  const updateItem = useItemStore((state) => state.updateItem);
  const item = allItems.find((it) => String(it._id) === String(itemId));

  const [form, setForm] = useState({
    name: item?.name || "",
    sku: item?.sku || "",
    description: item?.description || "",
    type: item?.type || "goods",
    category: item?.category || "",
    subcategory: item?.subcategory || "",
    hsn: item?.hsn || "",
    unit: item?.unit || "",
    weight: item?.weight || "",
    igst: item?.igst || "",
    sgst: item?.sgst || "",
    cgst: item?.cgst || "",
    length: item?.length || "",
    width: item?.width || "",
    height: item?.height || "",
    dimensionUnit: item?.dimensionUnit || "cm",
    imageUrl: item?.imageUrl || null,
    sellingPrice: item?.sellingPrice || "",
    salesDescription: item?.salesDescription || "",
    costPrice: item?.costPrice || "",
    purchaseDescription: item?.purchaseDescription || "",
    preferredVendor: item?.preferredVendor || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const categories = useCategoryStore((state) => state.categories);
  const createCategory = useCategoryStore((state) => state.createCategory);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const subcategories = useSubcategoryStore((state) => state.subcategories);
  const createSubcategory = useSubcategoryStore(
    (state) => state.createSubcategory
  );
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [taxType, setTaxType] = useState<"inter" | "intra">(
    item?.igst ? "inter" : "intra"
  );
  const [autoSplitGST, setAutoSplitGST] = useState(true);
  const [totalGST, setTotalGST] = useState("");
  const vendors = useVendorStore((state) => state.vendors);
  const router = useRouter();

  // Update form when item changes (e.g. after navigation)
  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        sku: item.sku || "",
        description: item.description || "",
        type: item.type || "goods",
        category: item.category || "",
        subcategory: item.subcategory || "",
        hsn: item.hsn || "",
        unit: item.unit || "",
        weight: item.weight || "",
        igst: item.igst || "",
        sgst: item.sgst || "",
        cgst: item.cgst || "",
        length: item.length || "",
        width: item.width || "",
        height: item.height || "",
        dimensionUnit: item.dimensionUnit || "cm",
        imageUrl: item.imageUrl || null,
        sellingPrice: item.sellingPrice || "",
        salesDescription: item.salesDescription || "",
        costPrice: item.costPrice || "",
        purchaseDescription: item.purchaseDescription || "",
        preferredVendor: item.preferredVendor || "",
      });
    }
  }, [item]);

  // Filter subcategories for the selected category
  const selectedCategoryObj = categories.find(
    (cat) => cat.name === form.category
  );
  const filteredSubcategories = selectedCategoryObj
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
    const { name, value, type, files } = e.target as any;
    if (type === "file") {
      const file = files && files[0] ? files[0] : null;
      setForm({ ...form, [name]: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
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
    if (Object.keys(errs).length === 0 && item) {
      await updateItem(item._id, {
        name: form.name,
        sku: form.sku,
        description: form.description,
        type: form.type,
        category: form.category,
        subcategory: form.subcategory,
        hsn: form.hsn,
        unit: form.unit,
        weight: form.weight,
        length: form.length,
        width: form.width,
        height: form.height,
        dimensionUnit: form.dimensionUnit,
        imageUrl: form.imageUrl || undefined,
        igst: Number(form.igst) || 0,
        sgst: Number(form.sgst) || 0,
        cgst: Number(form.cgst) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        salesDescription: form.salesDescription,
        costPrice: Number(form.costPrice) || 0,
        purchaseDescription: form.purchaseDescription,
        preferredVendor: form.preferredVendor,
      });
      router.back();
    }
  };

  // Handler for adding new category via modal
  const handleAddCategory = async (name: string, description: string) => {
    await createCategory({ name, description });
    setForm((f) => ({ ...f, category: name }));
    setShowCategoryModal(false);
  };
  // Handler for adding new subcategory via modal
  const handleAddSubcategory = async (name: string, description: string) => {
    const selectedCategory = categories.find(
      (cat) => cat.name === form.category
    );
    if (!selectedCategory) {
      alert("Please select a category before adding a subcategory.");
      return;
    }
    await createSubcategory({
      name,
      description,
      category: selectedCategory._id,
    });
    setForm((f) => ({ ...f, subcategory: name }));
    setShowSubcategoryModal(false);
  };

  return (
    <div className="relative min-h-screen p-0 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 mt-4 md:mt-0">Edit Item</h1>
        {/* Basic Info Card */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Name *</label>
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
              <label className="block text-xs font-semibold mb-1">SKU</label>
              <Input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. SKU12345"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Type *</label>
              <div className="flex gap-4 p-2 rounded mt-1">
                <label className="flex items-center gap-1 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="type"
                    value="goods"
                    checked={form.type === "goods"}
                    onChange={handleChange}
                    className="accent-[var(--color-primary)]"
                  />
                  Good
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="type"
                    value="service"
                    checked={form.type === "service"}
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
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
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
                  disabled={!filteredSubcategories.length}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        filteredSubcategories.length
                          ? "Select subcategory"
                          : "No subcategories"
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
        {/* Image & Dimensions Card */}
        <div className="grid grid-cols-1  gap-6 mb-6">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Image</h2>
            <Input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 rounded border"
                />
              </div>
            )}
          </Card>
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
        </div>
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
                <label className="block text-xs font-semibold mb-1">
                  Preferred Vendor
                </label>
                <div className="flex gap-2 items-center">
                  <Select
                    value={form.preferredVendor || ""}
                    onValueChange={(val) =>
                      setForm({ ...form, preferredVendor: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          vendors.length ? "Select vendor" : "No vendors"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor._id} value={vendor.name}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="p-2"
                    onClick={() => router.push("/dashboard/vendors/create")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
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
          className="px-4 py-2 rounded font-semibold border"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          className="px-4 py-2 rounded font-semibold border border-[var(--color-primary)] hover:opacity-90 transition"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          Save Changes
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
