"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useClientStore } from "@/stores/financeStore/useClientStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Calendar,
  User,
  Globe,
  CreditCard,
  Trash2,
  Info,
  Shield,
  FileDigit,
  Contact,
  Landmark,
  ClipboardList,
  Upload,
  X,
  Camera,
  ChevronUp,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { getLogoUrl } from "@/lib/utils";

const ClientDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const { user } = useAuthStore();
  const {
    currentClient,
    isLoading,
    error,
    getClientById,
    deleteClient,
    clearCurrentClient,
    uploadClientLogo,
    deleteClientLogo,
    updateClient,
  } = useClientStore();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(true);
  const [openPopoverId, setOpenPopoverId] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    clientType: "",
    industry: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    gstin: "",
    pan: "",
    taxTreatment: "",
    gstType: false,
    accountHolderName: "",
    bankName: "",
    bankAccountNumber: "",
    ifscCode: "",
    branchName: "",
    accountType: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (currentClient) {
      setFormData({
        businessName: currentClient.businessName || "",
        clientType: currentClient.clientType || "",
        industry: currentClient.industry || "",
        email: currentClient.email || "",
        phone: currentClient.phone || "",
        street: currentClient.address?.street || "",
        city: currentClient.address?.city || "",
        state: currentClient.address?.state || "",
        postalCode: currentClient.address?.postalCode || "",
        country: currentClient.address?.country || "",
        gstin: currentClient.gstin || "",
        pan: currentClient.pan || "",
        taxTreatment: currentClient.taxTreatment || "",
        gstType: currentClient.gstType || false,
        accountHolderName: currentClient.accountHolderName || "",
        bankName: currentClient.bankName || "",
        bankAccountNumber: currentClient.bankAccountNumber || "",
        ifscCode: currentClient.ifscCode || "",
        branchName: currentClient.branchName || "",
        accountType: currentClient.accountType || "",
        logoUrl: currentClient.logoUrl || "",
      });
    }
  }, [currentClient]);

  useEffect(() => {
    if (user?.companyId && clientId) {
      getClientById(user.companyId, clientId);
    }

    return () => {
      clearCurrentClient();
    };
  }, [user?.companyId, clientId, getClientById, clearCurrentClient]);

  const handleEdit = () => {
    router.push(`/finance/clients/${clientId}/edit`);
  };

 const handleSave = async () => {
   if (!user?.companyId || !clientId) return;

   setIsSaving(true);
   try {
     await updateClient(user.companyId, clientId, {
       businessName: formData.businessName,
       clientType: formData.clientType as "Individual" | "Company" | undefined,
       industry: formData.industry || undefined,
       email: formData.email,
       phone: formData.phone || undefined,
       address: {
         street: formData.street || undefined,
         city: formData.city || undefined,
         state: formData.state || undefined,
         postalCode: formData.postalCode || undefined,
         country: formData.country || undefined,
       },
       gstin: formData.gstin || undefined,
       pan: formData.pan || undefined,
       taxTreatment: formData.taxTreatment
         ? (formData.taxTreatment as
             | "Registered Business"
             | "Unregistered Business"
             | "Consumer"
             | "Overseas")
         : undefined,
      gstType: formData.gstType,
      // send bank/account details under `accountDetails` to match backend
      // Only include accountDetails if at least one field has a value
      ...(formData.accountHolderName ||
      formData.bankName ||
      formData.bankAccountNumber ||
      formData.ifscCode ||
      formData.branchName ||
      formData.accountType
        ? {
            accountDetails: {
              accountHolderName: formData.accountHolderName || undefined,
              bankName: formData.bankName || undefined,
              // backend expects `accountNumber`
              accountNumber: formData.bankAccountNumber || undefined,
              ifscCode: formData.ifscCode || undefined,
              branchName: formData.branchName || undefined,
              accountType: formData.accountType || undefined,
            },
          }
        : {}),
    });

     await getClientById(user.companyId, clientId);

     // 👇 Redirect after update
     router.push("/finance/clients");
   } catch (error) {
     console.error("Error updating client:", error);
   } finally {
     setIsSaving(false);
   }
 };


  const handleDelete = async () => {
    if (!user?.companyId || !clientId) return;

    try {
      await deleteClient(user.companyId, clientId);
      console.log("Client deleted, navigating to /finance/clients");
      router.push("/finance/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleBack = () => {
    console.log("Navigating to /finance/clients");
    router.push("/finance/clients");
  };

  // Logo upload handlers
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setLogoError("Please select a valid image file.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setLogoError("File size must be less than 5MB.");
        return;
      }

      setLogoFile(file);
      setLogoError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUploadConfirm = async () => {
    if (!currentClient || !logoFile || isUploadingLogo) return;

    setIsUploadingLogo(true);
    try {
      await uploadClientLogo(currentClient._id, logoFile);
      setShowLogoUploadModal(false);
      setLogoFile(null);
      setLogoPreview(null);
      setLogoError(null);
    } catch (error) {
      setLogoError(
        error instanceof Error ? error.message : "Failed to upload logo"
      );
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoUploadCancel = () => {
    setShowLogoUploadModal(false);
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select a valid image file.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB.");
        return;
      }

      setLogoFile(file);
      setUploadError("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = async () => {
    if (!currentClient || !currentClient.logoUrl || isDeletingLogo) return;

    setIsDeletingLogo(true);
    try {
      await deleteClientLogo(currentClient._id);
      setShowLogoUploadModal(false);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to delete logo"
      );
    } finally {
      setIsDeletingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!currentClient?.logoUrl) return;

    try {
      await deleteClientLogo(currentClient._id);
    } catch (error) {
      console.error("Error deleting logo:", error);
    }
  };



  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-full mb-4 w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Info className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button
              onClick={handleBack}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Clients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentClient) {
    if (!isLoading && !error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-600 mb-4">Client not found</p>
              <p className="text-sm text-gray-500 mb-4">
                Client ID: {clientId} | Company ID: {user?.companyId}
              </p>
              <Button
                onClick={handleBack}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Clients
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }


  console.log("formData.logoUrl", formData.logoUrl);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with gradient background */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer"
                onClick={handleBack}
              >
                <ArrowLeft size={18} />
                <span className="font-medium">Back to Clients</span>
              </button>

              <div className="w-px h-8 bg-slate-300"></div>

              <div className="flex items-center space-x-4">
                <div className="relative group">
                  {formData.logoUrl ? (
                    <div className="relative">
                      <img
                        src={getLogoUrl(formData.logoUrl) || ""}
                        alt={`${formData.businessName} logo`}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <button
                        onClick={() => setShowLogoUploadModal(true)}
                        className="absolute inset-0 bg-black/50 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {formData.businessName
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowLogoUploadModal(true)}
                        className="absolute inset-0 bg-black/50 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {currentClient.businessName}
                  </h1>
                  <p className="text-sm text-slate-500 font-mono">
                    ID: {currentClient._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Popover open={openPopoverId} onOpenChange={setOpenPopoverId}>
                <PopoverTrigger asChild>
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    aria-label="Client actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-2" align="end">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        handleEdit();
                        setOpenPopoverId(false);
                      }}
                      className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2"
                      aria-label="Update Client"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoUploadModal(true);
                        setOpenPopoverId(false);
                      }}
                      className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2"
                      aria-label="Upload Logo"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </button>
                    <div className="my-1 border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        setShowDeleteDialog(true);
                        setOpenPopoverId(false);
                      }}
                      className="px-3 py-2 rounded hover:bg-red-50 text-red-600 text-sm text-left flex items-center gap-2"
                      aria-label="Delete Client"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Overview Card */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className=" border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Client Overview</CardTitle>
                    <CardDescription>
                      Basic information about the client
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="businessName"
                    className="flex items-center text-gray-500"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter business name"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="clientType"
                    className="flex items-center text-gray-500"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Client Type
                  </Label>
                  <Select
                    value={formData.clientType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientType: value })
                    }
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="industry"
                    className="flex items-center text-gray-500"
                  >
                    <Landmark className="w-4 h-4 mr-2" />
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter industry"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className=" border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Contact className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>How to reach this client</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center text-gray-500"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter email"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center text-gray-500"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information Card */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className=" border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Address</CardTitle>
                    <CardDescription>
                      Physical location of the client
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="street"
                    className="flex items-center text-gray-500"
                  >
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="flex items-center text-gray-500"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="state"
                    className="flex items-center text-gray-500"
                  >
                    State/Province
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter state/province"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="postalCode"
                    className="flex items-center text-gray-500"
                  >
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter postal code"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="flex items-center text-gray-500"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className=" border-gray-200"
                    placeholder="Enter country"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Details Card */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b">
                <button
                  type="button"
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowAccountDetails((prev) => !prev)}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <CardTitle>Account Details</CardTitle>
                    <span className="text-sm font-normal text-gray-500">
                      (Banking information)
                    </span>
                  </div>
                  {showAccountDetails ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </CardHeader>

              {showAccountDetails && (
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Account Holder Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="accountHolderName"
                        className="text-gray-700"
                      >
                        Account Holder Name
                      </Label>
                      <Input
                        id="accountHolderName"
                        type="text"
                        value={formData.accountHolderName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accountHolderName: e.target.value,
                          })
                        }
                        placeholder="Enter account holder name"
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Bank Name */}
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-gray-700">
                        Bank Name
                      </Label>
                      <Input
                        id="bankName"
                        type="text"
                        value={formData.bankName}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        placeholder="Enter bank name"
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Bank Account Number */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="bankAccountNumber"
                        className="text-gray-700"
                      >
                        Bank Account Number
                      </Label>
                      <Input
                        id="bankAccountNumber"
                        type="text"
                        value={formData.bankAccountNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankAccountNumber: e.target.value,
                          })
                        }
                        placeholder="Enter bank account number"
                        className="bg-gray-50"
                      />
                    </div>

                    {/* IFSC Code */}
                    <div className="space-y-2">
                      <Label htmlFor="ifscCode" className="text-gray-700">
                        IFSC Code
                      </Label>
                      <Input
                        id="ifscCode"
                        type="text"
                        value={formData.ifscCode}
                        onChange={(e) =>
                          setFormData({ ...formData, ifscCode: e.target.value })
                        }
                        placeholder="e.g., SBIN0001234"
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Branch Name */}
                    <div className="space-y-2">
                      <Label htmlFor="branchName" className="text-gray-700">
                        Branch Name
                      </Label>
                      <Input
                        id="branchName"
                        type="text"
                        value={formData.branchName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            branchName: e.target.value,
                          })
                        }
                        placeholder="Enter branch name"
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Account Type */}
                    <div className="space-y-2">
                      <Label htmlFor="accountType" className="text-gray-700">
                        Account Type
                      </Label>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, accountType: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-50">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Savings">
                            Savings Account
                          </SelectItem>
                          <SelectItem value="Current">
                            Current Account
                          </SelectItem>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tax Information Card */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className=" border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Tax Information</CardTitle>
                    <CardDescription>Financial identifiers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="gstin"
                    className="flex items-center text-gray-500"
                  >
                    <FileDigit className="w-4 h-4 mr-2" />
                    GSTIN
                  </Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({ ...formData, gstin: e.target.value })
                    }
                    className=" border-gray-200 font-mono"
                    placeholder="Enter GSTIN"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="pan"
                    className="flex items-center text-gray-500"
                  >
                    <FileDigit className="w-4 h-4 mr-2" />
                    PAN
                  </Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pan: e.target.value.toUpperCase(),
                      })
                    }
                    className=" border-gray-200 font-mono uppercase"
                    placeholder="Enter PAN"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="taxTreatment"
                    className="flex items-center text-gray-500"
                  >
                    Tax Treatment
                  </Label>
                  <Select
                    value={formData.taxTreatment}
                    onValueChange={(value) =>
                      setFormData({ ...formData, taxTreatment: value })
                    }
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select tax treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Registered Business">
                        Registered Business
                      </SelectItem>
                      <SelectItem value="Unregistered Business">
                        Unregistered Business
                      </SelectItem>
                      <SelectItem value="Consumer">Consumer</SelectItem>
                      <SelectItem value="Overseas">Overseas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="gstType"
                    className="flex items-center text-gray-500"
                  >
                    GST Registration
                  </Label>
                  <Select
                    value={formData.gstType ? "true" : "false"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gstType: value === "true" })
                    }
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select GST status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Registered</SelectItem>
                      <SelectItem value="false">Not Registered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className=" border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Metadata</CardTitle>
                    <CardDescription>System information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="clientId"
                    className="flex items-center text-gray-500"
                  >
                    Client ID
                  </Label>
                  <Input
                    id="clientId"
                    value={currentClient._id}
                    className="bg-gray-200 font-mono text-xs"
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="createdAt"
                      className="flex items-center text-gray-500"
                    >
                      Created
                    </Label>
                    <Input
                      id="createdAt"
                      value={new Date(
                        currentClient.createdAt
                      ).toLocaleDateString()}
                      className=" border-gray-200"
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="updatedAt"
                      className="flex items-center text-gray-500"
                    >
                      Last Updated
                    </Label>
                    <Input
                      id="updatedAt"
                      value={new Date(
                        currentClient.updatedAt
                      ).toLocaleDateString()}
                      className=" border-gray-200"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ownership Card */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className=" border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Ownership</CardTitle>
                    <CardDescription>Responsible parties</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="createdBy"
                    className="flex items-center text-gray-500"
                  >
                    Created By
                  </Label>
                  <Input
                    id="createdBy"
                    value={currentClient?.createdBy?.email || "Unknown"}
                    className=" border-gray-200"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="owner"
                    className="flex items-center text-gray-500"
                  >
                    Owner
                  </Label>
                  <Input
                    id="owner"
                    value={currentClient?.ownerId?.email || "Unknown"}
                    className=" border-gray-200"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="flex items-center text-gray-500"
                  >
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={
                      (currentClient?.companyId as any)?.companyName ||
                      currentClient?.companyId?.name ||
                      "Unknown"
                    }
                    className=" border-gray-200"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 py-4 px-6 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-20">
        <div className="flex flex-wrap gap-3 justify-end max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Update Client"
            )}
          </Button>
        </div>
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Client Logo</h3>
              <button
                onClick={() => {
                  setShowLogoUploadModal(false);
                  setLogoFile(null);
                  setLogoPreview("");
                  setUploadError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {logoPreview ? (
                  <div className="space-y-3">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-cover rounded-lg mx-auto border"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    className="space-y-3 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <p>Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {uploadError}
                </div>
              )}

              {/* Delete Current Logo */}
              {currentClient.logoUrl && (
                <button
                  onClick={handleLogoDelete}
                  disabled={isDeletingLogo}
                  className="w-full mt-3 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isDeletingLogo ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>Remove Current Logo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Client
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">
                {currentClient?.businessName}
              </span>
              ? This action cannot be undone and will remove all associated
              data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailsPage;
