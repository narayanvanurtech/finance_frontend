"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  DollarSign,
  CheckCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axios";

type Invoice = {
  id: string;
  client: string;
  email: string;
  date: string;
  amount: number;
  status: string;
};

const invoices: Invoice[] = Array.from({ length: 21 }, (_, i) => ({
  id: `INV-2026-${(i + 1).toString().padStart(4, "0")}`,
  client: "Narayan Reddy",
  email: "nprocoder@gmail.com",
  date: "Mar 3, 2026",
  amount: 12000,
  status: i % 3 === 0 ? "Paid" : "Draft",
}));

export default function InvoicePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [invoicesData, setInvoicesData] = useState<any[]>([]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;

  const currentInvoices = invoicesData.slice(firstIndex, lastIndex);
const totalPages = Math.ceil(invoicesData.length / itemsPerPage);

  const {clientId} =useParams()
 

 useEffect(() => {
  const fetchInvoiceByClient = async () => {
    try {
      const res = await axiosInstance(
        `/api/v1/finance/sales/invoices/invoiceDet/${clientId}`
      );

      //console.log("Invoice Details BY client", res.data);

      setInvoicesData(res.data?.data || []);
    } catch (err) {
      console.error("Invoice fetch error", err);
    }
  };

  if (clientId) fetchInvoiceByClient();
}, [clientId]);
  // Dashboard Calculations
 const totalInvoices = invoicesData.length;

const totalRevenue = invoicesData.reduce(
  (a, b) => a + (b.grandTotal || 0),
  0
);

const paidAmount = invoicesData.reduce(
  (a, b) => a + (b.totalPaid || 0),
  0
);

const pendingAmount = invoicesData.reduce(
  (a, b) => a + (b.balanceAmount || 0),
  0
);

const overdueInvoices = invoicesData.filter(
  (i) => i.paymentStatus !== "paid"
).length;



  return (
    <div className="p-6 space-y-6">
      {/* DASHBOARD CARDS */}
       <div>
        <h1 className="text-xl font-bold text-gray-900 truncate">Invoice Created By Client ({invoicesData[0]?.clientId?.name})</h1>
       </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card
          title="Total Invoices"
          value={totalInvoices}
          icon={<FileText />}
          bg="bg-blue-100"
        />

        <Card
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<DollarSign />}
          bg="bg-green-100"
        />

        <Card
          title="Paid Amount"
          value={`₹${paidAmount.toLocaleString()}`}
          icon={<CheckCircle />}
          bg="bg-purple-100"
        />

        <Card
          title="Pending Amount"
          value={`₹${pendingAmount.toLocaleString()}`}
          icon={<TrendingUp />}
          bg="bg-orange-100"
        />

        <Card
          title="Overdue Amount"
          value={`₹${pendingAmount.toLocaleString()}`}
          sub={`${overdueInvoices} invoices`}
          icon={<AlertCircle />}
          bg="bg-red-100"
          text="text-red-600"
        />
      </div>

      {/* INVOICE TABLE */}

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
        <thead className="border-b text-gray-500 text-center">
  <tr>
    <th className="py-3">Invoice No</th>
    <th>Date</th>
    <th>Total</th>
    <th>Paid</th>
    <th>Balance</th>
    <th>Payment Status</th>
    <th>Invoice Status</th>
  </tr>
</thead>

       <tbody>
  {currentInvoices.map((invoice: any) => (
    <tr key={invoice._id} className="border-b">
      
      <td className="py-4 font-medium text-center">
        {invoice.invoiceNumber}
      </td>

      <td className="text-center">
        {new Date(invoice.date).toLocaleDateString()}
      </td>

      <td className="text-center">
        ₹{invoice.grandTotal?.toLocaleString()}
      </td>

      <td className="text-center text-green-600">
        ₹{invoice.totalPaid?.toLocaleString()}
      </td>

      <td className="text-center text-orange-600">
        ₹{invoice.balanceAmount?.toLocaleString()}
      </td>

      <td className="text-center">
        <span
          className={`px-3 py-1 rounded text-xs ${
            invoice.paymentStatus === "paid"
              ? "bg-green-100 text-green-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {invoice.paymentStatus}
        </span>
      </td>

      <td className="text-center">
        <span
          className={`px-3 py-1 rounded text-xs ${
            invoice.status === "draft"
              ? "bg-gray-100 text-gray-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {invoice.status}
        </span>
      </td>

    </tr>
  ))}
</tbody>
        </table>

        {/* FOOTER */}

        <div className="flex items-center justify-between mt-6">
          {/* Items per page */}

          <div className="flex items-center gap-2 text-sm">
            <span>Items per page:</span>

            <select
              className="border rounded px-2 py-1"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Showing text */}

          <div className="text-sm text-gray-500">
            Showing {firstIndex + 1} to {Math.min(lastIndex, invoices.length)}{" "}
            of {invoices.length} invoices
          </div>

          {/* Pagination */}

          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="px-3 py-1 border rounded disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* CARD COMPONENT */

function Card({ title, value, icon, bg, text, sub }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className={`text-2xl font-bold ${text || ""}`}>{value}</h2>

        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>

      <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
    </div>
  );
}
