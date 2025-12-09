"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { FiX } from "react-icons/fi";

interface ConvertToInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    invoiceType: string;
  }) => void;
  loading: boolean;
  performaInvoiceNumber: string;
}

export default function ConvertToInvoiceDialog({
  open,
  onClose,
  onConfirm,
  loading,
  performaInvoiceNumber,
}: ConvertToInvoiceDialogProps) {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ), // 30 days from now
    invoiceType: "demo",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert dates to ISO format
    const data = {
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: new Date(formData.invoiceDate).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      invoiceType: formData.invoiceType,
    };

    onConfirm(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Convert to Invoice
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Performa Invoice: {performaInvoiceNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Invoice Number */}
          <div>
            <label
              htmlFor="invoiceNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Invoice Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              required
              placeholder="e.g., INV-2025-0001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Invoice Date */}
          <div>
            <label
              htmlFor="invoiceDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="invoiceDate"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              min={formData.invoiceDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Invoice Type */}
          <div>
            <label
              htmlFor="invoiceType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Invoice Type <span className="text-red-500">*</span>
            </label>
            <select
              id="invoiceType"
              name="invoiceType"
              value={formData.invoiceType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="demo">Demo</option>
              <option value="standard">Standard</option>
              <option value="recurring">Recurring</option>
              <option value="final">Final</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Converting...
                </>
              ) : (
                "Convert to Invoice"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
