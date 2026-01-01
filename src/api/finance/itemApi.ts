import axiosInstance from "../../utils/axios";

// -----------------------------------------------------
//                    INTERFACES
// -----------------------------------------------------

export interface Item {
  _id: string;
  name: string;
  description?: string;
  hsn?: string;
  unit?: string;
  rate: number;
  stock?: number;
  categoryId?: string;
  subcategoryId?: string;
  category?: {
    _id: string;
    name: string;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  isActive?: boolean;
  isArchived?: boolean;
  image?: string;
  imageUrl?: string;
  type?: "goods" | "service";
  sellingPrice?: number;
  costPrice?: number;
  trackInventory?: boolean;
  currentStock?: number;
  lowStockThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemPayload {
  companyId: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  hsn?: string;
  unit?: string;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  dimensionUnit?: string;
  igst?: number;
  sgst?: number;
  cgst?: number;
  sellingPrice?: number;
  salesDescription?: string;
  costPrice?: number;
  purchaseDescription?: string;
  preferredVendor?: string;
  rate?: number;
  stock?: number;
  categoryId?: string;
}

export interface UpdateItemPayload extends Partial<CreateItemPayload> {}

export interface UpdateStockPayload {
  adjustment: number;
  adjustmentType: "increase" | "decrease";
  reason?: string;
}

export interface ItemResponse {
  success: boolean;
  message: string;
  result: Item;
}

export interface ItemsResponse {
  success: boolean;
  message: string;
  result: {
    items: Item[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
    };
  };
}

// -----------------------------------------------------
//                    API FUNCTIONS
// -----------------------------------------------------

// CREATE ITEM
export const createItem = async (
  data: CreateItemPayload
): Promise<ItemResponse> => {
  const res = await axiosInstance.post(
    "/api/v1/finance/inventory/item/createItem",
    data
  );
  return res.data;
};

// GET ALL ITEMS
export const getAllItems = async (
  companyId: string,
  params?: any
): Promise<ItemsResponse> => {
  const res = await axiosInstance.get(
    `/api/v1/finance/inventory/item/getAllItems/${companyId}`,
    { params }
  );
  return res.data;
};

// GET ITEM BY ID
export const getItemById = async (
  companyId: string,
  itemId: string
): Promise<ItemResponse> => {
  const res = await axiosInstance.get(
    `/api/v1/finance/inventory/item/itemDetails/${companyId}/${itemId}`
  );
  return res.data;
};

// UPDATE ITEM
export const updateItem = async (
  companyId: string,
  itemId: string,
  data: UpdateItemPayload
): Promise<ItemResponse> => {
  const res = await axiosInstance.put(
    `/api/v1/finance/inventory/item/updateItem/${companyId}/${itemId}`,
    data
  );
  return res.data;
};

// DELETE ITEM
export const deleteItem = async (companyId: string, itemId: string) => {
  const res = await axiosInstance.delete(
    `/api/v1/finance/inventory/item/deleteItem/${companyId}/${itemId}`
  );
  return res.data;
};

// BULK DELETE ITEMS
export const bulkDeleteItems = async (companyId: string, itemIds: string[]) => {
  const res = await axiosInstance.delete(
    `/api/v1/finance/inventory/item/bulkDeleteItems/${companyId}`,
    {
      data: { itemIds },
    }
  );
  return res.data;
};

// UPDATE STOCK
export const updateStock = async (
  companyId: string,
  itemId: string,
  data: UpdateStockPayload
) => {
  const res = await axiosInstance.put(
    `/api/v1/finance/inventory/item/updateStock/${companyId}/${itemId}`,
    data
  );
  return res.data;
};

// LOW STOCK ITEMS
export const getLowStockItems = async (
  companyId: string
): Promise<ItemsResponse> => {
  const res = await axiosInstance.get(
    `/api/v1/finance/inventory/item/lowStockItems/${companyId}`
  );
  return res.data;
};

// ITEMS BY CATEGORY
export const getItemsByCategory = async (
  companyId: string,
  categoryId: string
): Promise<ItemsResponse> => {
  const res = await axiosInstance.get(
    `/api/v1/finance/inventory/item/itemsByCategory/${companyId}/${categoryId}`
  );
  return res.data;
};

// SEARCH ITEMS
export const searchItems = async (
  companyId: string,
  params: any
) => {
  if (!params.search || params.search.trim() === "") {
    throw new Error("Search term is required");
  }

  // Transform search to q for API compatibility
  const apiParams = {
    ...params,
    q: params.search,
  };
  delete apiParams.search;

  const res = await axiosInstance.get(
    `/api/v1/finance/inventory/item/searchItems/${companyId}`,
    { params: apiParams }
  );
  return res.data;
};

// ITEM STATISTICS
export const getItemStatistics = async (companyId: string) => {
  const res = await axiosInstance.get(
    `/api/v1/finance/inventory/item/statistics/${companyId}`
  );
  return res.data;
};

// UPLOAD ITEM IMAGE
export const uploadItemImage = async (itemId: string, file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await axiosInstance.post(
    `/api/v1/finance/inventory/item/uploadImage/${itemId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

// DELETE ITEM IMAGE
export const deleteItemImage = async (itemId: string) => {
  const res = await axiosInstance.delete(
    `/api/v1/finance/inventory/item/deleteImage/${itemId}`
  );
  return res.data;
};

// -----------------------------------------------------
//                    EXPORT DEFAULT
// -----------------------------------------------------

export default {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  bulkDeleteItems,
  updateStock,
  getLowStockItems,
  getItemsByCategory,
  searchItems,
  getItemStatistics,
  uploadItemImage,
  deleteItemImage,
};
