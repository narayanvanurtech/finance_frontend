"use client";

import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { usePurchaseOrderStore } from "@/stores/financeStore/usePurchaseOrderStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import type { PurchaseOrder } from "@/api/finance/purchaseOrderApi";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  acknowledged: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  partial_delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  complete: "bg-success-bg text-success dark:bg-success/20 dark:text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const approvalStatusColors = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  approved: "bg-success-bg text-success dark:bg-success/20 dark:text-success",
  rejected: "bg-destructive/10 text-destructive",
  revision_required: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
};

const statusIcons = {
  draft: Clock,
  sent: FileText,
  acknowledged: CheckCircle,
  partial_delivery: Package,
  complete: CheckCircle,
  cancelled: XCircle,
};

export default function PurchaseOrdersPage() {
  const {
    apiPurchaseOrders,
    loading,
    error,
    pagination,
    fetchPurchaseOrders,
    deletePurchaseOrderApi,
    bulkDeletePurchaseOrdersApi,
    updateApprovalStatus,
    getPurchaseOrderStats,
  } = usePurchaseOrderStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Fetch initial data
  useEffect(() => {
    fetchPurchaseOrders();
    loadStats();
  }, []);

  const loadStats = async () => {
    const statsData = await getPurchaseOrderStats();
    setStats(statsData);
  };

  // Handle filter change
  const handleFilterChange = useCallback(() => {
    const filters: any = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (priorityFilter !== "all") filters.priority = priorityFilter;
    
    // Include search term if it exists
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    
    fetchPurchaseOrders(filters);
  }, [statusFilter, priorityFilter, searchTerm, fetchPurchaseOrders]);

  // Handle search (now mainly for manual search button click)
  const handleSearch = useCallback(() => {
    handleFilterChange();
  }, [handleFilterChange]);

  // Create debounced version of handleFilterChange
  const debouncedFilterChange = useCallback(
    debounce(handleFilterChange, 300),
    [handleFilterChange]
  );

  useEffect(() => {
    handleFilterChange();
  }, [statusFilter, priorityFilter]);

  // Debounced search effect
  useEffect(() => {
    debouncedFilterChange();
    
    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedFilterChange.cancel();
    };
  }, [searchTerm, debouncedFilterChange]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      debouncedFilterChange.cancel();
    };
  }, [debouncedFilterChange]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    const filters: any = { page };
    
    // Include existing filters
    if (statusFilter !== "all") filters.status = statusFilter;
    if (priorityFilter !== "all") filters.priority = priorityFilter;
    if (searchTerm.trim()) filters.search = searchTerm.trim();
    
    fetchPurchaseOrders(filters);
  };

  // Handle selection
  const toggleSelection = (poId: string) => {
    setSelectedPOs(prev =>
      prev.includes(poId)
        ? prev.filter(id => id !== poId)
        : [...prev, poId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedPOs(
      selectedPOs.length === apiPurchaseOrders.length
        ? []
        : apiPurchaseOrders.map(po => po._id)
    );
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedPOs.length > 0) {
      await bulkDeletePurchaseOrdersApi(selectedPOs);
      setSelectedPOs([]);
      fetchPurchaseOrders();
    }
  };

  // Handle single delete
  const handleDelete = async (poId: string) => {
    await deletePurchaseOrderApi(poId);
    fetchPurchaseOrders();
  };

  // Calculate total amount for a PO
  const calculateTotalAmount = (po: PurchaseOrder) => {
    const itemsTotal = po.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.rate;
      const discountAmount = item.discountType === "percentage" 
        ? (itemTotal * (item.discount || 0)) / 100
        : (item.discount || 0);
      return sum + (itemTotal - discountAmount);
    }, 0);

    const discountAmount = po.discountType === "percentage"
      ? (itemsTotal * (po.discountValue || 0)) / 100
      : (po.discountValue || 0);

    return itemsTotal - discountAmount + (po.shipping || 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading && !apiPurchaseOrders.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage your purchase orders and track vendor deliveries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPOs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acknowledgedPOs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="partial_delivery">Partial Delivery</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPOs.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary">
                {selectedPOs.length} purchase order(s) selected
              </span>
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Purchase Orders</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedPOs.length} purchase order(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPOs([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.totalPurchaseOrders} total purchase orders` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPOs.length === apiPurchaseOrders.length && apiPurchaseOrders.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiPurchaseOrders.map((po) => {
                  const StatusIcon = statusIcons[po.status];
                  return (
                    <TableRow key={po._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPOs.includes(po._id)}
                          onCheckedChange={() => toggleSelection(po._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {po.purchaseOrderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{po.vendorId.name}</div>
                          {po.vendorId.email && (
                            <div className="text-sm text-muted-foreground">
                              {po.vendorId.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(po.purchaseOrderDate), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[po.status]} variant="secondary">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {po.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[po.priority]} variant="secondary">
                          {po.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={approvalStatusColors[po.approvalStatus]} variant="secondary">
                          {po.approvalStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(calculateTotalAmount(po))}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this purchase order? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(po._id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && apiPurchaseOrders.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Purchase Orders Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No purchase orders match your search criteria.' : 'Get started by creating your first purchase order.'}
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}