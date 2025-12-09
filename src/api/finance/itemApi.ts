
import axios from 'axios';
import axiosInstance from '../../utils/axios';

// --- Types ---
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Vendor {
  _id: string;
  vendorName: string;
  email?: string;
  phone?: string;
}

export interface Item {
  _id: string;
  companyId: string;
  name: string;
  sku: string;
  description?: string;
  type: 'goods' | 'service';
  category?: any;
  subcategory?: any;
  hsn?: string;
  unit?: string;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  dimensionUnit?: string;
  imageUrl?: string;
  igst?: number;
  sgst?: number;
  cgst?: number;
  sellingPrice: number;
  salesDescription?: string;
  costPrice: number;
  purchaseDescription?: string;
  preferredVendor?: any;
  trackInventory?: boolean;
  openingStock?: number;
  currentStock?: number;
  lowStockThreshold?: number;
  highStockThreshold?: number;
  expiryDate?: string;
  isArchived?: boolean;
  createdBy?: User;
  updatedBy?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemFilters {
  name?: string;
  sku?: string;
  type?: 'goods' | 'service';
  category?: string;
  hsn?: string;
  minSellingPrice?: number;
  maxSellingPrice?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
  [key: string]: any;
}

export interface GetItemsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    items: Item[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SingleItemResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: Item;
}

export interface DeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface BulkDeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    deletedCount: number;
  };
}

export interface UpdateStockPayload {
  adjustment: number;
  adjustmentType: 'increase' | 'decrease';
  reason?: string;
}

export interface ItemStatistics {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  goodsItems: number;
  serviceItems: number;
  inventoryHealth: {
    lowStockPercentage: string;
    outOfStockPercentage: string;
  };
}

export interface ItemStatisticsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: ItemStatistics;
}

export interface UploadImageResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    imageUrl: string;
  };
}

const itemApi = {
  // Create Item
  createItem: async (itemData: Partial<Item>): Promise<SingleItemResponse> => {
    try {
      const response = await axiosInstance.post('/api/v1/finance/inventory/item/createItem', itemData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error creating item');
    }
  },

  // Get All Items (with filters, pagination, sorting)
  getAllItems: async (params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: ItemFilters;
  } = {}): Promise<GetItemsResponse> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) searchParams.append(key, String(value));
        });
      }
      const response = await axiosInstance.get(`/api/v1/finance/inventory/item/getAllItems?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error fetching items');
    }
  },

  // Get Item by ID
  getItemById: async (itemId: string): Promise<SingleItemResponse> => {
    try {
      const response = await axiosInstance.get(`/api/v1/finance/inventory/item/itemDetails/${itemId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error fetching item');
    }
  },

  // Update Item by ID
  updateItem: async (itemId: string, itemData: Partial<Item>): Promise<SingleItemResponse> => {
    try {
      const response = await axiosInstance.put(`/api/v1/finance/inventory/item/updateItem/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error updating item');
    }
  },

  // Delete Item by ID
  deleteItem: async (itemId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(`/api/v1/finance/inventory/item/deleteItem/${itemId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error deleting item');
    }
  },

  // Bulk Delete Items
  bulkDeleteItems: async (itemIds: string[]): Promise<BulkDeleteResponse> => {
    try {
      const response = await axiosInstance.delete('/api/v1/finance/inventory/item/bulkDeleteItems', {
        data: { itemIds },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error bulk deleting items');
    }
  },

  // Update Stock
  updateStock: async (itemId: string, payload: UpdateStockPayload): Promise<SingleItemResponse> => {
    try {
      const response = await axiosInstance.put(`/api/v1/finance/inventory/item/updateStock/${itemId}`, payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error updating stock');
    }
  },

  // Get Low Stock Items
  getLowStockItems: async (): Promise<GetItemsResponse> => {
    try {
      const response = await axiosInstance.get('/api/v1/finance/inventory/item/lowStockItems');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error fetching low stock items');
    }
  },

  // Get Items by Category
  getItemsByCategory: async (categoryId: string): Promise<GetItemsResponse> => {
    try {
      const response = await axiosInstance.get(`/api/v1/finance/inventory/item/itemsByCategory/${categoryId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error fetching items by category');
    }
  },

  // Search Items
  searchItems: async (searchTerm: string): Promise<GetItemsResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      const response = await axiosInstance.get(`/api/v1/finance/inventory/item/searchItems?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error searching items');
    }
  },

  // Get Item Statistics
  getItemStatistics: async (): Promise<ItemStatisticsResponse> => {
    try {
      const response = await axiosInstance.get('/api/v1/finance/inventory/item/statistics');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error fetching item statistics');
    }
  },

  // Upload Item Image
  uploadItemImage: async (itemId: string, file: File): Promise<UploadImageResponse> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axiosInstance.post(`/api/v1/finance/inventory/item/uploadImage/${itemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error uploading item image');
    }
  },

  // Delete Item Image
  deleteItemImage: async (itemId: string): Promise<DeleteResponse> => {
    try {
      const response = await axiosInstance.delete(`/api/v1/finance/inventory/item/deleteImage/${itemId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) throw error;
      throw new Error('Error deleting item image');
    }
  },
};

export default itemApi;
