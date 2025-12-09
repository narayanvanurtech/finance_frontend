# Sales Order API Updates - Summary

## Overview

Updated the Sales Order API implementation to match the new backend endpoint structure that requires `companyId` in the URL path, similar to the Quotation API pattern.

## Changes Made

### 1. API Layer (`src/api/finance/salesOrderApi.ts`)

#### Updated Endpoints:

- **Get All Sales Orders**: `/api/v1/finance/sales/sales-orders/getAll/{companyId}`
  - Added `companyId` as first parameter
- **Get Sales Order by ID**: `/api/v1/finance/sales/sales-orders/getById/{orderId}/{companyId}`
  - Added `companyId` as second parameter
- **Update Sales Order**: `/api/v1/finance/sales/sales-orders/update/{orderId}/{companyId}`
  - Added `companyId` as second parameter
- **Get Stats**: `/api/v1/finance/sales/sales-orders/stats/{companyId}?period={period}`
  - Added `companyId` in URL path
  - Period as query parameter
- **Search Sales Orders**: Uses `getAllSalesOrders` with `companyId` parameter

#### Method Signatures Updated:

```typescript
// Before
getAllSalesOrders(params?: SalesOrderQueryParams)
getSalesOrderById(orderId: string)
updateSalesOrder(orderId: string, orderData: UpdateSalesOrderPayload)
getSalesOrderStats(period?: string)
searchSalesOrders(params: SalesOrderQueryParams)

// After
getAllSalesOrders(companyId: string, params?: SalesOrderQueryParams)
getSalesOrderById(orderId: string, companyId: string)
updateSalesOrder(orderId: string, companyId: string, orderData: UpdateSalesOrderPayload)
getSalesOrderStats(companyId: string, period?: string)
searchSalesOrders(companyId: string, params: SalesOrderQueryParams)
```

### 2. Store Layer (`src/stores/financeStore/useSalesOrderStore.ts`)

#### New Features:

- Added `companyId` state to store
- Added `setCompanyId()` method to set company ID
- Updated all methods to use or require `companyId`

#### Updated Store Interface:

```typescript
interface SalesOrderStore {
  // ... existing properties
  companyId: string | null;

  setCompanyId: (id: string) => void;
  fetchSalesOrders: (page?: number, limit?: number) => Promise<void>;
  fetchSalesOrderById: (
    id: string,
    companyId: string
  ) => Promise<SalesOrder | null>;
  updateSalesOrder: (
    id: string,
    companyId: string,
    updated: UpdateSalesOrderPayload
  ) => Promise<SalesOrder>;
  searchSalesOrders: (
    companyId: string,
    params: SalesOrderQueryParams
  ) => Promise<void>;
  getSalesOrderStats: (companyId: string, period?: string) => Promise<any>;
}
```

#### Persistence:

- Added `companyId` to persist configuration
- Draft orders now include company context

### 3. Page Updates

#### Sales Orders Listing Page (`page.tsx`)

- Added `useAuthStore` to get user's company ID
- Added `useEffect` to set company ID and fetch orders on mount
- Updated to use `salesOrders` from store instead of local state
- Added loading state display
- Fixed amount display to use `grandTotal` instead of calculating from items
- Fixed edit link to use order `_id` instead of `orderNumber`

#### Create Page (`create/page.tsx`)

- No changes required - already passes `companyId` to `createSalesOrder`

#### Edit Page (`edit/[id]/page.tsx`)

- **Complete Rewrite**: Was using wrong component (InvoiceForm)
- Now uses correct `SalesOrderForm` component
- Added `useEffect` to fetch sales order data with `companyId`
- Properly maps backend data to form values
- Handles type conversions for `clientDetails`, `businessDetails`, and `cessList`
- Fixed attachments handling (empty array instead of strings)
- Added proper error handling and loading states

## API Endpoint Reference

### Get All Sales Orders

```
GET /api/v1/finance/sales/sales-orders/getAll/68d672b349d08463d13d31ba
```

### Get Statistics

```
GET /api/v1/finance/sales/sales-orders/stats/68d672b349d08463d13d31ba?period=30
```

### Get By ID

```
GET /api/v1/finance/sales/sales-orders/getById/692e7239f825784150232f3d/68d672b349d08463d13d31ba
```

### Update

```
PUT /api/v1/finance/sales/sales-orders/update/692e7239f825784150232f3d/68d672b349d08463d13d31ba
```

## Migration Notes

### For Components Using the Store:

1. Ensure `user.companyId` is available from `useAuthStore()`
2. Call `setCompanyId(user.companyId)` before fetching data
3. Pass `companyId` explicitly when calling individual fetch methods like `fetchSalesOrderById`

### Example Usage:

```typescript
const { user } = useAuthStore();
const { setCompanyId, fetchSalesOrders, fetchSalesOrderById } =
  useSalesOrderStore();

// Set company ID once
useEffect(() => {
  if (user?.companyId) {
    setCompanyId(user.companyId);
    fetchSalesOrders(); // Will use stored companyId
  }
}, [user?.companyId]);

// Or pass explicitly
const order = await fetchSalesOrderById(orderId, user.companyId);
```

## Testing Checklist

- [ ] List all sales orders
- [ ] Create new sales order
- [ ] Edit existing sales order
- [ ] View sales order statistics
- [ ] Search/filter sales orders
- [ ] Verify draft auto-save works
- [ ] Check pagination works correctly
- [ ] Verify company context is maintained

## Breaking Changes

⚠️ **Important**: All components/pages using the sales order store must be updated to provide `companyId` where required. The store will now validate that `companyId` exists before making API calls for listing operations.

## Files Modified

1. `src/api/finance/salesOrderApi.ts`
2. `src/stores/financeStore/useSalesOrderStore.ts`
3. `src/app/(dashboard)/finance/(sales)/sales-orders/page.tsx`
4. `src/app/(dashboard)/finance/(sales)/sales-orders/edit/[id]/page.tsx`

## Status

✅ All changes implemented
✅ No TypeScript errors
✅ Pattern matches Quotation API implementation
