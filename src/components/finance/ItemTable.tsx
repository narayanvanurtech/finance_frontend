import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Info } from "lucide-react";

type Cess = {
  name: string;
  showInInvoice: boolean;
};

export type Item = {
  name: string;
  description: string;
  qty: number;
  rate: number;
  discount: number;
  discountType?: "flat" | "percentage";
  igst?: number;
  sgst?: number;
  cgst?: number;
  amount: number;
  hsn: string;
  unit: string;
  [key: string]: any;
};

export type ItemTableProps = {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  handleItemChange: (idx: number, field: string, value: any) => void;
  handleAddItem: () => void;
  handleRemoveItem: (idx: number) => void;
  showHSN: boolean;
  setShowHSN: React.Dispatch<React.SetStateAction<boolean>>;
  showUnit: boolean;
  setShowUnit: React.Dispatch<React.SetStateAction<boolean>>;
  onAddNewItemClick: () => void;
  openBulkModal: () => void;
  taxType: "inclusive" | "exclusive";
  taxConfiguration: "IGST" | "SGST_CGST";
  cessList: Cess[];
  setTaxType: React.Dispatch<React.SetStateAction<"inclusive" | "exclusive">>;
  setTaxConfiguration: (taxConfig: "IGST" | "SGST_CGST") => void;
  setCessList: React.Dispatch<React.SetStateAction<Cess[]>>;
  mockProducts?: {
    id: number;
    name: string;
    price: number;
    type: string;
    description?: string;
    hsn?: string;
    unit?: string;
    igst?: number;
    sgst?: number;
    cgst?: number;
  }[];
  businessState?: string;
  clientState?: string;
};

