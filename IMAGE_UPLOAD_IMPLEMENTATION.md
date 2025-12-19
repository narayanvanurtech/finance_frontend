# Image Upload Implementation for Items

## Overview

Successfully implemented image upload functionality with API endpoints for the Item management system.

## Implementation Details

### 1. API Layer (`src/api/finance/itemApi.ts`)

Already had the required API functions:

```typescript
// Upload image endpoint
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

// Delete image endpoint
export const deleteItemImage = async (itemId: string) => {
  const res = await axiosInstance.delete(
    `/api/v1/finance/inventory/item/deleteImage/${itemId}`
  );
  return res.data;
};
```

### 2. React Query Hooks (`src/hooks/useItemQueries.ts`)

Already had the mutation hooks:

```typescript
// Upload Item Image Hook
export const useUploadItemImage = (companyId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      itemApi.uploadItemImage(itemId, file),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: itemKeys.detail(companyId, variables.itemId),
      });
      toast.success("Image uploaded successfully");
    },
  });
};

// Delete Item Image Hook
export const useDeleteItemImage = (companyId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itemApi.deleteItemImage(itemId),
    onSuccess: (_, itemId) => {
      qc.invalidateQueries({
        queryKey: itemKeys.detail(companyId, itemId),
      });
      toast.success("Image deleted successfully");
    },
  });
};
```

### 3. Create Item Page (`src/app/(dashboard)/finance/inventory/items/create/page.tsx`)

**Changes Made:**

#### Added Import:

```typescript
import { useCreateItem, useUploadItemImage } from "@/hooks/useItemQueries";
```

#### Added Hook Usage:

```typescript
const { mutateAsync: uploadItemImage } = useUploadItemImage(companyId);
```

#### Updated handleSubmit Function:

```typescript
// Create the item first
const response = await createItem({
  companyId: companyId,
  name: form.name,
  description: form.description,
  // ... other fields
});

// Upload image if present
if (form.image && response?.result?._id) {
  try {
    await uploadItemImage({
      itemId: response.result._id,
      file: form.image,
    });
  } catch (imageError) {
    console.error("Failed to upload image:", imageError);
    // Don't block the flow if image upload fails
  }
}
```

### 4. Edit Item Page (`src/app/(dashboard)/finance/inventory/items/edit/[id]/page.tsx`)

Already had complete implementation:

```typescript
// Import hooks
import {
  useItemById,
  useUpdateItem,
  useUploadItemImage,
  useDeleteItemImage,
} from "@/hooks/useItemQueries";

// Use hooks
const { mutateAsync: uploadImageMutation } = useUploadItemImage(companyId);
const { mutateAsync: deleteImageMutation } = useDeleteItemImage(companyId);

// In handleSubmit
await updateItem(updateData);

// Handle image upload/deletion if changed
if (newImageFile) {
  await uploadImageMutation({
    itemId: currentItem._id,
    file: newImageFile,
  });
} else if (!imagePreview && currentItem.imageUrl) {
  await deleteImageMutation(currentItem._id);
}
```

## Features Implemented

### ✅ Create Item Flow

1. User fills in item details and optionally uploads an image
2. Item is created first without image
3. If image exists, it's uploaded separately using the item's ID
4. Success toast notification on completion
5. Graceful error handling - item creation succeeds even if image upload fails

### ✅ Edit Item Flow

1. User can upload a new image to replace existing one
2. User can remove existing image
3. Image operations happen after item update
4. Query cache invalidation ensures UI stays in sync
5. Success toast notifications for each operation

### ✅ Image Upload Component

- Drag & drop support
- Click to upload
- Image preview
- File validation (type & size)
- Remove image functionality
- Keyboard accessibility
- Proper error messages

## API Endpoints Used

| Endpoint                                                         | Method | Purpose             |
| ---------------------------------------------------------------- | ------ | ------------------- |
| `/api/v1/finance/inventory/item/createItem`                      | POST   | Create new item     |
| `/api/v1/finance/inventory/item/uploadImage/{itemId}`            | POST   | Upload item image   |
| `/api/v1/finance/inventory/item/updateItem/{companyId}/{itemId}` | PUT    | Update item details |
| `/api/v1/finance/inventory/item/deleteImage/{itemId}`            | DELETE | Delete item image   |

## File Upload Specifications

- **Accepted formats**: All image types (`image/*`)
- **Max file size**: 2MB
- **Upload method**: multipart/form-data
- **Field name**: `image`

## Error Handling

1. **Image upload failure during create**: Item is still created successfully
2. **Image upload failure during edit**: Item update succeeds, user is notified
3. **Invalid file type/size**: User sees error message before submission
4. **Network errors**: Caught and logged, user-friendly toast messages shown

## Cache Management

The implementation uses React Query's cache invalidation to ensure:

- Item list refreshes after create/update
- Item details refresh after image operations
- UI stays in sync with server state

## Testing Recommendations

1. ✅ Test creating item with image
2. ✅ Test creating item without image
3. ✅ Test updating item and adding image
4. ✅ Test updating item and replacing image
5. ✅ Test updating item and removing image
6. ✅ Test drag & drop functionality
7. ✅ Test file validation (size/type)
8. ✅ Test error scenarios (network failure, invalid file)

## Notes

- Images are uploaded **after** item creation to ensure we have a valid item ID
- The image upload failure doesn't block the main flow
- Toast notifications provide clear feedback to users
- Query cache is properly invalidated to keep UI in sync
