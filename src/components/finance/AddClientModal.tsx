import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const industries = ["IT", "Finance", "Manufacturing", "Retail", "Healthcare", "Other"];
const countries = ["India", "USA", "UK", "Australia", "Canada", "Other"];
const states = ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Other"];
const taxTreatments = ["Registered Business", "Unregistered Business", "Consumer", "Overseas"];

export type AddClientForm = {
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
  accountDetails: string;
};

const initialForm: AddClientForm = {
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
  accountDetails: "",
};

type AddClientModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddClientForm & { id?: number }) => void;
  initialValues?: Partial<AddClientForm & { id?: number }>;
  mode?: 'add' | 'edit';
};

export default function AddClientModal({ open, onClose, onSubmit, initialValues, mode = 'add' }: AddClientModalProps) {
  const [form, setForm] = useState<AddClientForm & { id?: number }>(initialForm);
  const [logoError, setLogoError] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [showTax, setShowTax] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  React.useEffect(() => {
    if (open && initialValues) {
      setForm({ ...initialForm, ...initialValues });
    } else if (open) {
      setForm(initialForm);
    }
  }, [open, initialValues]);

  const handleChange = (field: keyof AddClientForm, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setLogoError("Only JPG or PNG allowed");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setLogoError("File size must be <= 20MB");
      return;
    }
    // Check dimensions
    const img = new window.Image();
    img.onload = function () {
      if (img.width !== 1080 || img.height !== 1080) {
        setLogoError("Dimensions must be 1080x1080px");
      } else {
        setLogoError("");
        handleChange("logo", file);
      }
    };
    img.onerror = function () {
      setLogoError("Invalid image file");
    };
    img.src = URL.createObjectURL(file);
  };

  const companyId = localStorage.getItem("currentCompanyId")

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.businessName) errs.businessName = "Business Name is required";
    if (!form.gstin) errs.gstin = "GSTIN is required";
    if (!form.street) errs.street = "Address is required";
    if (!form.alias) errs.alias = "Contact is required";
    if (!form.email) errs.email = "Email is required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0 && !logoError) {
      onSubmit({...form,companyId});
      setForm(initialForm);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-full max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold mb-2">Basic Information</h3>
            <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Upload Logo</label>
                <Input type="file" accept="image/png,image/jpeg" onChange={handleLogo} />
                <div className="text-xs text-gray-500">JPG or PNG, 1080x1080px, up to 20MB</div>
                {logoError && <div className="text-xs text-red-500">{logoError}</div>}
              </div>
              {form.logo && (
                <img src={URL.createObjectURL(form.logo)} alt="Logo Preview" className="w-20 h-20 rounded-full object-cover border" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Business Name *</label>
                <Input value={form.businessName} onChange={e => handleChange("businessName", e.target.value)} required />
                {errors.businessName && <div className="text-xs text-red-500">{errors.businessName}</div>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Client Industry</label>
                <Select value={form.industry} onValueChange={v => handleChange("industry", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-Select an Industry-" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Select Country *</label>
                <Select value={form.country} onValueChange={v => handleChange("country", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.country && <div className="text-xs text-red-500">{errors.country}</div>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">City/Town</label>
                <Input value={form.city} onChange={e => handleChange("city", e.target.value)} />
              </div>
            </div>
          </div>
          {/* Tax Information */}
          <div>
            <button type="button" className="flex items-center gap-2 text-sm font-semibold mb-2" onClick={() => setShowTax(v => !v)}>
              <span>Tax Information <span className="text-xs text-gray-400">(optional)</span></span>
              {showTax ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {showTax && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold mb-1">Business GSTIN *</label>
                  <Input value={form.gstin} onChange={e => handleChange("gstin", e.target.value)} required />
                  {errors.gstin && <div className="text-xs text-red-500">{errors.gstin}</div>}
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Checkbox checked={form.gstType} onCheckedChange={v => handleChange("gstType", v)} />
                  <span>Check GST Type</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Business PAN Number</label>
                  <Input value={form.pan} onChange={e => handleChange("pan", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Client Type</label>
                  <Select value={form.clientType} onValueChange={v => handleChange("clientType", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tax Treatment</label>
                  <Select value={form.taxTreatment} onValueChange={v => handleChange("taxTreatment", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Tax Treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxTreatments.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          {/* Address */}
          <div>
            <button type="button" className="flex items-center gap-2 text-sm font-semibold mb-2" onClick={() => setShowAddress(v => !v)}>
              <span>Address <span className="text-xs text-gray-400">(optional)</span></span>
              {showAddress ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {showAddress && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold mb-1">Select Country</label>
                  <Select value={form.addressCountry} onValueChange={v => handleChange("addressCountry", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">State / Province</label>
                  <Select value={form.addressState} onValueChange={v => handleChange("addressState", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select State / Province" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">City/Town</label>
                  <Input value={form.addressCity} onChange={e => handleChange("addressCity", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Postal Code / Zip Code</label>
                  <Input value={form.postalCode} onChange={e => handleChange("postalCode", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Street Address *</label>
                  <Textarea value={form.street} onChange={e => handleChange("street", e.target.value)} rows={2} required />
                  {errors.street && <div className="text-xs text-red-500">{errors.street}</div>}
                </div>
              </div>
            )}
          </div>
          {/* Additional Details */}
          <div>
            <button type="button" className="flex items-center gap-2 text-sm font-semibold mb-2" onClick={() => setShowAdditional(v => !v)}>
              <span>Additional Details <span className="text-xs text-gray-400">(optional)</span></span>
              {showAdditional ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {showAdditional && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold mb-1">Business Alias (Nick Name) *</label>
                  <Input value={form.alias} onChange={e => handleChange("alias", e.target.value)} required />
                  {errors.alias && <div className="text-xs text-red-500">{errors.alias}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Unique Key</label>
                  <Input value={form.uniqueKey} onChange={e => handleChange("uniqueKey", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Email *</label>
                  <Input value={form.email} onChange={e => handleChange("email", e.target.value)} required />
                  {errors.email && <div className="text-xs text-red-500">{errors.email}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox checked={form.showEmail} onCheckedChange={v => handleChange("showEmail", v)} />
                    <span>Show Email in Invoice</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone No.</label>
                  <Input value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+91" />
                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox checked={form.showPhone} onCheckedChange={v => handleChange("showPhone", v)} />
                    <span>Show Phone in Invoice</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Add Custom Fields</label>
                  <Textarea value={form.customFields} onChange={e => handleChange("customFields", e.target.value)} rows={2} />
                </div>
              </div>
            )}
          </div>
          {/* Account Details */}
          <div>
            <button type="button" className="flex items-center gap-2 text-sm font-semibold mb-2" onClick={() => setShowAccount(v => !v)}>
              <span>Account Details <span className="text-xs text-gray-400">(optional)</span></span>
              {showAccount ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {showAccount && (
              <div className="mb-2 animate-fade-in">
                <Textarea value={form.accountDetails} onChange={e => handleChange("accountDetails", e.target.value)} rows={2} />
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" className="btn btn-primary" onClick={handleSubmit}>{mode === 'edit' ? 'Update Client' : 'Add Client'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 