# Payment Status Implementation - Purchase & Expense Module

## 📋 Overview

Payment status functionality has been successfully implemented in the Purchase/Expense module, allowing users to track and update payment status (Pending, Partial, Paid) for each expense.

---

## ✅ Features Implemented

### 1. **Payment Status Types**

Three status types are supported:

- **🔴 Pending**: No payment made yet (`paidAmount = 0`)
- **🟡 Partial**: Some payment made (`0 < paidAmount < totalAmount`)
- **🟢 Paid**: Full payment completed (`paidAmount >= totalAmount`)

### 2. **Update Payment Status Dialog**

**Component**: `src/components/finance/expenses/UpdatePaymentStatusDialog.tsx`

#### Features:

- ✅ Visual status selection with color-coded cards
- ✅ Automatic amount calculation based on status
- ✅ Manual amount input for partial payments
- ✅ Real-time balance amount display
- ✅ Validation for partial payment amounts
- ✅ Current status and amount information display
- ✅ Loading state during update

#### Dialog UI:

```tsx
- Expense Info Card (Number, Total, Current Status, Paid Amount)
- Status Selection Cards (Pending/Partial/Paid with emojis)
- Amount Input Field (for partial/paid status)
- Balance Amount Display
- Helpful status descriptions
- Action buttons (Cancel/Update)
```

### 3. **Expenses List Page Updates**

**File**: `src/app/(dashboard)/finance/(purchases)/expenses/page.tsx`

#### Changes:

- ✅ Added `useUpdatePaymentStatus` hook from queries
- ✅ Imported `FiDollarSign` icon for payment status button
- ✅ Added payment dialog state management
- ✅ Created `handlePaymentStatusClick` handler
- ✅ Created `handlePaymentStatusUpdate` handler
- ✅ Added "Payment Status" option in actions menu
- ✅ Integrated `UpdatePaymentStatusDialog` component
- ✅ Replaced old status dialog with new payment dialog

#### Action Menu:

```
• Edit (navigates to edit page)
• Payment Status (opens payment dialog) [NEW]
• Delete (opens delete confirmation)
```

---

## 🔧 Technical Implementation

### API Integration

**Endpoint**: `PATCH /api/v1/finance/purchases/purchase/:id/payment-status`

**Request Payload**:

```typescript
{
  paymentStatus: "pending" | "partial" | "paid",
  paidAmount?: number
}
```

**Response**:

```typescript
{
  success: boolean,
  message: string,
  data: Purchase // Updated purchase object
}
```

### React Query Hook

**Hook**: `useUpdatePaymentStatus()`

```typescript
const { mutate: updatePaymentStatus, isPending } = useUpdatePaymentStatus();

updatePaymentStatus(
  {
    purchaseId: "123",
    data: {
      paymentStatus: "partial",
      paidAmount: 5000,
    },
  },
  {
    onSuccess: () => {
      // Handle success
    },
  }
);
```

### State Management

```typescript
// Dialog state
const [showPaymentDialog, setShowPaymentDialog] = useState(false);
const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

// Handler to open dialog
const handlePaymentStatusClick = (purchase: any) => {
  setSelectedPurchase(purchase);
  setShowPaymentDialog(true);
  setOpenPopoverId(null);
};

// Handler to update status
const handlePaymentStatusUpdate = (
  status: "pending" | "partial" | "paid",
  paidAmount?: number
) => {
  updatePaymentStatus({
    purchaseId: selectedPurchase._id,
    data: { paymentStatus: status, paidAmount: paidAmount || 0 },
  });
};
```

---

## 🎨 UI/UX Features

### Status Badge Colors

```typescript
{
  purchase.paymentStatus === "paid"
    ? "bg-green-100 text-green-800" // Green
    : purchase.paymentStatus === "partial"
    ? "bg-amber-100 text-amber-800" // Amber/Yellow
    : "bg-red-100 text-red-800"; // Red (Pending)
}
```

### Status Selection Cards

```
┌─────────────┬─────────────┬─────────────┐
│   🔴        │   🟡        │   🟢        │
│  Pending    │  Partial    │   Paid      │
│   ₹0        │  Custom     │  ₹10,000    │
└─────────────┴─────────────┴─────────────┘
```

### Amount Input (Partial Payment)

```
Paid Amount *
┌─────────────────────────────┐
│ ₹ [5,000.00]                │
└─────────────────────────────┘

Balance Amount: ₹5,000.00
```

---

## 🔄 User Flow

### Updating Payment Status

