"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVendorStore } from "@/stores/financeStore/useVendorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  CreditCard, 
  FileText, 
  Edit,
  ArrowLeft,
  Globe,
  Hash,
  Calendar,
  ExternalLink,
  Download,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  MoreVertical
} from "lucide-react";

export default function VendorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedVendor, loading, error, getVendorById, clearError } = useVendorStore();
  const [isLoading, setIsLoading] = useState(true);

  const vendorId = params.id as string;

  useEffect(() => {
    if (vendorId) {
      clearError();
      getVendorById(vendorId).finally(() => setIsLoading(false));
    }
  }, [vendorId, getVendorById, clearError]);

  const handleEdit = () => {
    router.push(`/finance/vendors/edit/${vendorId}`);
  };

  const handleBack = () => {
    router.push("/finance/vendors");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-6">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
            {/* Content skeleton */}
            <div className="grid gap-6">
              <div className="h-64 bg-white rounded-xl shadow-sm"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-48 bg-white rounded-xl shadow-sm"></div>
                <div className="h-48 bg-white rounded-xl shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto text-center border-red-200">
            <CardContent className="p-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={handleBack} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vendors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedVendor) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Vendor Not Found</h1>
              <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist or may have been removed.</p>
              <Button onClick={handleBack} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vendors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const vendor = selectedVendor;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return "No address provided";
    const parts = [
      address.streetAddress,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address provided";
  };

  const getVendorStatus = () => {
    // This could be based on various criteria like missing required fields, verification status, etc.
    const hasRequiredInfo = vendor.email && vendor.phone && vendor.address;
    return hasRequiredInfo ? 'verified' : 'incomplete';
  };

  const status = getVendorStatus();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              onClick={handleBack} 
              variant="ghost" 
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendors
            </Button>
            <div className="flex items-center space-x-3">
              <Button onClick={handleEdit} className="shadow-sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Vendor
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Vendor Header Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-1">{vendor.name}</h1>
                      {vendor.displayName && vendor.displayName !== vendor.name && (
                        <p className="text-blue-100">Also known as: {vendor.displayName}</p>
                      )}
                      {vendor.vendorNo && (
                        <p className="text-blue-100 font-mono text-sm">ID: {vendor.vendorNo}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={status === 'verified' ? 'default' : 'secondary'}
                    className={`mb-2 ${status === 'verified' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                  >
                    {status === 'verified' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Incomplete
                      </>
                    )}
                  </Badge>
                  {vendor.industry && (
                    <p className="text-blue-100 text-sm">{vendor.industry}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Contact & Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vendor.email ? (
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vendor.email}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Email</span>
                            {!vendor.showEmail && (
                              <div className="flex items-center space-x-1">
                                <EyeOff className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">Hidden on documents</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(vendor.email || "")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-500">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-sm">No email provided</span>
                    </div>
                  )}

                  {(vendor.phone || vendor.contact) ? (
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vendor.phone || vendor.contact}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Phone</span>
                            {!vendor.showPhone && (
                              <div className="flex items-center space-x-1">
                                <EyeOff className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">Hidden on documents</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(vendor.phone || vendor.contact || "")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-500">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-sm">No phone provided</span>
                    </div>
                  )}

                  {vendor.address ? (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 leading-relaxed">{formatAddress(vendor.address)}</p>
                        <span className="text-sm text-gray-500">Address</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-500">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-sm">No address provided</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Building className="w-5 h-5 text-indigo-600" />
                    <span>Business Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {vendor.vendorType && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Vendor Type</p>
                          <Badge variant="outline" className="mt-1">{vendor.vendorType}</Badge>
                        </div>
                      </div>
                    )}
                    {vendor.industry && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Industry</p>
                          <Badge variant="secondary" className="mt-1">{vendor.industry}</Badge>
                        </div>
                      </div>
                    )}
                    {vendor.taxTreatment && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Tax Treatment</p>
                          <Badge variant="outline" className="mt-1">{vendor.taxTreatment}</Badge>
                        </div>
                      </div>
                    )}
                    {vendor.companyId && (
                      <div>
                        <p className="text-sm text-gray-500">Associated Company</p>
                        <p className="font-medium text-gray-900 mt-1">{vendor.companyId.companyName}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tax Information */}
            {(vendor.gstin || vendor.gstType || vendor.panNumber) && (
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <span>Tax Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {vendor.gstin && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">GSTIN</label>
                        <div className="flex items-center justify-between group">
                          <p className="text-gray-900 font-mono text-lg">{vendor.gstin}</p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(vendor.gstin || "")}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {vendor.gstType && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">GST Type</label>
                        <Badge variant="outline">{vendor.gstType}</Badge>
                      </div>
                    )}
                    {vendor.panNumber && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">PAN Number</label>
                        <div className="flex items-center justify-between group">
                          <p className="text-gray-900 font-mono text-lg">{vendor.panNumber}</p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(vendor.panNumber || "")}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bank Accounts */}
            {vendor.bankAccounts && vendor.bankAccounts.length > 0 && (
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span>Bank Accounts</span>
                    <Badge variant="secondary" className="ml-2">{vendor.bankAccounts.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {vendor.bankAccounts.map((account, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Bank Name</label>
                            <p className="font-semibold text-gray-900">{account.bankName}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Account Number</label>
                            <div className="flex items-center space-x-2">
                              <p className="font-mono text-gray-900">•••• {account.accountNumber.slice(-4)}</p>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => copyToClipboard(account.accountNumber)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                            <p className="font-mono text-gray-900">{account.ifsc}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Account Type</label>
                            <Badge variant="secondary">{account.accountType}</Badge>
                          </div>
                          {account.branch && (
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-sm font-medium text-gray-500">Branch</label>
                              <p className="text-gray-900">{account.branch}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {vendor.attachments && vendor.attachments.length > 0 && (
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span>Documents</span>
                    <Badge variant="secondary" className="ml-2">{vendor.attachments.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendor.attachments.map((attachment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => window.open(attachment.url, '_blank')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="font-medium text-gray-900 text-sm truncate" title={attachment.name}>
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Document</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Vendor
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(vendor.createdAt)}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(vendor.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bank Accounts</span>
                  <Badge variant="secondary">{vendor.bankAccounts?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents</span>
                  <Badge variant="secondary">{vendor.attachments?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                    {status === 'verified' ? 'Verified' : 'Incomplete'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}