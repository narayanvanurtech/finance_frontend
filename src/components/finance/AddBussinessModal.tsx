import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBussinessStore } from "@/stores/financeStore/useBussinessStore";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";

const TEAM_SIZES = ["Just Me", "2-5", "6-20", "21-50", "51-200", "201+"];

const COUNTRIES = [
  { label: "India", value: "IN" },
  // Add more countries as needed
];

const CURRENCIES = [
  { label: "Indian Rupee (INR, ₹)", value: "INR" },
  // Add more currencies as needed
];

export function AddBussinessModal({
  onSubmit,
  open: controlledOpen,
  setOpen: setControlledOpen,
  initialValues,
}: {
  onSubmit?: (data: any) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  initialValues?: any;
}) {
  const isControlled =
    controlledOpen !== undefined && setControlledOpen !== undefined;
  const [open, setOpen] = useState(false);
  const actualOpen = isControlled ? controlledOpen : open;
  const actualSetOpen = isControlled ? setControlledOpen : setOpen;

  console.log("initialValues::===>", initialValues);

  const defaultForm = {
    businessName: "",
    brandName: "",
    teamSize: "",
    website: "",
    contact: "",
    country: COUNTRIES[0].value,
    currency: CURRENCIES[0].value,
    hasGst: false,
    gstin: "",
    igstn: "",
    state: "",
    email:"",
    address:"",

    // ✅ NEW FIELDS
    logo: "",
    qrcode: "",
    bankDetails: {
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      accountType: "Savings",
    },
  };
  const STATES = [
    "Jammu & Kashmir",
    "Himachal Pradesh",
    "Punjab",
    "Chandigarh",
    "Uttarakhand",
    "Haryana",
    "Delhi",
    "Rajasthan",
    "Uttar Pradesh",
    "Bihar",
    "Sikkim",
    "Arunachal Pradesh",
    "Nagaland",
    "Manipur",
    "Mizoram",
    "Tripura",
    "Meghalaya",
    "Assam",
    "West Bengal",
    "Jharkhand",
    "Odisha",
    "Chhattisgarh",
    "Madhya Pradesh",
    "Gujarat",
    "Daman & Diu",
    "Dadra & Nagar Haveli",
    "Maharashtra",
    "Andhra Pradesh",
    "Karnataka",
    "Goa",
    "Lakshadweep",
    "Kerala",
    "Tamil Nadu",
    "Puducherry",
    "Andaman & Nicobar Islands",
    "Telangana",
    "Andhra Pradesh (New)",
  ].sort((a, b) => a.localeCompare(b));
  const [form, setForm] = useState(
    initialValues ? { ...defaultForm, ...initialValues } : defaultForm,
  );

  const handleLogoUpload = async (file: File) => {
    const base64 = await convertToBase64(file);
    setForm((prev: any) => ({ ...prev, logo: base64 }));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleBankChange = (field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  const handleQrUpload = async (file: File) => {
    const base64 = await convertToBase64(file);
    setForm((prev: any) => ({ ...prev, qrcode: base64 }));
  };
  useEffect(() => {
    if (initialValues) {
      setForm({ ...defaultForm, ...initialValues });
    }
  }, [initialValues]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const setDetails = useBussinessStore((s) => s.setDetails);

  const handleChange = (field: string, value: string | boolean) => {
    // If IGSTN is changed, auto-fill state
    if (field === "igstn") {
      let state = "";
      if (typeof value === "string" && value.length >= 2) {
        // IGSTN first two digits are state code
        const stateCode = value.substring(0, 2);
        // Map state code to state name (India)
        const stateMap: { [key: string]: string } = {
          "01": "Jammu & Kashmir",
          "02": "Himachal Pradesh",
          "03": "Punjab",
          "04": "Chandigarh",
          "05": "Uttarakhand",
          "06": "Haryana",
          "07": "Delhi",
          "08": "Rajasthan",
          "09": "Uttar Pradesh",
          "10": "Bihar",
          "11": "Sikkim",
          "12": "Arunachal Pradesh",
          "13": "Nagaland",
          "14": "Manipur",
          "15": "Mizoram",
          "16": "Tripura",
          "17": "Meghalaya",
          "18": "Assam",
          "19": "West Bengal",
          "20": "Jharkhand",
          "21": "Odisha",
          "22": "Chhattisgarh",
          "23": "Madhya Pradesh",
          "24": "Gujarat",
          "25": "Daman & Diu",
          "26": "Dadra & Nagar Haveli",
          "27": "Maharashtra",
          "28": "Andhra Pradesh",
          "29": "Karnataka",
          "30": "Goa",
          "31": "Lakshadweep",
          "32": "Kerala",
          "33": "Tamil Nadu",
          "34": "Puducherry",
          "35": "Andaman & Nicobar Islands",
          "36": "Telangana",
          "37": "Andhra Pradesh (New)",
        };
        state = stateMap[stateCode] || "";
      }
      setForm((prev: any) => ({ ...prev, igstn: value, state }));
      setErrors((prev: any) => ({ ...prev, igstn: "" }));
      return;
    }
    setForm((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: { [k: string]: string } = {};
    if (!form.businessName)
      newErrors.businessName = "Business Name is required";
    if (!form.teamSize) newErrors.teamSize = "Team Size is required";
    if (!form.contact) newErrors.contact = "contact Number is required";
    if(!form.email) newErrors.email ="Email is required";
    if (!form.country) newErrors.country = "Country is required";
    if (!form.currency) newErrors.currency = "Currency is required";
    if (!form.state) newErrors.state = "State is required";
    if (form.hasGst && !form.gstin) newErrors.gstin = "GST Number is required";
    if (form.igstn && form.igstn.length < 15)
      newErrors.igstn = "IGSTN must be at least 15 characters";
    return newErrors;
  };

  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      let res;

      // ✅ If editing (businessId exists)
      if (initialValues?._id) {
        res = await axiosInstance.put(
          `/api/v1/finance/setting/business/${initialValues._id}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          },
        );
      } else {
        // ✅ Create mode
        res = await axiosInstance.post(
          `/api/v1/finance/setting/business/create`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          },
        );
      }

     if (res?.data?.success) {
  setDetails(res.data.data);
  localStorage.setItem("isBusinessFormFilled", "true");
  actualSetOpen(false);
  toast.success(res.data.message || "Business saved successfully");
} else {
  const apiError = res?.data;

  if (apiError?.errors && Array.isArray(apiError.errors)) {
    const errorMessages = apiError.errors
      .map((err: any) => err.message)
      .join(", ");

    toast.error(errorMessages);
  } else {
    toast.error(apiError?.message || "Something went wrong");
  }
}

    } catch (error: any) {
  const apiError = error?.response?.data;

  if (apiError?.errors && Array.isArray(apiError.errors)) {
    apiError.errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(apiError?.message || "Something went wrong");
  }
}
  };
  const isBusinessFormFilled =
    localStorage.getItem("isBusinessFormFilled") === "true";

  return (
    <Dialog
      open={actualOpen || !isBusinessFormFilled}
      onOpenChange={actualSetOpen}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline">Add Business</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tell us about your business</DialogTitle>
            <DialogDescription>
              This helps us personalize your experience
            </DialogDescription>
          </DialogHeader>
          <Card className="mt-4">
            <CardContent className="flex flex-col gap-4">
              {/* 1. Business Name */}
              <div>
                <label className="font-medium">
                  Business Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Official Name used across Accounting documents and reports."
                  value={form.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  aria-invalid={!!errors.businessName}
                />
                <div className="text-xs text-muted-foreground">
                  If you're a freelancer, add your personal name
                </div>
                {errors.businessName && (
                  <div className="text-xs text-destructive">
                    {errors.businessName}
                  </div>
                )}
              </div>
              {/* Brand/Display Name */}
              <div>
                <label className="font-medium">Add Brand or Display name</label>
                <Input
                  placeholder="Brand or Display Name (optional)"
                  value={form.brandName}
                  onChange={(e) => handleChange("brandName", e.target.value)}
                />
              </div>
              {/* 2. Team Size */}
              <div>
                <label className="font-medium">
                  Team Size <span className="text-destructive">*</span>
                </label>
                <Select
                  value={form.teamSize}
                  onValueChange={(v) => handleChange("teamSize", v)}
                >
                  <SelectTrigger aria-invalid={!!errors.teamSize}>
                    <SelectValue placeholder="Select Team Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.teamSize && (
                  <div className="text-xs text-destructive">
                    {errors.teamSize}
                  </div>
                )}
              </div>
              <div>
                <label className="font-medium">Website</label>
                <Input
                  placeholder="Your Work Website (optional)"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Add your business or work website. Helps potential clients
                  find you faster.
                </div>
              </div>
              {/* 4. contact Number */}
              <div>
                <label className="font-medium">
                  Contact Number <span className="text-destructive">*</span>
                </label>
                <Input
                type="tel"
                  placeholder="Contact number associated with your business"
                  value={form.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                  aria-invalid={!!errors.contact}
                />
                {errors.contact && (
                  <div className="text-xs text-destructive">
                    {errors.contact}
                  </div>
                )}
              </div>
              <div>
                <label className="font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                type="email"
                  placeholder="Enter Your Business Email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.contact && (
                  <div className="text-xs text-destructive">
                    {errors.contact}
                  </div>
                )}
              </div>
               <div>
                <label className="font-medium">
                  Address <span className="text-destructive">*</span>
                </label>
                <Input
                type="text"
                  placeholder="Enter Address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  aria-invalid={!!errors.address}
                />
                {errors.contact && (
                  <div className="text-xs text-destructive">
                    {errors.address}
                  </div>
                )}
              </div>
              <div>
                <label className="font-medium">Upload Payment QR Code</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleQrUpload(e.target.files[0])
                  }
                />
                {form.qrcode && (
                  <img src={form.qrcode} className="h-20 mt-2 rounded" />
                )}
              </div>
              <div>
                <label className="font-medium">Upload Logo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleLogoUpload(e.target.files[0])
                  }
                />
                {form.logo && (
                  <img src={form.logo} className="h-16 mt-2 rounded" />
                )}
              </div>
              {/* 5. Country */}
              <div>
                <label className="font-medium">
                  Country <span className="text-destructive">*</span>
                </label>
                <Select
                  value={form.country}
                  onValueChange={(v) => handleChange("country", v)}
                >
                  <SelectTrigger aria-invalid={!!errors.country}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <div className="text-xs text-destructive">
                    {errors.country}
                  </div>
                )}
              </div>
              {/* IGSTN */}
              <div>
                <label className="font-medium">IGSTN</label>
                <Input
                  placeholder="Enter IGSTN (optional)"
                  value={form.igstn}
                  onChange={(e) => handleChange("igstn", e.target.value)}
                  aria-invalid={!!errors.igstn}
                />
                {errors.igstn && (
                  <div className="text-xs text-destructive">{errors.igstn}</div>
                )}
              </div>
              {/* State Dropdown */}
              <div>
                <label className="font-medium">
                  State <span className="text-destructive">*</span>
                </label>
                <Select
                  value={form.state}
                  onValueChange={(v) => handleChange("state", v)}
                >
                  <SelectTrigger aria-invalid={!!errors.state}>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <div className="text-xs text-destructive">{errors.state}</div>
                )}
              </div>
              {/* 6. Currency */}
              <div>
                <label className="font-medium">
                  Currency <span className="text-destructive">*</span>
                </label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => handleChange("currency", v)}
                >
                  <SelectTrigger aria-invalid={!!errors.currency}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <div className="text-xs text-destructive">
                    {errors.currency}
                  </div>
                )}
              </div>
              {/* 7. GST Number */}
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.hasGst}
                    onCheckedChange={(v) => handleChange("hasGst", !!v)}
                    id="has-gst"
                  />
                  <label
                    htmlFor="has-gst"
                    className="font-medium select-none cursor-pointer"
                  >
                    Have GST Number?
                  </label>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  Add your GSTIN to unlock smart AI and GST workflows.
                </div>
                {form.hasGst && (
                  <Input
                    placeholder="Enter Your GST Number"
                    value={form.gstin}
                    onChange={(e) => handleChange("gstin", e.target.value)}
                    aria-invalid={!!errors.gstin}
                  />
                )}
                {errors.gstin && (
                  <div className="text-xs text-destructive">{errors.gstin}</div>
                )}
              </div>
              <div className="pt-4 border-t mt-4 space-y-3">
                <h3 className="font-semibold text-lg">Bank Details</h3>

                <Input
                  placeholder="Account Holder Name"
                  value={form.bankDetails.accountHolderName}
                  onChange={(e) =>
                    handleBankChange("accountHolderName", e.target.value)
                  }
                />

                <Input
                  placeholder="Bank Name"
                  value={form.bankDetails.bankName}
                  onChange={(e) => handleBankChange("bankName", e.target.value)}
                />

                <Input
                  placeholder="Account Number"
                  value={form.bankDetails.accountNumber}
                  onChange={(e) =>
                    handleBankChange("accountNumber", e.target.value)
                  }
                />

                <Input
                  placeholder="IFSC Code"
                  value={form.bankDetails.ifscCode}
                  onChange={(e) => handleBankChange("ifscCode", e.target.value)}
                />

                <Input
                  placeholder="Branch Name"
                  value={form.bankDetails.branchName}
                  onChange={(e) =>
                    handleBankChange("branchName", e.target.value)
                  }
                />

                <Select
                  value={form.bankDetails.accountType}
                  onValueChange={(v) => handleBankChange("accountType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Account Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {initialValues?._id ? "Update Business" : "Save Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddBussinessModal;
