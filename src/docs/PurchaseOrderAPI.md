# Purchase Order API Implementation

This document describes the Purchase Order API implementation and how to use it in the VTM CRM application.

## Overview

The Purchase Order API provides comprehensive functionality for managing purchase orders, including:
- CRUD operations (Create, Read, Update, Delete)
- Approval workflow management
- Vendor acknowledgment
- Attachment management
- Search and filtering
- Statistics and reporting

## File Structure

```
src/
├── api/finance/
│   └── purchaseOrderApi.ts          # API client functions
├── stores/financeStore/
│   └── usePurchaseOrderStore.ts     # Zustand store with API integration
├── hooks/
│   └── usePurchaseOrderApi.ts       # Custom hook for API operations
├── utils/
│   └── purchaseOrderUtils.ts        # Utility functions for data transformation
└── components/examples/
    └── PurchaseOrderApiExample.tsx  # Example usage component
```

## API Endpoints

Based on the backend routes, the following endpoints are available:

### Core CRUD Operations
- `POST /api/finance/purchases/purchase-orders/createPurchaseOrder` - Create new purchase order
- `GET /api/finance/purchases/purchase-orders/getAllPurchaseOrders` - Get all purchase orders with pagination
- `GET /api/finance/purchases/purchase-orders/purchaseOrderDetails/:id` - Get purchase order by ID
- `PUT /api/finance/purchases/purchase-orders/updatePurchaseOrderDetails/:id` - Update purchase order
- `DELETE /api/finance/purchases/purchase-orders/deletePurchaseOrder/:id` - Delete purchase order

### Bulk Operations
- `DELETE /api/finance/purchases/purchase-orders/bulkDeletePurchaseOrders` - Bulk delete purchase orders

### Search and Filter
- `GET /api/finance/purchases/purchase-orders/searchPurchaseOrders` - Search purchase orders

### Workflow Management
- `PATCH /api/finance/purchases/purchase-orders/updateApprovalStatus/:id` - Update approval status
- `PATCH /api/finance/purchases/purchase-orders/acknowledgeByVendor/:id` - Vendor acknowledgment

### Attachment Management
- `POST /api/finance/purchases/purchase-orders/addAttachment/:id` - Add attachment
- `DELETE /api/finance/purchases/purchase-orders/removeAttachment/:id/:index` - Remove attachment

### Statistics
- `GET /api/finance/purchases/purchase-orders/stats` - Get purchase order statistics

## Usage Examples

### 1. Basic API Usage

```typescript
import purchaseOrderApi from '@/api/finance/purchaseOrderApi';

// Create a purchase order
const createPO = async () => {
  try {
    const response = await purchaseOrderApi.createPurchaseOrder({
      vendorId: 'vendor-id',
      purchaseOrderDate: '2025-08-07',
      items: [
        {
          name: 'Item 1',
          unit: 'pcs',
          quantity: 10,
          rate: 100
        }
      ]
    });
    console.log('Created PO:', response.result);
  } catch (error) {
    console.error('Error creating PO:', error);
  }
};

// Fetch purchase orders with pagination
const fetchPOs = async () => {
  try {
    const response = await purchaseOrderApi.getAllPurchaseOrders({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    console.log('Purchase Orders:', response.result.purchaseOrders);
  } catch (error) {
    console.error('Error fetching POs:', error);
  }
};
```

### 2. Using the Custom Hook

```typescript
import { usePurchaseOrderApi } from '@/hooks/usePurchaseOrderApi';

const MyComponent = () => {
  const {
    purchaseOrders,
    loading,
    error,
    fetchPOs,
    createPO,
    updatePO,
    deletePO
  } = usePurchaseOrderApi();

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  const handleCreate = async () => {
    const result = await createPO({
      vendorId: 'vendor-id',
      purchaseOrderDate: '2025-08-07',
      items: [/* items */]
    });
    
    if (result) {
      console.log('PO created successfully');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {purchaseOrders.map(po => (
        <div key={po._id}>{po.purchaseOrderNumber}</div>
      ))}
    </div>
  );
};
```

### 3. Using the Zustand Store

```typescript
import { usePurchaseOrderStore } from '@/stores/financeStore/usePurchaseOrderStore';

const MyComponent = () => {
  const {
    apiPurchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
    createPurchaseOrderApi
  } = usePurchaseOrderStore();

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Access state directly
  console.log('POs:', apiPurchaseOrders);
  console.log('Loading:', loading);
  console.log('Error:', error);
};
```

### 4. Data Transformation

