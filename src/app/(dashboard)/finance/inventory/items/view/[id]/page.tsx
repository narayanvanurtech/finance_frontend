'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Package, 
  DollarSign, 
  BarChart3, 
  Tag, 
  Calendar, 
  User, 
  MapPin, 
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  FileText
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useItemStore } from '@/stores/financeStore/useItemStore';
import { Item } from '@/api/finance/itemApi';

export default function ViewItemPage() {
  const params = useParams();
  const itemId = params.id as string;
  const router = useRouter();
  const { 
    currentItem, 
    loading, 
    error, 
    getItemById, 
    clearCurrentItem, 
    clearError,
    deleteItem 
  } = useItemStore();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [itemNotFound, setItemNotFound] = useState(false);

  useEffect(() => {
    if (itemId) {
      getItemById(itemId).catch((error) => {
        // Check if it's a 404 error
        if (error?.response?.status === 404) {
          setItemNotFound(true);
        }
      });
    }

    return () => {
      clearCurrentItem();
      clearError();
    };
  }, [itemId, getItemById, clearCurrentItem, clearError]);

  // Redirect to not-found page if item doesn't exist
  useEffect(() => {
    if (itemNotFound) {
      notFound();
    }
  }, [itemNotFound]);

  const handleEdit = () => {
    router.push(`/finance/inventory/items/edit/${itemId}`);
  };

  const handleDelete = async () => {
    if (!currentItem || !confirm('Are you sure you want to delete this item?')) return;
    
    setDeleteLoading(true);
    try {
      await deleteItem(currentItem._id);
      router.push('/finance/inventory/items');
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStockStatus = (item: Item) => {
    if (!item.trackInventory) return null;
    
    const stock = item.currentStock || 0;
    const lowThreshold = item.lowStockThreshold || 0;
    
    if (stock === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, icon: XCircle };
    } else if (stock <= lowThreshold) {
      return { status: 'Low Stock', variant: 'outline' as const, icon: AlertTriangle };
    } else {
      return { status: 'In Stock', variant: 'secondary' as const, icon: CheckCircle };
    }
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Item</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => getItemById(itemId)} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Item Not Found</h3>
          <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(currentItem);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{currentItem.name}</h1>
            <p className="text-muted-foreground">SKU: {currentItem.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit} disabled={loading}>
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={deleteLoading}
          >
            <Trash2 className="h-4 w-4" />
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                  <p className="text-lg font-semibold">{currentItem.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="text-lg font-semibold">{currentItem.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <Badge variant={currentItem.type === 'goods' ? 'default' : 'secondary'}>
                    {currentItem.type === 'goods' ? 'Goods' : 'Service'}
                  </Badge>
                </div>
                {currentItem.hsn && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">HSN Code</label>
                    <p className="text-lg font-semibold">{currentItem.hsn}</p>
                  </div>
                )}
                {currentItem.unit && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Unit</label>
                    <p className="text-lg font-semibold">{currentItem.unit}</p>
                  </div>
                )}
                {currentItem.category && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-lg font-semibold">
                      {typeof currentItem.category === 'object' ? currentItem.category.name : currentItem.category}
                    </p>
                  </div>
                )}
              </div>
              {currentItem.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{currentItem.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(currentItem.sellingPrice)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cost Price</label>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(currentItem.costPrice)}
                  </p>
                </div>
                {currentItem.igst !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IGST (%)</label>
                    <p className="text-lg font-semibold">{currentItem.igst}%</p>
                  </div>
                )}
                {currentItem.sgst !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">SGST (%)</label>
                    <p className="text-lg font-semibold">{currentItem.sgst}%</p>
                  </div>
                )}
                {currentItem.cgst !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CGST (%)</label>
                    <p className="text-lg font-semibold">{currentItem.cgst}%</p>
                  </div>
                )}
              </div>
              {currentItem.salesDescription && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Sales Description</label>
                  <p className="text-base">{currentItem.salesDescription}</p>
                </div>
              )}
              {currentItem.purchaseDescription && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Purchase Description</label>
                  <p className="text-base">{currentItem.purchaseDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Information */}
          {currentItem.trackInventory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Inventory Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{currentItem.currentStock || 0}</p>
                      {stockStatus && (
                        <Badge variant={stockStatus.variant}>
                          <stockStatus.icon className="h-3 w-3" />
                          {stockStatus.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {currentItem.openingStock !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Opening Stock</label>
                      <p className="text-xl font-semibold">{currentItem.openingStock}</p>
                    </div>
                  )}
                  {currentItem.lowStockThreshold !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Low Stock Threshold</label>
                      <p className="text-xl font-semibold">{currentItem.lowStockThreshold}</p>
                    </div>
                  )}
                  {currentItem.highStockThreshold !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">High Stock Threshold</label>
                      <p className="text-xl font-semibold">{currentItem.highStockThreshold}</p>
                    </div>
                  )}
                </div>
                {currentItem.expiryDate && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                    <p className="text-lg font-semibold">{formatDate(currentItem.expiryDate)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Physical Properties */}
          {(currentItem.weight || currentItem.length || currentItem.width || currentItem.height) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Physical Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentItem.weight && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Weight</label>
                      <p className="text-lg font-semibold">{currentItem.weight}</p>
                    </div>
                  )}
                  {currentItem.length && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Length</label>
                      <p className="text-lg font-semibold">{currentItem.length} {currentItem.dimensionUnit}</p>
                    </div>
                  )}
                  {currentItem.width && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Width</label>
                      <p className="text-lg font-semibold">{currentItem.width} {currentItem.dimensionUnit}</p>
                    </div>
                  )}
                  {currentItem.height && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Height</label>
                      <p className="text-lg font-semibold">{currentItem.height} {currentItem.dimensionUnit}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Image and Metadata */}
        <div className="space-y-6">
          {/* Item Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Item Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {currentItem.imageUrl ? (
                  <Image
                    src={currentItem.imageUrl}
                    alt={currentItem.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          {currentItem.preferredVendor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Preferred Vendor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
                    <p className="text-lg font-semibold">
                      {typeof currentItem.preferredVendor === 'object' 
                        ? currentItem.preferredVendor.vendorName 
                        : currentItem.preferredVendor}
                    </p>
                  </div>
                  {typeof currentItem.preferredVendor === 'object' && currentItem.preferredVendor.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-base">{currentItem.preferredVendor.email}</p>
                    </div>
                  )}
                  {typeof currentItem.preferredVendor === 'object' && currentItem.preferredVendor.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-base">{currentItem.preferredVendor.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Track Inventory</label>
                <Badge variant={currentItem.trackInventory ? 'default' : 'outline'}>
                  {currentItem.trackInventory ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={currentItem.isArchived ? 'destructive' : 'default'}>
                  {currentItem.isArchived ? 'Archived' : 'Active'}
                </Badge>
              </div>
              {currentItem.createdBy && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <p className="text-base">
                    {typeof currentItem.createdBy === 'object' 
                      ? currentItem.createdBy.name 
                      : currentItem.createdBy}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="text-base">{formatDate(currentItem.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-base">{formatDate(currentItem.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
