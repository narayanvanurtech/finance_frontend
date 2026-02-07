export type TaxType = "igst" | "cgst_sgst";
export type DiscountType = "flat" | "percentage";

export function calculateItemAmount({
  qty,
  rate,
  discount,
  discountType,
  taxRate,
  taxType,
}: {
  qty: number;
  rate: number;
  discount: number;
  discountType: DiscountType;
  taxRate: number;
  taxType: TaxType;
}) {
  let base = qty * rate;

  if (discountType === "percentage") {
    base -= (base * discount) / 100;
  } else {
    base -= discount;
  }

  base = Math.max(base, 0);

  const taxAmount = (base * taxRate) / 100;

  return {
    amount: Number((base + taxAmount).toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    igstAmount: taxType === "igst" ? Number(taxAmount.toFixed(2)) : 0,
    cgstAmount:
      taxType === "cgst_sgst" ? Number((taxAmount / 2).toFixed(2)) : 0,
    sgstAmount:
      taxType === "cgst_sgst" ? Number((taxAmount / 2).toFixed(2)) : 0,
  };
}
