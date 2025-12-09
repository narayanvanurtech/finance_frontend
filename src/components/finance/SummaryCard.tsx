import React from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export type SummaryCardProps = {
  subtotal: number;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  setDiscountType: (value: 'flat' | 'percentage') => void;
  setDiscountValue: React.Dispatch<React.SetStateAction<number>>;
  tax: number;
  shipping: number;
  setShipping: React.Dispatch<React.SetStateAction<number>>;
  roundOff: boolean;
  setRoundOff: React.Dispatch<React.SetStateAction<boolean>>;
  total: number;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ subtotal, discountType, discountValue, setDiscountType, setDiscountValue, tax, shipping, setShipping, roundOff, setRoundOff, total }) => {
  // Calculate actual discount amount
  const discountAmount = discountType === "flat" 
    ? Number(discountValue || 0)
    : (Number(subtotal || 0) * Number(discountValue || 0)) / 100;

  return (
    <Card className="bg-white rounded-xl p-4 mb-6 ml-auto">
      <div className="flex justify-between mb-1">
        <span>Subtotal</span>
        <span className="font-mono">₹{(subtotal || 0).toFixed(2)}</span>
      </div>
      <div className="flex flex-col mb-2">
        <div className="flex items-center justify-between mb-1">
          <span>Discount</span>
          <span className="flex items-center">
            <Select onValueChange={setDiscountType} value={discountType}>
              <SelectTrigger className="w-[80px] mr-2 h-8 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">₹</SelectItem>
                <SelectItem value="percentage">%</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="number" 
              className="input w-20 h-8 text-xs" 
              value={discountValue || 0} 
              min={0} 
              max={discountType === 'percentage' ? 100 : undefined}
              onChange={e => setDiscountValue(Number(e.target.value) || 0)} 
              placeholder={discountType === 'flat' ? '0' : '0'}
            />
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span></span>
            <span>- ₹{(discountAmount || 0).toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between mb-1">
        <span>Tax</span>
        <span className="font-mono">₹{(tax || 0).toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center mb-1">
        <span>Shipping/Extra</span>
        <div className="flex items-center">
          <span className="text-gray-400 mr-1 text-xs">₹</span>
          <Input 
            type="number" 
            className="input w-20 h-8 text-xs text-right" 
            value={shipping || 0} 
            min={0} 
            onChange={e => setShipping(Number(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span>Round-Off</span>
        <Checkbox 
          checked={roundOff} 
          onCheckedChange={(checked) => setRoundOff(checked === true)} 
        />
      </div>
      <div className="flex justify-between items-center mt-2 border-t pt-2">
        <span className="text-base font-bold">Total</span>
        <span className="text-xl font-extrabold text-blue-600 font-mono">₹{(total || 0).toFixed(2)}</span>
      </div>
    </Card>
  );
};

export default SummaryCard; 