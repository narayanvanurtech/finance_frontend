# Payment Made API Update - New Endpoints

## Overview

This document outlines the newly added Payout Receipt API endpoints that were missing from the frontend implementation.

## Changes Made

### 1. API Layer (`src/api/finance/paymentMadeApi.ts`)

#### New Interfaces Added

```typescript
interface PaymentMethodBreakdown {
  _id: string | null;
  paymentMethod: string;
  totalAmount: number;
  count: number;
}

interface PaymentBreakdownResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: PaymentMethodBreakdown[];
}

interface PendingPurchase {
  _id: string;
  purchaseOrderNumber: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  dueDate?: string;
}

interface VendorPendingPurchasesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: PendingPurchase[];
}
```

#### New API Methods

##### 1. Get Payment Method Breakdown

```typescript
getPaymentBreakdown: async (filters?: {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
}): Promise<PaymentBreakdownResponse>
```

**Endpoint:** `GET /api/v1/finance/purchases/payout-receipts/payment-breakdown`

**Query Parameters:**

- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `vendorId` (optional): Filter by vendor ID

**Returns:** Breakdown of payments by payment method with total amounts and counts

---

##### 2. Get Vendor's Pending Purchases

```typescript
getVendorPendingPurchases: async (
  vendorId: string
): Promise<VendorPendingPurchasesResponse>
```

**Endpoint:** `GET /api/v1/finance/purchases/payout-receipts/vendor/:vendorId/pending-purchases`

**Path Parameters:**

- `vendorId` (required): The vendor's ID

**Returns:** List of pending purchases for the specified vendor

---

### 2. React Query Hooks (`src/hooks/usePaymentMadeQueries.ts`)

#### New Query Keys

```typescript
paymentBreakdown: (filters?: {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
}) => [...paymentMadeKeys.all, "paymentBreakdown", filters] as const,

vendorPendingPurchases: (vendorId: string) =>
  [...paymentMadeKeys.all, "vendorPendingPurchases", vendorId] as const,
```

#### New Query Hooks

##### 1. useGetPaymentBreakdown

```typescript
export const useGetPaymentBreakdown = (filters?: {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
})
```

**Purpose:** Fetch payment method breakdown statistics

**Features:**

- Optional date range filtering
- Optional vendor filtering
- 5-minute cache time
- Automatic refetching

**Usage Example:**

```typescript
const { data, isLoading, error } = useGetPaymentBreakdown({
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  vendorId: "vendor123",
});
```

---

##### 2. useGetVendorPendingPurchases

```typescript
export const useGetVendorPendingPurchases = (
  vendorId: string,
  enabled = true
)
```

**Purpose:** Fetch pending purchases for a specific vendor

**Features:**

- Enabled/disabled control
- Only fetches when vendorId is provided
- 2-minute cache time
- Useful for payment allocation screens

**Usage Example:**

```typescript
const { data, isLoading, error } = useGetVendorPendingPurchases("vendor123");

// With enabled control
const { data } = useGetVendorPendingPurchases(
  selectedVendorId,
  !!selectedVendorId
);
```

---

## Complete Endpoint List

### Now Available in Frontend

1. ✅ **Generate Receipt Number**

   - `GET /finance/purchases/payout-receipts/generate-number`

2. ✅ **Get Statistics**

   - `GET /finance/purchases/payout-receipts/stats`

3. ✅ **Get Payment Method Breakdown** (NEW)

   - `GET /finance/purchases/payout-receipts/payment-breakdown`

4. ✅ **Get Vendor's Pending Purchases** (NEW)

   - `GET /finance/purchases/payout-receipts/vendor/:vendorId/pending-purchases`

5. ✅ **Get All Payout Receipts**

   - `GET /finance/purchases/payout-receipts`

6. ✅ **Get Single Payout Receipt**

   - `GET /finance/purchases/payout-receipts/:id`

7. ✅ **Create Payout Receipt**

   - `POST /finance/purchases/payout-receipts`

8. ✅ **Update Payout Receipt**

   - `PUT /finance/purchases/payout-receipts/:id`

9. ✅ **Delete Payout Receipt**

   - `DELETE /finance/purchases/payout-receipts/:id`

10. ✅ **Search Payout Receipts**
    - `GET /finance/purchases/payout-receipts?search=...`

---

## Use Cases

### Payment Method Breakdown

Use this endpoint to:

- Display payment statistics by method (Cash, Card, Bank Transfer, etc.)
- Show pie charts or bar graphs of payment distribution
- Generate financial reports
- Analyze payment trends

### Vendor Pending Purchases

Use this endpoint to:

- Show vendors their outstanding balances
- Populate allocation dropdown when creating payments
- Display what purchases need payment
- Calculate total pending amounts for vendor dashboard

---

## Integration Points

### Dashboard Statistics

The payment breakdown can be used in:

- `src/app/(dashboard)/finance/(purchases)/payments-made/page.tsx`
- Finance dashboard overview components
- Vendor detail pages

### Payment Creation Form

The vendor pending purchases endpoint is useful for:

- `src/app/(dashboard)/finance/(purchases)/payments-made/create/page.tsx`
- Payment allocation selector
- Smart suggestions for payment amounts

---

## Next Steps

1. **Implement in UI Components**

   - Add payment breakdown charts to dashboard
   - Integrate pending purchases in payment forms
   - Create vendor-specific payment views

2. **Testing**

   - Test with various date ranges
   - Verify vendor filtering works correctly
   - Check edge cases (no pending purchases, no payments)

3. **Documentation**
   - Add component documentation
   - Create user guides for payment features
   - Document business rules for allocations

---

## Notes

- All endpoints require authentication
- Date filters use ISO 8601 format (YYYY-MM-DD)
- Payment methods should match backend enum values
- Pending purchases only show unpaid or partially paid orders
- Cache times are optimized for balance between freshness and performance

---

**Updated:** December 15, 2025
**Developer:** Payment Made API Enhancement