```typescript
import {
  transformFormToCreatePayload,
  transformApiToFormValues,
  calculatePurchaseOrderTotals
} from '@/utils/purchaseOrderUtils';

// Transform form data to API payload
const formValues: PurchaseOrderFormValues = {
  purchaseOrderNo: 'PO-001',
  orderDate: '2025-08-07',
  // ... other form fields
};

const apiPayload = transformFormToCreatePayload(formValues);

// Transform API data to form values
const apiPO: PurchaseOrder = {
  _id: 'po-id',
  purchaseOrderNumber: 'PO-001',
  // ... other API fields
};

const formValues = transformApiToFormValues(apiPO);

// Calculate totals
const totals = calculatePurchaseOrderTotals(
  formValues.items,
  formValues.discountType,
  formValues.discountValue,
  formValues.shipping
);
```

## Store Structure

The `usePurchaseOrderStore` provides both local storage (for backward compatibility) and API integration:

```typescript
interface PurchaseOrderStore {
  // Local state (backward compatibility)
  purchaseOrders: PurchaseOrderFormValues[];
  
  // API state
  apiPurchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;

  // Local actions
  createPurchaseOrder: (po: PurchaseOrderFormValues) => void;
  updatePurchaseOrder: (id: string, updated: Partial<PurchaseOrderFormValues>) => void;
  removePurchaseOrder: (id: string) => void;

  // API actions
  fetchPurchaseOrders: (filters?: GetPurchaseOrdersFilters) => Promise<void>;
  createPurchaseOrderApi: (data: CreatePurchaseOrderPayload) => Promise<PurchaseOrder | null>;
  updatePurchaseOrderApi: (id: string, data: UpdatePurchaseOrderPayload) => Promise<PurchaseOrder | null>;
  // ... other API actions
}
```

## Error Handling

All API functions include proper error handling:

```typescript
try {
  const result = await purchaseOrderApi.createPurchaseOrder(data);
  // Handle success
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle Axios errors (network, HTTP status codes)
    console.error('API Error:', error.response?.data);
  } else {
    // Handle other errors
    console.error('Unexpected Error:', error);
  }
}
```

## Filtering and Pagination

The API supports comprehensive filtering:

```typescript
const filters: GetPurchaseOrdersFilters = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  status: 'draft',
  priority: 'high',
  vendorId: 'vendor-id',
  startDate: '2025-01-01',
  endDate: '2025-12-31'
};

await fetchPurchaseOrders(filters);
```

## Approval Workflow

Manage purchase order approvals:

```typescript
// Approve a purchase order
await updateApprovalStatus('po-id', {
  approvalStatus: 'approved'
});

// Reject with reason
await updateApprovalStatus('po-id', {
  approvalStatus: 'rejected',
  rejectionReason: 'Budget constraints'
});

// Vendor acknowledgment
await acknowledgeByVendor('po-id', {
  vendorComments: 'Order acknowledged. Will deliver as scheduled.'
});
```

## Statistics and Reporting

Get purchase order statistics:

```typescript
const stats = await getPurchaseOrderStats('2025-01-01', '2025-12-31');
console.log('Total POs:', stats.totalPOs);
console.log('Total Value:', stats.totalValue);
console.log('Average Order Value:', stats.avgOrderValue);
```

## Migration from Local Store

If you're migrating from the local-only store to the API-integrated version:

1. **Backward Compatibility**: The local store methods are still available
2. **Gradual Migration**: Use `apiPurchaseOrders` instead of `purchaseOrders`
3. **Error Handling**: Add error handling for API calls
4. **Loading States**: Use the `loading` state for UI feedback

```typescript
// Old way (still works)
const { purchaseOrders, createPurchaseOrder } = usePurchaseOrderStore();

// New way (recommended)
const { apiPurchaseOrders, createPurchaseOrderApi } = usePurchaseOrderStore();
```

## Best Practices

1. **Use the Custom Hook**: `usePurchaseOrderApi` provides the cleanest API
2. **Handle Loading States**: Always show loading indicators
3. **Error Handling**: Implement proper error handling and user feedback
4. **Data Transformation**: Use utility functions for consistent data transformation
5. **Pagination**: Implement pagination for large datasets
6. **Optimistic Updates**: Update local state immediately for better UX

## Testing

Example test usage is provided in `PurchaseOrderApiExample.tsx`. Run this component to test all API functionality:

```tsx
import PurchaseOrderApiExample from '@/components/examples/PurchaseOrderApiExample';

// Use in your app to test the implementation
<PurchaseOrderApiExample />
```

This implementation provides a robust, type-safe interface for managing purchase orders with full API integration while maintaining backward compatibility with existing code.
