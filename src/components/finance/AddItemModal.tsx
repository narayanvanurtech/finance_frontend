import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryStore } from "@/stores/financeStore/useCategoryStore";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSubcategoryStore } from "@/stores/financeStore/useSubcategoryStore";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useItemStore } from "@/stores/financeStore/useItemStore";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (item: {
    name: string;
    sku?: string;
    description: string;
    type: string;
    category?: string;
    subcategory?: string;
    hsn?: string;
    unit?: string;
    weight?: string;
    length?: string;
    width?: string;
    height?: string;
    dimensionUnit?: string;
    image?: File | null;
    igst?: number;
    sgst?: number;
    cgst?: number;
    sellingPrice?: number;
    salesDescription?: string;
    costPrice?: number;
    purchaseDescription?: string;
    preferredVendor?: string;
  }) => void;
  initialValues?: {
    name: string;
    sku?: string;
    description: string;
    type: string;
    category?: string;
    subcategory?: string;
    hsn?: string;
    unit?: string;
    weight?: string;
    length?: string;
    width?: string;
    height?: string;
    dimensionUnit?: string;
    image?: File | null;
    igst?: number | string;
    sgst?: number | string;
    cgst?: number | string;
    sellingPrice?: number | string;
    salesDescription?: string;
    costPrice?: number | string;
    purchaseDescription?: string;
    preferredVendor?: string;
  };
  submitLabel?: string;
}

export default function AddItemModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  submitLabel = "Add Item",
}: AddItemModalProps) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    type: "goods" as "goods" | "service",
    category: "",
    subcategory: "",
    hsn: "",
    unit: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    image: null as File | null,
    igst: "",
    sgst: "",
    cgst: "",
    sellingPrice: "",
    salesDescription: "",
    costPrice: "",
    purchaseDescription: "",
    preferredVendor: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const categories = useCategoryStore((state) => state.categories);
  const createCategory = useCategoryStore((state) => state.createCategory);
  const subcategories = useSubcategoryStore((state) => state.subcategories);
  const createSubcategory = useSubcategoryStore(
    (state) => state.createSubcategory
  );
  const vendors = useVendorStore((state) => state.vendors);
  const router = useRouter();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [taxType, setTaxType] = useState<"inter" | "intra">("inter");
  const [autoSplitGST, setAutoSplitGST] = useState(true);
  const [totalGST, setTotalGST] = useState("");
  const createItem = useItemStore((state) => state.createItem);

  // Filter subcategories for the selected category
  const selectedCategoryObj = categories.find(
    (cat) => cat.name === form.category
  );
  const filteredSubcategories = selectedCategoryObj
    ? subcategories.filter(
        (sub) => sub.category?._id === selectedCategoryObj._id
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

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        sku: initialValues.sku || "",
        description: initialValues.description || "",
        type: (initialValues.type as "goods" | "service") || "goods",
        category: initialValues.category || "",
        subcategory: initialValues.subcategory || "",
        hsn: initialValues.hsn || "",
        unit: initialValues.unit || "",
        weight: initialValues.weight || "",
        length: initialValues.length || "",
        width: initialValues.width || "",
        height: initialValues.height || "",
        dimensionUnit: initialValues.dimensionUnit || "cm",
        image: initialValues.image || null,
        igst: initialValues.igst?.toString() || "",
        sgst: initialValues.sgst?.toString() || "",
        cgst: initialValues.cgst?.toString() || "",
        sellingPrice: initialValues.sellingPrice?.toString() || "",
        salesDescription: initialValues.salesDescription || "",
        costPrice: initialValues.costPrice?.toString() || "",
        purchaseDescription: initialValues.purchaseDescription || "",
        preferredVendor: initialValues.preferredVendor || "",
      });
      if (initialValues.image) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(initialValues.image as File);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm({
        name: "",
        sku: "",
        description: "",
        type: "goods",
        category: "",
        subcategory: "",
        hsn: "",
        unit: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        dimensionUnit: "cm",
        image: null,
        igst: "",
        sgst: "",
        cgst: "",
        sellingPrice: "",
        salesDescription: "",
        costPrice: "",
        purchaseDescription: "",
        preferredVendor: "",
      });
      setImagePreview(null);
    }
  }, [initialValues, open]);

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
    if (Object.keys(errs).length === 0) {
      await createItem({
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
        igst: parseFloat(form.igst) || 0,
        sgst: parseFloat(form.sgst) || 0,
        cgst: parseFloat(form.cgst) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        salesDescription: form.salesDescription,
        costPrice: parseFloat(form.costPrice) || 0,
        purchaseDescription: form.purchaseDescription,
        preferredVendor: form.preferredVendor,
      });
      setForm({
        name: "",
        sku: "",
        description: "",
        type: "goods",
        category: "",
        subcategory: "",
        hsn: "",
        unit: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        dimensionUnit: "cm",
        image: null,
        igst: "",
        sgst: "",
        cgst: "",
        sellingPrice: "",
        salesDescription: "",
        costPrice: "",
        purchaseDescription: "",
        preferredVendor: "",
      });
      setImagePreview(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-full max-w-full max-h-[90vh] overflow-auto px-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">
            {submitLabel === "Add Item" ? "Add New Item" : "Edit Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Item Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
                {errors.name && (
                  <div
                    className="text-xs mt-1"
                    style={{ color: "var(--color-destructive)" }}
                  >
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
          </div>
          {/* Image & Dimensions Card */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="p-6 border rounded">
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
            </div>
            <div className="p-6 border rounded">
              <h2 className="font-semibold text-lg mb-4">Dimensions</h2>
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <Input
                  type="number"
                  name="length"
                  value={form.length}
                  onChange={handleChange}
                  placeholder="Length"
                  min="0"
                  className="w-24 md:w-1/4"
                />
                <span className="mx-1">×</span>
                <Input
                  type="number"
                  name="width"
                  value={form.width}
                  onChange={handleChange}
                  placeholder="Width"
                  min="0"
                  className="w-24 md:w-1/4"
                />
                <span className="mx-1">×</span>
                <Input
                  type="number"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="Height"
                  min="0"
                  className="w-24 md:w-1/4"
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
            </div>
          </div>
          {/* Tax Card */}
          <div className="p-6 border rounded mb-6">
            <h2 className="font-semibold text-lg mb-4">Tax Information</h2>
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1">
                Tax Type
              </label>
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
          </div>
          {/* Sales & Purchase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
            <div className="p-6 border rounded">
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
            </div>
            <div className="p-6 border rounded">
              <h2 className="font-semibold text-lg mb-4">
                Purchase Information
              </h2>
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
            </div>
          </div>
          {/* Modals for Category and Subcategory */}
          {/* You can implement CategoryModal and SubcategoryModal here if needed, similar to the create page */}
          {/* Action Buttons */}
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <button
                type="button"
                className="px-4 py-2 rounded font-medium border border-[var(--color-muted)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition"
                style={{
                  background: "var(--color-muted)",
                  color: "var(--color-muted-foreground)",
                }}
                onClick={onClose}
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              className="px-4 py-2 rounded font-semibold border border-[var(--color-primary)] hover:opacity-90 transition"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              }}
            >
              {submitLabel}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
