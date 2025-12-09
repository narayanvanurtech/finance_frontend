import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import itemApi, { 
  Item, 
  ItemFilters, 
  UpdateStockPayload, 
  ItemStatistics 
} from '../../api/finance/itemApi';

interface ItemState {
  // Data state
  items: Item[];
  currentItem: Item | null;
  itemStatistics: ItemStatistics | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Pagination state
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  
  // Filters and sorting
  filters: ItemFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Actions
  // CRUD operations
  createItem: (itemData: Partial<Item>) => Promise<void>;
  getAllItems: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: ItemFilters;
  }) => Promise<void>;
  getItemById: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, itemData: Partial<Item>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  bulkDeleteItems: (itemIds: string[]) => Promise<void>;
  
  // Stock management
  updateStock: (itemId: string, payload: UpdateStockPayload) => Promise<void>;
  getLowStockItems: () => Promise<void>;
  
  // Category and search
  getItemsByCategory: (categoryId: string) => Promise<void>;
  searchItems: (searchTerm: string) => Promise<void>;
  
  // Statistics
  getItemStatistics: () => Promise<void>;
  
  // Image management
  uploadItemImage: (itemId: string, file: File) => Promise<void>;
  deleteItemImage: (itemId: string) => Promise<void>;
  
  // Utility actions
  setFilters: (filters: ItemFilters) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  clearError: () => void;
  clearCurrentItem: () => void;
  resetStore: () => void;
}

const initialState = {
  items: [],
  currentItem: null,
  itemStatistics: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
};

export const useItemStore = create<ItemState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // CRUD Operations
      createItem: async (itemData: Partial<Item>) => {
        set({ loading: true, error: null });
        try {
          const response = await itemApi.createItem(itemData);
          const newItem = response.result;
          
          set((state) => ({
            items: [newItem, ...state.items],
            loading: false,
            currentItem: newItem,
          }));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to create item' 
          });
          throw error;
        }
      },

      getAllItems: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const currentState = get();
          const requestParams = {
            page: params.page || 1,
            limit: params.limit || 10,
            sortBy: params.sortBy || currentState.sortBy,
            sortOrder: params.sortOrder || currentState.sortOrder,
            filters: params.filters || currentState.filters,
          };

          const response = await itemApi.getAllItems(requestParams);
          
          set({
            items: response.result.items,
            pagination: response.result.pagination,
            loading: false,
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to fetch items' 
          });
          throw error;
        }
      },

      getItemById: async (itemId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await itemApi.getItemById(itemId);
          set({
            currentItem: response.result,
            loading: false,
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to fetch item' 
          });
          throw error;
        }
      },

      updateItem: async (itemId: string, itemData: Partial<Item>) => {
        set({ loading: true, error: null });
        try {
          const response = await itemApi.updateItem(itemId, itemData);
          const updatedItem = response.result;
          
          set((state) => ({
            items: state.items.map(item => 
              item._id === itemId ? updatedItem : item
            ),
            currentItem: state.currentItem?._id === itemId ? updatedItem : state.currentItem,
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to update item' 
          });
          throw error;
        }
      },

      deleteItem: async (itemId: string) => {
        set({ loading: true, error: null });
        try {
          await itemApi.deleteItem(itemId);
          
          set((state) => ({
            items: state.items.filter(item => item._id !== itemId),
            currentItem: state.currentItem?._id === itemId ? null : state.currentItem,
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to delete item' 
          });
          throw error;
        }
      },

      bulkDeleteItems: async (itemIds: string[]) => {
        set({ loading: true, error: null });
        try {
          await itemApi.bulkDeleteItems(itemIds);
          
          set((state) => ({
            items: state.items.filter(item => !itemIds.includes(item._id)),
            currentItem: itemIds.includes(state.currentItem?._id || '') ? null : state.currentItem,
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to delete items' 
          });
          throw error;
        }
      },

      // Stock Management
      updateStock: async (itemId: string, payload: UpdateStockPayload) => {
        set({ loading: true, error: null });
        try {
          const response = await itemApi.updateStock(itemId, payload);
          const updatedItem = response.result;
          
          set((state) => ({
            items: state.items.map(item => 
              item._id === itemId ? updatedItem : item
            ),
            currentItem: state.currentItem?._id === itemId ? updatedItem : state.currentItem,
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to update stock' 
          });
          throw error;
        }
      },

      getLowStockItems: async () => {
        set({ loading: true, error: null });
        try {
          const response = await itemApi.getLowStockItems();
          set({
            items: response.result.items,
            pagination: response.result.pagination,
            loading: false,
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to fetch low stock items' 
          });
          throw error;
        }
      },

      // Category and Search
      getItemsByCategory: async (categoryId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await itemApi.getItemsByCategory(categoryId);
          set({
            items: response.result.items,
            pagination: response.result.pagination,
            loading: false,
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to fetch items by category' 
          });
          throw error;
        }
      },

      searchItems: async (searchTerm: string) => {
        set({ loading: true, error: null });
        try {
          // Use getAllItems with search filter instead of separate searchItems endpoint
          const response = await itemApi.getAllItems({
            page: 1,
            limit: 20,
            filters: { search: searchTerm }
          });
          set({
            items: response.result.items,
            pagination: response.result.pagination,
            loading: false,
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to search items' 
          });
          throw error;
        }
      },

      // Statistics
      getItemStatistics: async () => {
        set({ loading: true, error: null });
        try {
          const response = await itemApi.getItemStatistics();
          set({
            itemStatistics: response.result,
            loading: false,
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to fetch item statistics' 
          });
          throw error;
        }
      },

      // Image Management
      uploadItemImage: async (itemId: string, file: File) => {
        set({ loading: true, error: null });
        try {
          const response = await itemApi.uploadItemImage(itemId, file);
          const imageUrl = response.result.imageUrl;
          
          set((state) => ({
            items: state.items.map(item => 
              item._id === itemId ? { ...item, imageUrl } : item
            ),
            currentItem: state.currentItem?._id === itemId 
              ? { ...state.currentItem, imageUrl } 
              : state.currentItem,
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to upload image' 
          });
          throw error;
        }
      },

      deleteItemImage: async (itemId: string) => {
        set({ loading: true, error: null });
        try {
          await itemApi.deleteItemImage(itemId);
          
          set((state) => ({
            items: state.items.map(item => 
              item._id === itemId ? { ...item, imageUrl: undefined } : item
            ),
            currentItem: state.currentItem?._id === itemId 
              ? { ...state.currentItem, imageUrl: undefined } 
              : state.currentItem,
            loading: false,
          }));
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to delete image' 
          });
          throw error;
        }
      },

      // Utility Actions
      setFilters: (filters: ItemFilters) => {
        set({ filters });
      },

      setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => {
        set({ sortBy, sortOrder });
      },

      clearError: () => {
        set({ error: null });
      },

      clearCurrentItem: () => {
        set({ currentItem: null });
      },

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'item-store',
    }
  )
);

export default useItemStore;