"use client";
// GST state code mapping
const gstStateCodeMap: { [code: string]: string } = {
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

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeft,
  User,
  Building2,
  MapPin,
  FileText,
  CreditCard,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { CreateClientPayload } from "@/api/finance/clientApi";

const industries = [
  "IT",
  "Finance",
  "Manufacturing",
  "Retail",
  "Healthcare",
  "Education",
  "Real Estate",
  "Other",
];
const countries = [
  "India",
  "USA",
  "UK",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "Other",
];
const states = [
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
  "Other",
];
const taxTreatments = [
  "Registered Business",
  "Unregistered Business",
  "Consumer",
  "Overseas",
];

export type CreateClientForm = {
  logo: File | null;
  businessName: string;
  industry: string;
  country: string;
  city: string;
  gstin: string;
  gstType: boolean;
  pan: string;
  clientType: string;
  taxTreatment: string;
  addressCountry: string;
  addressState: string;
  addressCity: string;
  postalCode: string;
  street: string;
  alias: string;
  uniqueKey: string;
  email: string;
  showEmail: boolean;
  phone: string;
  showPhone: boolean;
  customFields: string;
  bankAccountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  accountType: string;
};

const initialForm: CreateClientForm = {
  logo: null,
  businessName: "",
  industry: "",
  country: "India",
  city: "",
  gstin: "",
  gstType: false,
  pan: "",
  clientType: "Company",
  taxTreatment: "",
  addressCountry: "India",
  addressState: "",
  addressCity: "",
  postalCode: "",
  street: "",
  alias: "",
  uniqueKey: "",
  email: "",
  showEmail: false,
  phone: "",
  showPhone: false,
  customFields: "",
  bankAccountNumber: "",
  accountHolderName: "",
  bankName: "",
  ifscCode: "",
  branchName: "",
  accountType: "Savings",
};

export default function CreateClientPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createClient, uploadClientLogo } = useClientStore();

  const [form, setForm] = useState<CreateClientForm>(initialForm);
  const [logoError, setLogoError] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Section visibility states
  const [showTax, setShowTax] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const handleChange = (field: keyof CreateClientForm, value: any) => {
    // If GSTIN is being changed, try to auto-fill state
    if (field === "gstin") {
      let newState = form.addressState;
      if (value && value.length >= 2) {
        const code = value.substring(0, 2);
        if (gstStateCodeMap[code]) {
          newState = gstStateCodeMap[code];
        }
      }
      setForm((f) => ({ ...f, gstin: value, addressState: newState }));
    } else {
      setForm((f) => ({ ...f, [field]: value }));
    }
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setLogoError("Only JPG or PNG files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // Changed to 5MB to match other pages
      setLogoError("File size must be less than 5MB");
      return;
    }

    setLogoError("");
    setForm((f) => ({ ...f, logo: file }));
  };

  const validate = () => {
    const errs: { [k: string]: string } = {};

    // Required fields based on schema
    if (!form.businessName.trim()) {
      errs.businessName = "Business Name is required";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }

    // Optional validations for better UX
    if (
      form.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/\s/g, ""))
    ) {
      errs.phone = "Please enter a valid phone number";
    }

    if (
      form.gstin &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.gstin
      )
    ) {
      errs.gstin = "Please enter a valid GSTIN format";
    }

    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
      errs.pan = "Please enter a valid PAN format (e.g., ABCDE1234F)";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || logoError) {
      return;
    }

    if (!user?.companyId) {
      setErrors({ general: "Company ID is required" });
      return;
    }

    setIsSubmitting(true);

    try {
      const clientData: CreateClientPayload = {
        businessName: form.businessName,
        companyId: user.companyId,
        email: form.email,
        phone: form.phone || "",
        industry: form.industry || "",
        clientType: form.clientType as "Company" | "Individual",
        taxTreatment: form.taxTreatment
          ? (form.taxTreatment as
              | "Registered Business"
              | "Unregistered Business"
              | "Consumer"
              | "Overseas")
          : undefined,
        gstin: form.gstin || "",
        pan: form.pan || "",
        alias: form.alias || "",
        showEmail: form.showEmail,
        showPhone: form.showPhone,
        gstType: form.gstType,
        address: {
          street: form.street || "",
          city: form.addressCity || "",
          state: form.addressState || "",
          postalCode: form.postalCode || "",
          country: form.addressCountry || "India",
        },
        bankAccountNumber: form.bankAccountNumber || "",
        accountHolderName: form.accountHolderName || "",
        bankName: form.bankName || "",
        ifscCode: form.ifscCode || "",
        branchName: form.branchName || "",
        accountType: form.accountType || "",
        accountDetails: form.customFields || "",
      };

      const createdClientResponse = await createClient(clientData);

      // If there's a logo to upload, upload it after client creation
      if (form.logo && createdClientResponse?.result?._id) {
        try {
          await uploadClientLogo(createdClientResponse.result._id, form.logo);
        } catch (logoError) {
          console.error("Error uploading logo:", logoError);
          // Don't fail the entire process if logo upload fails
        }
      }

      // Redirect back to clients list with success message
      router.push("/finance/clients?created=true");
    } catch (error) {
      console.error("Error creating client:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to create client. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/finance/clients");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Create New Client
                </h1>
                <p className="text-sm text-gray-500">
                  Add a new client to your database
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Upload className="h-4 w-4" />
                  Company Logo
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogo}
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG or PNG, up to 5MB
                    </p>
                    {logoError && (
                      <p className="text-xs text-red-500 mt-1">{logoError}</p>
                    )}
                  </div>
                  {form.logo && (
                    <div className="flex flex-col items-center">
                      <img
                        src={URL.createObjectURL(form.logo)}
                        alt="Logo Preview"
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, logo: null }));
                          setLogoError("");
                        }}
                        className="text-xs text-red-600 hover:text-red-700 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <Input
                    value={form.businessName}
                    onChange={(e) =>
                      handleChange("businessName", e.target.value)
                    }
                    placeholder="Enter business name"
                    className={errors.businessName ? "border-red-300" : ""}
                  />
                  {errors.businessName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <Select
                    value={form.industry}
                    onValueChange={(v) => handleChange("industry", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Type
                  </label>
                  <Select
                    value={form.clientType}
                    onValueChange={(v) => handleChange("clientType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => handleChange("country", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? "border-red-300" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      checked={form.showEmail}
                      onCheckedChange={(v) => handleChange("showEmail", v)}
                      id="showEmail"
                    />
                    <label
                      htmlFor="showEmail"
                      className="text-sm text-gray-600"
                    >
                      Show email in invoices
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 9876543210"
                    className={errors.phone ? "border-red-300" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      checked={form.showPhone}
                      onCheckedChange={(v) => handleChange("showPhone", v)}
                      id="showPhone"
                    />
                    <label
                      htmlFor="showPhone"
                      className="text-sm text-gray-600"
                    >
                      Show phone in invoices
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Alias (Nickname)
                  </label>
                  <Input
                    value={form.alias}
                    onChange={(e) => handleChange("alias", e.target.value)}
                    placeholder="Enter business alias"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unique Key
                  </label>
                  <Input
                    value={form.uniqueKey}
                    onChange={(e) => handleChange("uniqueKey", e.target.value)}
                    placeholder="Enter unique identifier"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information - Collapsible */}
          <Card>
            <CardHeader>
              <button
                type="button"
                className="w-full flex items-center justify-between"
                onClick={() => setShowTax((prev) => !prev)}
              >
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  Tax Information
                  <span className="text-sm font-normal text-gray-500">
                    (optional)
                  </span>
                </CardTitle>
                {showTax ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </CardHeader>
            {showTax && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSTIN
                    </label>
                    <Input
                      value={form.gstin}
                      onChange={(e) =>
                        handleChange("gstin", e.target.value.toUpperCase())
                      }
                      placeholder="22AAAAA0000A1Z5"
                      className={errors.gstin ? "border-red-300" : ""}
                    />
                    {errors.gstin && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.gstin}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number
                    </label>
                    <Input
                      value={form.pan}
                      onChange={(e) =>
                        handleChange("pan", e.target.value.toUpperCase())
                      }
                      placeholder="ABCDE1234F"
                      className={errors.pan ? "border-red-300" : ""}
                    />
                    {errors.pan && (
                      <p className="text-xs text-red-500 mt-1">{errors.pan}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Treatment
                    </label>
                    <Select
                      value={form.taxTreatment}
                      onValueChange={(v) => handleChange("taxTreatment", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax treatment" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxTreatments.map((treatment) => (
                          <SelectItem key={treatment} value={treatment}>
                            {treatment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 mt-6">
                    <Checkbox
                      checked={form.gstType}
                      onCheckedChange={(v) => handleChange("gstType", v)}
                      id="gstType"
                    />
                    <label htmlFor="gstType" className="text-sm text-gray-600">
                      Check GST Type
                    </label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Address Information - Collapsible */}
          <Card>
            <CardHeader>
              <button
                type="button"
                className="w-full flex items-center justify-between"
                onClick={() => setShowAddress((prev) => !prev)}
              >
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  Address Information
                  <span className="text-sm font-normal text-gray-500">
                    (optional)
                  </span>
                </CardTitle>
                {showAddress ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </CardHeader>
            {showAddress && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <Select
                      value={form.addressCountry}
                      onValueChange={(v) => handleChange("addressCountry", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <Select
                      value={form.addressState}
                      onValueChange={(v) => handleChange("addressState", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City / Town
                    </label>
                    <Input
                      value={form.addressCity}
                      onChange={(e) =>
                        handleChange("addressCity", e.target.value)
                      }
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <Input
                      value={form.postalCode}
                      onChange={(e) =>
                        handleChange("postalCode", e.target.value)
                      }
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <Textarea
                    value={form.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    placeholder="Enter complete street address"
                    rows={3}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Additional Details - Collapsible */}
          <Card>
            <CardHeader>
              <button
                type="button"
                className="w-full flex items-center justify-between"
                onClick={() => setShowAdditional((prev) => !prev)}
              >
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Additional Details
                  <span className="text-sm font-normal text-gray-500">
                    (optional)
                  </span>
                </CardTitle>
                {showAdditional ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </CardHeader>
            {showAdditional && (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Fields
                  </label>
                  <Textarea
                    value={form.customFields}
                    onChange={(e) =>
                      handleChange("customFields", e.target.value)
                    }
                    placeholder="Add any additional information about the client"
                    rows={3}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Account Details - Collapsible */}
          <Card>
            <CardHeader>
              <button
                type="button"
                className="w-full flex items-center justify-between"
                onClick={() => setShowAccount((prev) => !prev)}
              >
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  Account Details
                  <span className="text-sm font-normal text-gray-500">
                    (optional)
                  </span>
                </CardTitle>
                {showAccount ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </CardHeader>
            {showAccount && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <Input
                      value={form.accountHolderName}
                      onChange={(e) =>
                        handleChange("accountHolderName", e.target.value)
                      }
                      placeholder="Enter account holder name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <Input
                      value={form.bankName}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Account Number
                    </label>
                    <Input
                      value={form.bankAccountNumber}
                      onChange={(e) =>
                        handleChange("bankAccountNumber", e.target.value)
                      }
                      placeholder="Enter bank account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code
                    </label>
                    <Input
                      value={form.ifscCode}
                      onChange={(e) =>
                        handleChange("ifscCode", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., SBIN0001234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Name
                    </label>
                    <Input
                      value={form.branchName}
                      onChange={(e) =>
                        handleChange("branchName", e.target.value)
                      }
                      placeholder="Enter branch name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <Select
                      value={form.accountType}
                      onValueChange={(v) => handleChange("accountType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Savings">Savings Account</SelectItem>
                        <SelectItem value="Current">Current Account</SelectItem>
                        <SelectItem value="Business">
                          Business Account
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </form>
      </div>
    </div>
  );
}
