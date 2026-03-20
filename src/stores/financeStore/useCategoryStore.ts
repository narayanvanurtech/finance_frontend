import { create } from "zustand";
import { persist } from "zustand/middleware";
import categoryApi, {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  GetCategoriesFilters,
  PaginationInfo,
} from "../../api/finance/categoryApi";
import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

interface CategoryState {
  // Data
  categories: Category[];
  selectedCategory: Category | null;
  categoryHierarchy: Category[];
  pagination: PaginationInfo | null;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Error handling
  error: string | null;

  // Actions
  fetchCategories: (
    filters?: Omit<GetCategoriesFilters, "companyId">
  ) => Promise<void>;
  createCategory: (
    data: Omit<CreateCategoryPayload, "companyId">
  ) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryPayload) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Promise<void>;
  fetchCategoryHierarchy: () => Promise<void>;

  // UI helpers
  setSelectedCategory: (category: Category | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  categories: [],
  selectedCategory: null,
  categoryHierarchy: [],
  pagination: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch categories with optional filters
      fetchCategories: async (
        filters?: Omit<GetCategoriesFilters, "companyId">
      ) => {
        set({ loading: true, error: null });
        try {
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          if (!companyId) {
            throw new Error("Company ID is required");
          }

          const response = await categoryApi.getCategories({
            ...filters,
            companyId,
          });

          //console.log("Category API Response:", response);
          //console.log("Categories Data:", response?.data);

          set({
            categories: response?.data || [],
            pagination: response?.pagination || null,
            loading: false,
          });
        } catch (error) {
          let errorMessage = "Failed to fetch categories";

          if (axios.isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            loading: false,
            categories: [], // Ensure categories is always an array
          });
        }
      },

      // Create new category
      createCategory: async (
        data: Omit<CreateCategoryPayload, "companyId">
      ) => {
        set({ creating: true, error: null });
        try {
          const user = useAuthStore.getState().user;
          const companyId = user?.companyId;

          if (!companyId) {
            throw new Error("Company ID is required");
          }

          const response = await categoryApi.createCategory({
            ...data,
            companyId,
          });

          //console.log("Create Category Response:", response);
          const newCategory = response?.result;

          if (!newCategory) {
            console.error("Invalid response structure:", response);
            // If response is successful but structure is different, try to refetch
            if (response?.success) {
              await get().fetchCategories();
              set({ creating: false, error: null });
              return;
            }
            throw new Error("Invalid response from server");
          }

          set((state) => ({
            categories: [newCategory, ...state.categories],
            creating: false,
            error: null, // Clear any previous errors on success
          }));

          // If pagination exists, update count
          const { pagination } = get();
          if (pagination) {
            set({
              pagination: {
                ...pagination,
                count: pagination.count + 1,
                total: Math.ceil((pagination.count + 1) / pagination.limit),
              },
            });
          }
        } catch (error) {
          let errorMessage = "Failed to create category";

          if (axios.isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            creating: false,
          });
          throw error;
        }
      },

      // Update category
      updateCategory: async (id: string, data: UpdateCategoryPayload) => {
        set({ updating: true, error: null });
        try {
          const response = await categoryApi.updateCategory(id, data);
          const updatedCategory = response?.result;

          //console.log("Update Category Response:", response);

          if (!updatedCategory) {
            console.error("Invalid response structure:", response);
            // If response is successful but structure is different, try to refetch
            if (response?.success) {
              await get().fetchCategories();
              set({ updating: false, error: null });
              return;
            }
            throw new Error("Invalid response from server");
          }

          set((state) => ({
            categories: state.categories.map((cat) =>
              cat._id === id ? updatedCategory : cat
            ),
            selectedCategory:
              state.selectedCategory?._id === id
                ? updatedCategory
                : state.selectedCategory,
            updating: false,
            error: null, // Clear any previous errors on success
          }));
        } catch (error) {
          let errorMessage = "Failed to update category";
          //console.log("error", error);

          if (axios.isAxiosError(error) && error.response?.data.message) {
            errorMessage = error.response.data.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            updating: false,
          });

          throw error;
        }
      },

      // Delete category
      deleteCategory: async (id: string) => {
        set({ deleting: true, error: null });
        try {
          await categoryApi.deleteCategory(id);

          set((state) => ({
            categories: state.categories.filter((cat) => cat._id !== id),
            selectedCategory:
              state.selectedCategory?._id === id
                ? null
                : state.selectedCategory,
            deleting: false,
            error: null, // Clear any previous errors on success
          }));

          // Update pagination count
          const { pagination } = get();
          if (pagination) {
            set({
              pagination: {
                ...pagination,
                count: pagination.count - 1,
                total: Math.ceil((pagination.count - 1) / pagination.limit),
              },
            });
          }
        } catch (error) {
          let errorMessage = "Failed to delete category";

          if (axios.isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            deleting: false,
          });
          throw error;
        }
      },

      // Get category by ID
      getCategoryById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await categoryApi.getCategoryById(id);
          set({
            selectedCategory: response?.result || null,
            loading: false,
          });
        } catch (error) {
          let errorMessage = "Failed to fetch category";

          if (axios.isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      // Fetch category hierarchy
      fetchCategoryHierarchy: async () => {
        set({ loading: true, error: null });
        try {
          const response = await categoryApi.getCategoryHierarchy();
          set({
            categoryHierarchy: response?.result || [],
            loading: false,
          });
        } catch (error) {
          let errorMessage = "Failed to fetch category hierarchy";

          if (axios.isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      // UI helpers
      setSelectedCategory: (category: Category | null) => {
        set({ selectedCategory: category });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "category-store",
      // Only persist categories and hierarchy, not loading states or errors
      partialize: (state) => ({
        categories: state.categories || [],
        categoryHierarchy: state.categoryHierarchy || [],
        pagination: state.pagination,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        categories: persistedState?.categories || [],
        categoryHierarchy: persistedState?.categoryHierarchy || [],
      }),
    }
  )
);

export type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  GetCategoriesFilters,
};
