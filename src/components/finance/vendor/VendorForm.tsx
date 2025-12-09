import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaChevronDown, FaPlus, FaTimes, FaBuilding, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUniversity } from "react-icons/fa";

const INDUSTRIES = [
  "Manufacturing",
  "Retail",
  "IT",
  "Healthcare",
  "Education",
  "Finance",
  "Construction",
  "Consulting",
  "Food & Beverage",
  "Transportation",
  "Real Estate",
  "Media & Entertainment",
  "Other",
];
const COUNTRIES = ["India", "USA", "UK", "Canada", "Australia", "Other"];
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Other"
];
const GST_TYPES = ["Regular", "Composition", "Unregistered", "Consumer"];
const TAX_TREATMENTS = ["Registered Business", "Unregistered Business", "Consumer", "Overseas"];
const VENDOR_TYPES = ["Individual", "Company"];
const ACCOUNT_TYPES = ["Savings", "Current", "Other"];

export type VendorFormValues = {
  name: string;
  industry?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  streetAddress?: string;
  gstin?: string;
  panNumber?: string;
  gstType?: string;
  taxTreatment?: string;
  vendorType?: string;
  displayName?: string;
  uniqueKey?: string;
  email?: string;
  showEmail?: boolean;
  contact?: string;
  phone?: string;
  showPhone?: boolean;
  address?: string;
  customFields?: { id: string; label: string; value: string }[];
  bankAccounts?: {
    id: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    branch?: string;
    accountType?: string;
  }[];
  attachments?: { name: string; url: string }[];
};

type VendorFormProps = {
  initialValues: VendorFormValues;
  onSubmit: (values: VendorFormValues) => void;
  submitLabel: string;
  loading?: boolean;
  onCancel?: () => void;
};

// Collapsible Section Component - Moved outside to prevent re-renders
const CollapsibleSection = React.memo(({
  title,
  sectionKey,
  children,
  isOpen,
  onToggle,
  icon
}: {
  title: string;
  sectionKey: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (key: string) => void;
  icon?: React.ReactNode;
}) => (
  <Card className="overflow-hidden bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)]">
    <button
      type="button"
      className="flex items-center w-full justify-between py-4 px-6 text-left font-semibold text-lg bg-transparent"
      onClick={() => onToggle(sectionKey)}
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-[color:var(--color-primary)]">{icon}</span>}
        <span className="text-[color:var(--color-foreground)]">{title}</span>
      </div>
      <FaChevronDown
        className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"} text-[color:var(--color-muted-foreground)]`}
      />
    </button>
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <CardContent className=" bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)]">
        {children}
      </CardContent>
    </div>
  </Card>
));

CollapsibleSection.displayName = 'CollapsibleSection';