const ItemTable: React.FC<ItemTableProps> = ({
  items,
  setItems,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
  showHSN,
  setShowHSN,
  showUnit,
  setShowUnit,
  onAddNewItemClick,
  openBulkModal,
  taxType,
  taxConfiguration,
  cessList,
  setTaxType,
  setTaxConfiguration,
  setCessList,
  mockProducts,
  businessState,
  clientState,
}) => {
  // Auto-select tax configuration based on state comparison
  React.useEffect(() => {
    if (businessState && clientState && taxType === "exclusive") {
      if (businessState === clientState) {
        setTaxConfiguration("SGST_CGST");
      } else {
        setTaxConfiguration("IGST");
      }
    }
  }, [businessState, clientState, taxType, setTaxConfiguration]);

  const UNIT_OPTIONS = [
    { value: "nos", label: "Nos (Numbers)" },
    { value: "pcs", label: "Pcs (Pieces)" },
    { value: "kg", label: "Kg" },
    { value: "gm", label: "Gm" },
    { value: "ltr", label: "Ltr" },
    { value: "ml", label: "Ml" },
    { value: "box", label: "Box" },
    { value: "dozen", label: "Dozen" },
    { value: "set", label: "Set" },
    { value: "hour", label: "Hour" },
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "meter", label: "Meter" },
    { value: "feet", label: "Feet" },
    { value: "inch", label: "Inch" },
    { value: "sqft", label: "Sq Ft" },
    { value: "sqmeter", label: "Sq Meter" },
    { value: "pack", label: "Pack" },
    { value: "bundle", label: "Bundle" },
    { value: "roll", label: "Roll" },
    { value: "sheet", label: "Sheet" },
    { value: "other", label: "Other" },
  ];

  const [customUnits, setCustomUnits] = React.useState<{
    [key: number]: string;
  }>({});

  return (
    <Card className="bg-white rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 className="text-lg font-semibold">Items</h2>
        <div className="flex gap-4 items-center flex-wrap ml-auto">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
              Tax Type:
            </label>
            <Select
              value={taxType}
              onValueChange={(value) =>
                setTaxType(value as "inclusive" | "exclusive")
              }
            >
              <SelectTrigger className="w-32 h-8 bg-white">
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inclusive">Inclusive</SelectItem>
                <SelectItem value="exclusive">Exclusive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {taxType === "exclusive" && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                Tax Config:
              </label>
              <Select
                value={taxConfiguration}
                onValueChange={(value) =>
                  setTaxConfiguration(value as "IGST" | "SGST_CGST")
                }
              >
                <SelectTrigger className="w-36 h-8 bg-white">
                  <SelectValue placeholder="Select config" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IGST">IGST</SelectItem>
                  <SelectItem value="SGST_CGST">SGST + CGST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
              <Checkbox
                checked={showHSN}
                onCheckedChange={(checked) => setShowHSN(checked === true)}
              />
              <span className="text-gray-700">HSN/SAC</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
              <Checkbox
                checked={showUnit}
                onCheckedChange={(checked) => setShowUnit(checked === true)}
              />
              <span className="text-gray-700">Unit</span>
            </label>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left min-w-[200px]">
                Item Details
              </th>

              <th className="px-3 py-2 text-center min-w-[80px]">Qty</th>
              <th className="px-3 py-2 text-center min-w-[100px]">Rate</th>
              <th className="px-3 py-2 text-right min-w-[140px]">Discount</th>
              {taxType === "exclusive" && taxConfiguration === "IGST" && (
                <th className="px-3 py-2 text-center min-w-[120px]">
                  IGST (%)
                </th>
              )}
              {taxType === "exclusive" && taxConfiguration === "SGST_CGST" && (
                <>
                  <th className="px-3 py-2 text-center min-w-[120px]">
                    SGST (%)
                  </th>
                  <th className="px-3 py-2 text-center min-w-[120px]">
                    CGST (%)
                  </th>
                </>
              )}
              {taxType === "exclusive" &&
                cessList
                  .filter((c) => c.showInInvoice)
                  .map((cess, i) => (
                    <th className="px-3 py-2 text-center min-w-[80px]" key={i}>
                      {cess.name || "Cess"}
                    </th>
                  ))}
              {showHSN && (
                <th className="px-3 py-2 text-center min-w-[120px]">HSN/SAC</th>
              )}
              {showUnit && (
                <th className="px-3 py-2 text-center min-w-[120px]">Unit</th>
              )}
              <th className="px-3 py-2 text-right min-w-[120px]">Amount</th>
              <th className="px-2 py-2 text-center min-w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={`item-row-${idx}-${item.discountType || "flat"}`}
                className="even:bg-gray-50 hover:bg-blue-50 transition"
              >
                {/* Item Name */}
                <td className="px-3 py-3 align-top">
                  <Input
                    type="text"
                    className="w-full min-w-[180px] h-10"
                    placeholder="Enter item name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(idx, "name", e.target.value)
                    }
                  />
                </td>

                {/* Qty */}
                <td className="px-3 py-3 align-top">
                  <Input
                    type="number"
                    className="w-full text-center h-10"
                    value={item.qty ?? item.quantity ?? 1}
                    min={1}
                    onChange={(e) =>
                      handleItemChange(idx, "qty", Number(e.target.value))
                    }
                  />
                </td>

                {/* Rate */}
                <td className="px-3 py-3 align-top">
                  <div className="flex items-center justify-center h-10">
                    <span className="text-gray-500 mr-1 text-xs">₹</span>
                    <Input
                      type="number"
                      className="w-full text-center h-10"
                      value={item.rate}
                      min={0}
                      onChange={(e) =>
                        handleItemChange(idx, "rate", e.target.value)
                      }
                    />
                  </div>
                </td>

                {/* Discount */}
                <td className="px-3 py-3 align-top">
                  <div className="flex items-center justify-center gap-1 h-10">
                    <Select
                      key={`discount-select-${idx}-${
                        item.discountType || "flat"
                      }`}
                      onValueChange={(value) =>
                        handleItemChange(idx, "discountType", value)
                      }
                      defaultValue={item.discountType || "flat"}
                    >
                      <SelectTrigger className="w-[60px] h-10 text-xs">
                        <SelectValue placeholder="₹" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">₹</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      className="w-[70px] text-right h-10"
                      value={item.discount || 0}
                      min={0}
                      max={item.discountType === "percentage" ? 100 : undefined}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "discount",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </td>

                {/* IGST */}
                {taxType === "exclusive" && taxConfiguration === "IGST" && (
                  <td className="px-3 py-3 align-top">
                    <div className="w-full">
                      <Input
                        type="number"
                        className="w-full text-center h-10"
                        value={item.igst ?? 0}
                        min={0}
                        onChange={(e) =>
                          handleItemChange(idx, "igst", Number(e.target.value))
                        }
                      />
                      <div className="text-[10px] text-center text-gray-500 font-medium leading-tight">
                        ₹
                        {(
                          (((item.quantity || item.qty || 0) *
                            (item.rate || 0) -
                            (item.discountType === "percentage"
                              ? ((item.quantity || item.qty || 0) *
                                  (item.rate || 0) *
                                  (item.discount || 0)) /
                                100
                              : item.discount || 0)) *
                            (item.igst || 0)) /
                          100
                        ).toFixed(2)}
                      </div>
                    </div>
                  </td>
                )}

                {/* SGST + CGST */}
                {taxType === "exclusive" &&
                  taxConfiguration === "SGST_CGST" && (
                    <>
                      <td className="px-3 py-3 align-top">
                        <div className="w-full">
                          <Input
                            type="number"
                            className="w-full text-center h-10"
                            value={item.sgst ?? 0}
                            min={0}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "sgst",
                                Number(e.target.value)
                              )
                            }
                          />
                          <div className="text-[10px] text-center text-gray-500 font-medium leading-tight">
                            ₹
                            {(
                              (((item.quantity || item.qty || 0) *
                                (item.rate || 0) -
                                (item.discountType === "percentage"
                                  ? ((item.quantity || item.qty || 0) *
                                      (item.rate || 0) *
                                      (item.discount || 0)) /
                                    100
                                  : item.discount || 0)) *
                                (item.sgst || 0)) /
                              100
                            ).toFixed(2)}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 align-top">
                        <div className="w-full">
                          <Input
                            type="number"
                            className="w-full text-center h-10"
                            value={item.cgst ?? 0}
                            min={0}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "cgst",
                                Number(e.target.value)
                              )
                            }
                          />
                          <div className="text-[10px] text-center text-gray-500 font-medium leading-tight">
                            ₹
                            {(
                              (((item.quantity || item.qty || 0) *
                                (item.rate || 0) -
                                (item.discountType === "percentage"
                                  ? ((item.quantity || item.qty || 0) *
                                      (item.rate || 0) *
                                      (item.discount || 0)) /
                                    100
                                  : item.discount || 0)) *
                                (item.cgst || 0)) /
                              100
                            ).toFixed(2)}
                          </div>
                        </div>
                      </td>
                    </>
                  )}

                {/* Cess */}
                {taxType === "exclusive" &&
                  cessList
                    .filter((c) => c.showInInvoice)
                    .map((cess, i) => (
                      <td className="px-3 py-3 align-top" key={i}>
                        <Input
                          type="number"
                          className="w-full text-center h-10"
                          value={item[cess.name] ?? 0}
                          min={0}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              cess.name,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                    ))}

                {/* HSN */}
                {showHSN && (
                  <td className="px-3 py-3 align-top">
                    <Input
                      className="w-full text-center h-10"
                      value={item.hsn}
                      onChange={(e) =>
                        handleItemChange(idx, "hsn", e.target.value)
                      }
                      placeholder="HSN"
                    />
                    <div className="h-[14px]"></div>
                  </td>
                )}

                {/* Unit */}
                {showUnit && (
                  <td className="px-3 py-3 align-top">
                    {item.unit === "other" ? (
                      <>
                        <Input
                          className="w-[80px] text-center h-10"
                          value={item.unit}
                          onChange={(e) =>
                            handleItemChange(idx, "unit", e.target.value)
                          }
                          placeholder="Custom"
                        />
                        <div className="h-[14px]"></div>
                      </>
                    ) : (
                      <>
                        <Select
                          value={item.unit || "pcs"}
                          onValueChange={(value) =>
                            handleItemChange(idx, "unit", value)
                          }
                        >
                          <SelectTrigger className="w-full h-10">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="h-[14px]"></div>
                      </>
                    )}
                  </td>
                )}

                {/* Amount */}
                <td className="px-3 py-3 align-top">
                  <div className="font-mono text-right font-semibold h-10 flex items-center justify-end">
                    ₹{item.amount.toFixed(2)}
                  </div>
                </td>

                {/* Delete Row */}
                <td className="px-2 py-3 text-center align-top">
                  {items.length > 1 && (
                    <Button
                      className="text-gray-500 hover:text-red-500 text-lg p-0 h-10 w-10"
                      variant="ghost"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-4">
        <Button className="btn btn-outline" onClick={handleAddItem}>
          + Add New Row
        </Button>
        <Button
          className="btn btn-outline"
          type="button"
          onClick={openBulkModal}
        >
          + Add Items in Bulk
        </Button>
      </div>
    </Card>
  );
};

export default ItemTable;
