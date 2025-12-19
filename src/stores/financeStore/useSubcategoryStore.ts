import { create } from "zustand";
import subcategoryApi, { 
  Subcategory as APISubcategory, 
  CreateSubcategoryPayload, 
  UpdateSubcategoryPayload,
  GetSubcategoriesFilters 
} from "@/api/finance/subCategoryApi";

export type Subcategory = APISubcategory;

interface SubcategoryStore {
  subcategories: Subcategory[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchSubcategories: (filters?: GetSubcategoriesFilters) => Promise<void>;
  createSubcategory: (data: CreateSubcategoryPayload) => Promise<void>;
  updateSubcategory: (id: string, data: UpdateSubcategoryPayload) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  fetchSubcategoryById: (id: string) => Promise<Subcategory | null>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useSubcategoryStore = create<SubcategoryStore>()((set, get) => ({
  subcategories: [],
  loading: false,
  error: null,

  // Fetch all subcategories with optional filters
  fetchSubcategories: async (filters?: GetSubcategoriesFilters) => {
    set({ loading: true, error: null });
    try {
      const subcategories = await subcategoryApi.getSubcategories(filters!);
      set({ subcategories: subcategories, loading: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch subcategories';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Create a new subcategory
  createSubcategory: async (data) => {
    set({ loading: true, error: null });
    try {
      const newSubcategory = await subcategoryApi.createSubcategory(data);
      const currentSubcategories = get().subcategories;
      set({ 
        subcategories: [...currentSubcategories, newSubcategory], 
        loading: false 
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create subcategory';
      set({ error: errorMessage, loading: false });
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  // Update an existing subcategory
  updateSubcategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedSubcategory = await subcategoryApi.updateSubcategory(id, data);
      const currentSubcategories = get().subcategories;
      const updatedSubcategories = currentSubcategories.map(sub => 
        sub._id === id ? updatedSubcategory : sub
      );
      set({ subcategories: updatedSubcategories, loading: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update subcategory';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Delete a subcategory
  deleteSubcategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await subcategoryApi.deleteSubcategory(id);
      const currentSubcategories = get().subcategories;
      const filteredSubcategories = currentSubcategories.filter(sub => sub._id !== id);
      set({ subcategories: filteredSubcategories, loading: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete subcategory';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Fetch a single subcategory by ID
  fetchSubcategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const subcategory = await subcategoryApi.getSubcategoryById(id);
      set({ loading: false });
      return subcategory;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch subcategory';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // State management helpers
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
})); 