```
1. User clicks "⋮" (more actions) on an expense
   ↓
2. User clicks "💰 Payment Status"
   ↓
3. Dialog opens showing current status & info
   ↓
4. User selects new status (Pending/Partial/Paid)
   ↓
5. If Partial: User enters amount paid
   ↓
6. User clicks "Update Status"
   ↓
7. API call updates payment status
   ↓
8. Success toast shown
   ↓
9. Expense list refreshes with new status
   ↓
10. Dialog closes
```

---

## 📊 Status Logic

### Backend Automatic Calculation

```typescript
// Backend automatically determines status based on paidAmount

if (paidAmount === 0) {
  paymentStatus = "pending";
} else if (paidAmount < totalAmount) {
  paymentStatus = "partial";
} else if (paidAmount >= totalAmount) {
  paymentStatus = "paid";
}
```

### Frontend Validation

```typescript
// Validation for partial payment
if (status === "partial" && paidAmount <= 0) {
  alert("Please enter paid amount for partial payment");
  return;
}

if (status === "partial" && paidAmount >= totalAmount) {
  alert("Paid amount should be less than total for partial payment");
  return;
}
```

---

## 🎯 Real-World Examples

### Example 1: Marking as Pending

```
Expense: BILL-001
Total: ₹50,000
Action: Click Pending → ₹0 automatically set
Result: Status = Pending, Paid = ₹0
```

### Example 2: Partial Payment

```
Expense: BILL-002
Total: ₹1,00,000
Action: Click Partial → Enter ₹40,000
Result: Status = Partial, Paid = ₹40,000, Balance = ₹60,000
```

### Example 3: Full Payment

```
Expense: BILL-003
Total: ₹75,000
Action: Click Paid → ₹75,000 automatically set
Result: Status = Paid, Paid = ₹75,000, Balance = ₹0
```

---

## 🔍 Key Files Modified/Created

### New Files:

1. ✅ `src/components/finance/expenses/UpdatePaymentStatusDialog.tsx` (242 lines)

### Modified Files:

1. ✅ `src/app/(dashboard)/finance/(purchases)/expenses/page.tsx`
   - Added import for `useUpdatePaymentStatus`
   - Added import for `FiDollarSign` icon
   - Added import for `UpdatePaymentStatusDialog`
   - Added payment dialog state
   - Added payment update handlers
   - Updated action menu with payment status option
   - Replaced old status dialog

### Existing Files (Already Present):

- `src/hooks/usePurchaseExpenseQueries.ts` (already has `useUpdatePaymentStatus`)
- `src/api/finance/puchase-expenseeApi.ts` (already has `updatePaymentStatus`)

---

## 🚀 Testing Checklist

- [x] Dialog opens when clicking "Payment Status"
- [x] Current status displayed correctly
- [x] Status cards are interactive
- [x] Amount auto-sets for Pending (₹0) and Paid (full amount)
- [x] Amount input appears for Partial/Paid status
- [x] Balance amount calculates correctly
- [x] Validation works for partial payments
- [x] API call updates payment status
- [x] Success toast appears
- [x] Expense list refreshes with new status
- [x] Status badge color updates (red/amber/green)
- [x] Dialog closes after successful update
- [x] Loading state shows during update

---

## 💡 Benefits

1. **Clear Status Tracking**: Visual indication of payment status with color codes
2. **Easy Updates**: Simple dialog interface for updating status
3. **Partial Payment Support**: Ability to track progressive payments
4. **Balance Calculation**: Automatic balance amount display
5. **Validation**: Prevents invalid payment amounts
6. **User-Friendly**: Intuitive UI with emojis and helpful messages
7. **Real-time Updates**: Immediate refresh after status change

---

## 🔮 Future Enhancements (Optional)

- [ ] Payment history tracking (multiple payments over time)
- [ ] Payment reminders for overdue expenses
- [ ] Payment method tracking per transaction
- [ ] Payment receipt attachment
- [ ] Automated status change based on payment records
- [ ] Payment analytics and reports
- [ ] Export payment statements
- [ ] Payment filters and search

---

## 📝 Notes

- Payment status is managed at the individual expense level
- Backend automatically calculates status based on `paidAmount`
- Frontend provides user-friendly interface for updates
- Status badges provide quick visual feedback
- All changes are persisted to the database
- Query cache automatically invalidates and refreshes

---

## 🎉 Summary

Payment status functionality is now fully operational in the Purchase/Expense module! Users can:

1. ✅ View current payment status with color-coded badges
2. ✅ Update payment status via intuitive dialog
3. ✅ Track partial payments with amount details
4. ✅ See real-time balance calculations
5. ✅ Get instant feedback with success notifications

The implementation follows the same pattern as the Invoice module and provides a consistent user experience across the finance section.
