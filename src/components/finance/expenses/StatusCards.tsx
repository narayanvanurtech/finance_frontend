import React from "react";
import {
  FiDollarSign,
  FiPackage,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

interface StatusCardsProps {
  paymentStatus?: "pending" | "partial" | "paid";
  paidAmount?: number;
  totalAmount?: number;
  deliveryStatus?: string;
  onPaymentClick?: () => void;
  onDeliveryClick?: () => void;
}

const StatusCards: React.FC<StatusCardsProps> = ({
  paymentStatus = "pending",
  paidAmount = 0,
  totalAmount = 0,
  deliveryStatus = "pending",
  onPaymentClick,
  onDeliveryClick,
}) => {
  const balanceAmount = totalAmount - paidAmount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Payment Status Card */}
      <div
        className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer hover:shadow-md transition-all ${
          paymentStatus === "paid"
            ? "border-green-300 bg-green-50"
            : paymentStatus === "partial"
            ? "border-amber-300 bg-amber-50"
            : "border-red-300 bg-red-50"
        }`}
        onClick={onPaymentClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FiDollarSign
                className={`w-5 h-5 ${
                  paymentStatus === "paid"
                    ? "text-green-600"
                    : paymentStatus === "partial"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              />
              <h3 className="font-semibold text-gray-900">Payment Status</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : paymentStatus === "partial"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {paymentStatus === "paid" && "🟢"}
                  {paymentStatus === "partial" && "🟡"}
                  {paymentStatus === "pending" && "🔴"}
                  <span className="ml-1 capitalize">{paymentStatus}</span>
                </span>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount:</span>
                  <span className="font-semibold text-green-600">
                    ₹{paidAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                {balanceAmount > 0 && (
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-600">Balance:</span>
                    <span className="font-bold text-red-600">
                      ₹{balanceAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPaymentClick?.();
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
          >
            Update →
          </button>
        </div>
      </div>

      {/* Delivery Status Card */}
      <div
        className="rounded-lg shadow-sm border-2 border-blue-300 bg-blue-50 p-4 cursor-pointer hover:shadow-md transition-all"
        onClick={onDeliveryClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FiPackage className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Delivery Status</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  📦 <span className="ml-1 capitalize">{deliveryStatus}</span>
                </span>
              </div>

              <div className="text-sm text-gray-600 mt-3">
                {deliveryStatus === "pending" && (
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    <span>Awaiting delivery</span>
                  </div>
                )}
                {deliveryStatus === "partial" && (
                  <div className="flex items-center gap-2">
                    <FiPackage className="w-4 h-4" />
                    <span>Partially received</span>
                  </div>
                )}
                {deliveryStatus === "delivered" && (
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Fully delivered</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeliveryClick?.();
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2"
          >
            Update →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusCards;