// Form Input Component - Moved outside to prevent re-renders
const FormInput = React.memo(({ 
  label, 
  name, 
  type = "text", 
  placeholder, 
  required = false, 
  className = "",
  value,
  onChange,
  error,
  touched,
  ...props 
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'value' | 'onChange'>) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-[color:var(--color-foreground)]">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        ${error && touched ? 'border-[color:var(--color-destructive)] focus:border-[color:var(--color-destructive)]' : 'border-[color:var(--color-border)] focus:border-[color:var(--color-ring)]'}
        bg-[color:var(--color-background)] text-[color:var(--color-foreground)]
        ${className}
      `}
      {...props}
    />
    {error && touched && (
      <div className="text-xs flex items-center gap-1 text-[color:var(--color-destructive)]">
        <span>⚠</span>
        {error}
      </div>
    )}
  </div>
));

FormInput.displayName = 'FormInput';

// Form Select Component - Moved outside to prevent re-renders
const FormSelect = React.memo(({ 
  label, 
  name, 
  options, 
  placeholder = "Select an option",
  required = false,
  className = "",
  value,
  onChange,
  error,
  touched
}: {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-[color:var(--color-foreground)]">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Select name={name} value={value} onValueChange={onChange}>
      <SelectTrigger className={`
        ${error && touched ? 'border-[color:var(--color-destructive)] focus:border-[color:var(--color-destructive)]' : 'border-[color:var(--color-border)] focus:border-[color:var(--color-ring)]'}
        bg-[color:var(--color-background)] text-[color:var(--color-foreground)]
        ${className}
      `}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && touched && (
      <div className="text-xs flex items-center gap-1 text-[color:var(--color-destructive)]">
        <span>⚠</span>
        {error}
      </div>
    )}
  </div>
));

FormSelect.displayName = 'FormSelect';

export default function VendorForm({ initialValues, onSubmit, submitLabel, loading, onCancel }: VendorFormProps) {
  const [form, setForm] = useState<VendorFormValues>({ ...initialValues });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [openSections, setOpenSections] = useState<{ [k: string]: boolean }>({
    tax: false,
    address: false,
    details: false,
    attachments: false,
    bank: false
  });
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only update form if it hasn't been initialized or if it's a genuine change to initialValues
    if (!isInitialized.current) {
      setForm({ ...initialValues });
      isInitialized.current = true;
    }
  }, [initialValues]);

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setForm(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Handler for shadcn Select components
  const handleSelectChange = useCallback((name: string) => (value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Custom Fields
  const addCustomField = useCallback(() => {
    setForm(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), { 
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), 
        label: "", 
        value: "" 
      }],
    }));
  }, []);

  const updateCustomField = useCallback((id: string, key: "label" | "value", value: string) => {
    setForm(prev => {
      const updated = [...(prev.customFields || [])];
      const index = updated.findIndex(cf => cf.id === id);
      if (index !== -1) {
        updated[index] = { ...updated[index], [key]: value };
      }
      return { ...prev, customFields: updated };
    });
  }, []);

  const removeCustomField = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      customFields: (prev.customFields || []).filter(cf => cf.id !== id)
    }));
  }, []);

  // Bank Accounts
  const addBankAccount = useCallback(() => {
    setForm(prev => ({
      ...prev,
      bankAccounts: [
        ...(prev.bankAccounts || []),
        { 
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), 
          bankName: "", 
          accountNumber: "", 
          ifsc: "", 
          branch: "", 
          accountType: "" 
        },
      ],
    }));
  }, []);

  const updateBankAccount = useCallback(<K extends keyof Omit<NonNullable<VendorFormValues['bankAccounts']>[number], 'id'>>(
    id: string, 
    key: K, 
    value: Omit<NonNullable<VendorFormValues['bankAccounts']>[number], 'id'>[K]
  ) => {
    setForm(prev => {
      const updated = [...(prev.bankAccounts || [])];
      const index = updated.findIndex(ba => ba.id === id);
      if (index !== -1) {
        updated[index] = { ...updated[index], [key]: value };
      }
      return { ...prev, bankAccounts: updated };
    });
  }, []);

  const removeBankAccount = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      bankAccounts: (prev.bankAccounts || []).filter(ba => ba.id !== id)
    }));
  }, []);

  // Validation
  const validate = useCallback(() => {
    const errs: { [k: string]: string } = {};
    
    // Required fields
    if (!form.name?.trim()) errs.name = "Business Name is required";
    if (!form.country?.trim()) errs.country = "Country is required";
    if (!form.email?.trim()) errs.email = "Email address is required";
    if (!form.phone?.trim()) errs.phone = "Phone number is required";
    
    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }
    
    // Phone validation (basic mobile phone format)
    if (form.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = "Please enter a valid phone number";
    }
    
    // GSTIN validation
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
      errs.gstin = "Please enter a valid GSTIN format (e.g., 22AAAAA0000A1Z5)";
    }
    
    // PAN validation
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
      errs.panNumber = "Please enter a valid PAN format (e.g., ABCDE1234F)";
    }
    
    // Postal code validation (exactly 6 digits)
    if (form.postalCode && !/^\d{6}$/.test(form.postalCode)) {
      errs.postalCode = "Please enter a valid 6-digit postal code";
    }
    
    // Bank account validations
    if (form.bankAccounts && form.bankAccounts.length > 0) {
      form.bankAccounts.forEach((account, index) => {
        if (account.bankName && !account.accountNumber) {
          errs[`bankAccount_${index}_accountNumber`] = "Account number is required when bank name is provided";
        }
        if (account.accountNumber && !account.bankName) {
          errs[`bankAccount_${index}_bankName`] = "Bank name is required when account number is provided";
        }
        if (account.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(account.ifsc)) {
          errs[`bankAccount_${index}_ifsc`] = "Please enter a valid IFSC code format (e.g., SBIN0123456)";
        }
        if (account.accountType && !["Savings", "Current", "Other"].includes(account.accountType)) {
          errs[`bankAccount_${index}_accountType`] = "Invalid account type";
        }
      });
    }
    
    return errs;
  }, [form]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit(form);
    } else {
      // Auto open sections with errors
      Object.keys(errs).forEach(field => {
        if (['gstin', 'panNumber', 'gstType', 'taxTreatment'].includes(field)) {
          setOpenSections(prev => ({ ...prev, tax: true }));
        } else if (['country', 'state', 'city', 'postalCode', 'streetAddress', 'address'].includes(field)) {
          setOpenSections(prev => ({ ...prev, address: true }));
        } else if (['email', 'phone', 'contact', 'uniqueKey'].includes(field)) {
          setOpenSections(prev => ({ ...prev, details: true }));
        } else if (field.startsWith('bankAccount_')) {
          setOpenSections(prev => ({ ...prev, bank: true }));
        }
      });
    }
  }, [form, validate, onSubmit]);

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info (always visible) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FaBuilding className="text-[color:var(--color-primary)] text-xl" />
                <span className="text-[color:var(--color-foreground)]">Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Business Name"
                name="name"
                placeholder="Enter business name"
                required
                value={form.name || ""}
                onChange={handleChange}
                error={errors.name}
                touched={touched.name}
              />
              <FormInput
                label="Display Name"
                name="displayName"
                placeholder="Display name for invoices"
                value={form.displayName || ""}
                onChange={handleChange}
                error={errors.displayName}
                touched={touched.displayName}
              />
              <FormSelect
                label="Industry"
                name="industry"
                options={INDUSTRIES}
                placeholder="Select industry"
                value={form.industry || ""}
                onChange={handleSelectChange("industry")}
                error={errors.industry}
                touched={touched.industry}
              />
              <FormSelect
                label="Vendor Type"
                name="vendorType"
                options={VENDOR_TYPES}
                placeholder="Select vendor type"
                value={form.vendorType || ""}
                onChange={handleSelectChange("vendorType")}
                error={errors.vendorType}
                touched={touched.vendorType}
              />
            </div>
            </CardContent>
          </Card>

          {/* Tax Information Section */}
          <CollapsibleSection
            title="Tax Information"
            sectionKey="tax"
            isOpen={openSections.tax}
            onToggle={toggleSection}
            icon={<FaBuilding />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Business GSTIN"
                name="gstin"
                placeholder="22AAAAA0000A1Z5"
                value={form.gstin || ""}
                onChange={handleChange}
                error={errors.gstin}
                touched={touched.gstin}
              />
              <FormSelect
                label="GST Type"
                name="gstType"
                options={GST_TYPES}
                placeholder="Select GST type"
                value={form.gstType || ""}
                onChange={handleSelectChange("gstType")}
                error={errors.gstType}
                touched={touched.gstType}
              />
              <FormInput
                label="Business PAN Number"
                name="panNumber"
                placeholder="ABCDE1234F"
                value={form.panNumber || ""}
                onChange={handleChange}
                error={errors.panNumber}
                touched={touched.panNumber}
              />
              <FormSelect
                label="Tax Treatment"
                name="taxTreatment"
                options={TAX_TREATMENTS}
                placeholder="Select tax treatment"
                value={form.taxTreatment || ""}
                onChange={handleSelectChange("taxTreatment")}
                error={errors.taxTreatment}
                touched={touched.taxTreatment}
              />
            </div>
          </CollapsibleSection>

          {/* Address Section */}
          <CollapsibleSection
            title="Address Information"
            sectionKey="address"
            isOpen={openSections.address}
            onToggle={toggleSection}
            icon={<FaMapMarkerAlt />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                label="Country"
                name="country"
                options={COUNTRIES}
                placeholder="Select country"
                required
                value={form.country || ""}
                onChange={handleSelectChange("country")}
                error={errors.country}
                touched={touched.country}
              />
              <FormSelect
                label="State / Province"
                name="state"
                options={STATES}
                placeholder="Select state"
                value={form.state || ""}
                onChange={handleSelectChange("state")}
                error={errors.state}
                touched={touched.state}
              />
              <FormInput
                label="City/Town"
                name="city"
                placeholder="Enter city name"
                value={form.city || ""}
                onChange={handleChange}
                error={errors.city}
                touched={touched.city}
              />
              <FormInput
                label="Postal Code"
                name="postalCode"
                placeholder="110001"
                value={form.postalCode || ""}
                onChange={handleChange}
                error={errors.postalCode}
                touched={touched.postalCode}
              />
              <div className="md:col-span-2">
                <FormInput
                  label="Street Address"
                  name="streetAddress"
                  placeholder="Enter street address"
                  value={form.streetAddress || ""}
                  onChange={handleChange}
                  error={errors.streetAddress}
                  touched={touched.streetAddress}
                />
              </div>
              <div className="md:col-span-2">
                <FormInput
                  label="Complete Address"
                  name="address"
                  placeholder="Full address for correspondence"
                  value={form.address || ""}
                  onChange={handleChange}
                  error={errors.address}
                  touched={touched.address}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Additional Details Section */}
          <CollapsibleSection
            title="Contact & Additional Details"
            sectionKey="details"
            isOpen={openSections.details}
            onToggle={toggleSection}
            icon={<FaUser />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Unique Key"
                name="uniqueKey"
                placeholder="Auto-generated"
                readOnly
                className="bg-gray-50"
                value={form.uniqueKey || ""}
                onChange={handleChange}
                error={errors.uniqueKey}
                touched={touched.uniqueKey}
              />
              <div className="space-y-2">
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="vendor@example.com"
                  required
                  value={form.email || ""}
                  onChange={handleChange}
                  error={errors.email}
                  touched={touched.email}
                />
                <label className="inline-flex items-center mt-2 text-sm text-gray-600">
                  <Checkbox
                    name="showEmail"
                    checked={!!form.showEmail}
                    onCheckedChange={(checked) => {
                      setForm(prev => ({ ...prev, showEmail: !!checked }));
                    }}
                    className="mr-2"
                  />
                  Show email on invoices
                </label>
              </div>
              <div className="space-y-2">
                <FormInput
                  label="Phone Number"
                  name="phone"
                  placeholder="+91 98765 43210"
                  required
                  value={form.phone || ""}
                  onChange={handleChange}
                  error={errors.phone}
                  touched={touched.phone}
                />
                <label className="inline-flex items-center mt-2 text-sm text-gray-600">
                  <Checkbox
                    name="showPhone"
                    checked={!!form.showPhone}
                    onCheckedChange={(checked) => {
                      setForm(prev => ({ ...prev, showPhone: !!checked }));
                    }}
                    className="mr-2"
                  />
                  Show phone on invoices
                </label>
              </div>
              <FormInput
                label="Contact Person"
                name="contact"
                placeholder="Primary contact person"
                value={form.contact || ""}
                onChange={handleChange}
                error={errors.contact}
                touched={touched.contact}
              />
              
              {/* Custom Fields */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[color:var(--color-foreground)] flex items-center gap-2">
                    <span>Custom Fields</span>
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomField}
                    className="flex items-center gap-2 hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)]"
                  >
                    <FaPlus className="text-xs" />
                    Add Field
                  </Button>
                </div>
                {form.customFields && form.customFields.length > 0 && (
                  <div className="space-y-3">
                    {form.customFields.map((cf) => (
                      <Card key={cf.id} className="bg-[color:var(--color-card)]/50">
                        <CardContent className="p-3">
                          <div className="flex gap-3 items-center">
                        <Input
                          type="text"
                          placeholder="Field name"
                          value={cf.label}
                          onChange={e => updateCustomField(cf.id, "label", e.target.value)}
                          className="flex-1 h-10"
                        />
                        <Input
                          type="text"
                          placeholder="Field value"
                          value={cf.value}
                          onChange={e => updateCustomField(cf.id, "value", e.target.value)}
                          className="flex-1 h-10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomField(cf.id)}
                          className="text-[color:var(--color-destructive)] hover:bg-[color:var(--color-destructive)]/10 hover:border-[color:var(--color-destructive)] border-[color:var(--color-border)]"
                        >
                          <FaTimes />
                        </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* Attachments Section */}
          <CollapsibleSection
            title="Attachments"
            sectionKey="attachments"
            isOpen={openSections.attachments}
            onToggle={toggleSection}
            icon={<FaEnvelope />}
          >
            <div className="text-center py-8 text-[color:var(--color-muted-foreground)]">
              <div className="text-lg mb-2">📎</div>
              <p>File attachment feature coming soon</p>
              <p className="text-sm">Upload contracts, agreements, and other documents</p>
            </div>
          </CollapsibleSection>

          {/* Bank Details Section */}
          <CollapsibleSection
            title="Banking Information"
            sectionKey="bank"
            isOpen={openSections.bank}
            onToggle={toggleSection}
            icon={<FaUniversity />}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[color:var(--color-foreground)]">Bank Accounts</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBankAccount}
                  className="flex items-center gap-2 hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)]"
                >
                  <FaPlus className="text-xs" />
                  Add Account
                </Button>
              </div>
              {form.bankAccounts && form.bankAccounts.length > 0 && (
                <div className="space-y-4">
                  {form.bankAccounts.map((ba, index) => (
                    <Card key={ba.id} className="bg-[color:var(--color-card)]/50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Input
                            type="text"
                            placeholder="Bank name"
                            value={ba.bankName}
                            onChange={e => updateBankAccount(ba.id, "bankName", e.target.value)}
                            className={`h-10 ${errors[`bankAccount_${index}_bankName`] ? 'border-red-500' : ''}`}
                          />
                          {errors[`bankAccount_${index}_bankName`] && (
                            <div className="text-xs text-red-500">{errors[`bankAccount_${index}_bankName`]}</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Input
                            type="text"
                            placeholder="Account number"
                            value={ba.accountNumber}
                            onChange={e => updateBankAccount(ba.id, "accountNumber", e.target.value)}
                            className={`h-10 ${errors[`bankAccount_${index}_accountNumber`] ? 'border-red-500' : ''}`}
                          />
                          {errors[`bankAccount_${index}_accountNumber`] && (
                            <div className="text-xs text-red-500">{errors[`bankAccount_${index}_accountNumber`]}</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Input
                            type="text"
                            placeholder="IFSC code (e.g., SBIN0123456)"
                            value={ba.ifsc}
                            onChange={e => updateBankAccount(ba.id, "ifsc", e.target.value.toUpperCase())}
                            className={`h-10 ${errors[`bankAccount_${index}_ifsc`] ? 'border-red-500' : ''}`}
                          />
                          {errors[`bankAccount_${index}_ifsc`] && (
                            <div className="text-xs text-red-500">{errors[`bankAccount_${index}_ifsc`]}</div>
                          )}
                        </div>
                        <Input
                          type="text"
                          placeholder="Branch name"
                          value={ba.branch || ""}
                          onChange={e => updateBankAccount(ba.id, "branch", e.target.value)}
                          className="h-10"
                        />
                        <div className="space-y-1">
                          <Select
                            value={ba.accountType || ""}
                            onValueChange={(value) => updateBankAccount(ba.id, "accountType", value)}
                          >
                            <SelectTrigger className={`h-10 ${errors[`bankAccount_${index}_accountType`] ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Account type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACCOUNT_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`bankAccount_${index}_accountType`] && (
                            <div className="text-xs text-red-500">{errors[`bankAccount_${index}_accountType`]}</div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBankAccount(ba.id)}
                          className="text-[color:var(--color-destructive)] hover:bg-[color:var(--color-destructive)]/10 hover:border-[color:var(--color-destructive)] border-[color:var(--color-border)] h-10"
                        >
                          <FaTimes className="mr-2" />
                          Remove
                        </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t border-[color:var(--color-border)]">
            {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-8 py-3 text-sm font-medium hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)]"
              disabled={loading}
            >
              Cancel
            </Button>
            )}
            <Button
              type="submit"
              className="px-8 py-3 text-sm font-medium bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-foreground)] text-[color:var(--color-primary-foreground)] hover:text-[color:var(--color-primary)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-[color:var(--color-border)]"
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {submitLabel}
            </Button>
          </div>
        </form>
    </div>
  );
}
