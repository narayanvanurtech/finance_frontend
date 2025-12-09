"use client";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Accounts Dashboard</h2>
        <p className="text-gray-600">Here you can manage your quotations, invoices, receipts, and more.</p>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-lg font-semibold text-gray-700">Quotations</span>
          <span className="text-3xl font-bold text-blue-600 mt-2">12</span>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-lg font-semibold text-gray-700">Invoices</span>
          <span className="text-3xl font-bold text-green-600 mt-2">8</span>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-lg font-semibold text-gray-700">Receipts</span>
          <span className="text-3xl font-bold text-purple-600 mt-2">5</span>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-lg font-semibold text-gray-700">Sales Orders</span>
          <span className="text-3xl font-bold text-yellow-600 mt-2">3</span>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <ul className="bg-white rounded-lg shadow divide-y">
          <li className="p-4">Invoice #INV-0012 was created.</li>
          <li className="p-4">Quotation #Q-009 was sent to client.</li>
          <li className="p-4">Receipt #R-005 was generated.</li>
          <li className="p-4">Sales Order #SO-003 was approved.</li>
        </ul>
      </section>
    </div>
  );
}
