import { create } from "zustand";
import itemApi, {
  type Item,
  type CreateItemPayload,
  type UpdateItemPayload,
  type UpdateStockPayload,
} from "../../api/finance/itemApi";

// Re-export Item type
export type { Item };

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface ItemStore {
  // State
  items: Item[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  searchResults: Item[];
  selectedItem: Item | null;
  lowStockItems: Item[];
  statistics: any;

  // Actions
  fetchItems: (companyId: string, params?: any) => Promise<void>;
  createItem: (itemData: CreateItemPayload) => Promise<Item>;
  updateItem: (
    companyId: string,
    itemId: string,
    itemData: UpdateItemPayload
  ) => Promise<Item>;
  deleteItem: (companyId: string, itemId: string) => Promise<void>;
  bulkDeleteItems: (companyId: string, itemIds: string[]) => Promise<{ deletedCount: number }>;
  searchItems: (companyId: string, params: any) => Promise<void>;
  getItemById: (companyId: string, itemId: string) => Promise<void>;
  updateStock: (
    companyId: string,
    itemId: string,
    data: UpdateStockPayload
  ) => Promise<void>;
  getLowStockItems: (companyId: string) => Promise<void>;
  getItemsByCategory: (companyId: string, categoryId: string) => Promise<void>;
  getItemStatistics: (companyId: string) => Promise<void>;
  uploadItemImage: (itemId: string, file: File) => Promise<any>;
  deleteItemImage: (itemId: string) => Promise<void>;
  clearError: () => void;
  clearSearchResults: () => void;
  clearSelectedItem: () => void;
}

export const useItemStore = create<ItemStore>((set, get) => ({
  // Initial state
  items: [],
  loading: false,
  error: null,
  pagination: null,
  searchResults: [],
  selectedItem: null,
  lowStockItems: [],
  statistics: null,

  // Fetch all items with optional params
  fetchItems: async (companyId: string, params?: any) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.getAllItems(companyId, params);
      set({
        items: response.result.items,
        pagination: response.result.pagination || null,
        loading: false,
      });
     
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch items",
        loading: false,
      });
    }
  },

  // Create a new item
  createItem: async (itemData: CreateItemPayload) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.createItem(itemData);
      const newItem = response.result;

      set((state) => ({
        items: [newItem, ...state.items],
        loading: false,
      }));

      return newItem;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create item";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Update an existing item
  updateItem: async (companyId: string, itemId: string, itemData: UpdateItemPayload) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.updateItem(companyId, itemId, itemData);
      const updatedItem = response.result;

      set((state) => ({
        items: state.items.map((item) =>
          item._id === itemId ? updatedItem : item
        ),
        selectedItem:
          state.selectedItem?._id === itemId
            ? updatedItem
            : state.selectedItem,
        loading: false,
      }));

      return updatedItem;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update item";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Delete an item
  deleteItem: async (companyId: string, itemId: string) => {
    set({ loading: true, error: null });
    try {
      await itemApi.deleteItem(companyId, itemId);

      set((state) => ({
        items: state.items.filter((item) => item._id !== itemId),
        selectedItem:
          state.selectedItem?._id === itemId ? null : state.selectedItem,
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete item";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Bulk delete items
  bulkDeleteItems: async (companyId: string, itemIds: string[]) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.bulkDeleteItems(companyId, itemIds);

      set((state) => ({
        items: state.items.filter(
          (item) => !itemIds.includes(item._id)
        ),
        loading: false,
      }));

      return response.result;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete items";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Search items
  searchItems: async (companyId: string, params: any) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.searchItems(companyId, params);
      set({
        searchResults: response.result.items,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to search items",
        loading: false,
      });
    }
  },

  // Get item by ID
  getItemById: async (companyId: string, itemId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.getItemById(companyId, itemId);
      set({
        selectedItem: response.result,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch item",
        loading: false,
      });
    }
  },

  // Update stock
  updateStock: async (companyId: string, itemId: string, data: UpdateStockPayload) => {
    set({ loading: true, error: null });
    try {
      await itemApi.updateStock(companyId, itemId, data);
      
      // Refresh the item data after stock update
      const response = await itemApi.getItemById(companyId, itemId);
      const updatedItem = response.result;

      set((state) => ({
        items: state.items.map((item) =>
          item._id === itemId ? updatedItem : item
        ),
        selectedItem:
          state.selectedItem?._id === itemId
            ? updatedItem
            : state.selectedItem,
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update stock";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Get low stock items
  getLowStockItems: async (companyId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.getLowStockItems(companyId);
      set({
        lowStockItems: response.result.items,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch low stock items",
        loading: false,
      });
    }
  },

  // Get items by category
  getItemsByCategory: async (companyId: string, categoryId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.getItemsByCategory(companyId, categoryId);
      set({
        items: response.result.items,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch items by category",
        loading: false,
      });
    }
  },

  // Get item statistics
  getItemStatistics: async (companyId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.getItemStatistics(companyId);
      set({
        statistics: response.result,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch item statistics",
        loading: false,
      });
    }
  },

  // Upload item image
  uploadItemImage: async (itemId: string, file: File) => {
    set({ loading: true, error: null });
    try {
      const response = await itemApi.uploadItemImage(itemId, file);
      set({ loading: false });
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload image";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Delete item image
  deleteItemImage: async (itemId: string) => {
    set({ loading: true, error: null });
    try {
      await itemApi.deleteItemImage(itemId);
      set({ loading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete image";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),

  // Clear search results
  clearSearchResults: () => set({ searchResults: [] }),

  // Clear selected item
  clearSelectedItem: () => set({ selectedItem: null }),
}));