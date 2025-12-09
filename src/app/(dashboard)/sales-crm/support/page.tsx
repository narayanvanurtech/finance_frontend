"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSupportStore } from "@/stores/salesCrmStore/useSupportStore";
import SupportTicketForm from "@/components/sales-crm/supportTickerForm";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const { createTicket, isLoading, error, successMessage, resetError, resetSuccessMessage, fetchTicketsByCompany, companyTickets } = useSupportStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    priority: "",
    category: "",
    description: "",
  });

  // Handle success and error messages from store
  useEffect(() => {
    if (successMessage) {
      toast.success("Support ticket created successfully!", {
        description: successMessage,
      });
      resetSuccessMessage();
      
      // Reset form after successful submission
      setFormData({
        subject: "",
        priority: "",
        category: "",
        description: "",
      });

      // Refresh ticket list
      if (user && user.companyId) {
        fetchTicketsByCompany(user.companyId);
      }
    }
  }, [successMessage, resetSuccessMessage, user, fetchTicketsByCompany]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to create ticket", {
        description: error,
      });
      resetError();
    }
  }, [error, resetError]);

  useEffect(() => {
    if (user && user.companyId) {
      fetchTicketsByCompany(user.companyId);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTicket({
        category: formData.category,
        subject: formData.subject,
        priority: formData.priority as 'low' | 'medium' | 'high',
        description: formData.description,
      });
    } catch (error) {
      // Error is already handled by the store and displayed via toast
      console.error('Error creating support ticket:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl my-8">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Support Center</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Get the help you need. Check our quick solutions below or submit a support ticket.
        </p>
      </div>

      {/* Quick Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
          <p className="text-gray-600">New to our CRM? Check out our quick start guides and tutorials.</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h3>
          <p className="text-gray-600">Explore our comprehensive documentation and user guides.</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Tutorials</h3>
          <p className="text-gray-600">Watch step-by-step tutorials on using our CRM features.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Ticket Form */}
        <div className="lg:col-span-2">
          <SupportTicketForm
            isLoading={isLoading}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
          />

          {/* Ticket List Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Your Support Tickets</h2>
            {companyTickets && companyTickets.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Subject</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Priority</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Created At</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">User</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyTickets.map((ticket, idx) => (
                      <tr
                        key={ticket._id}
                        className={`transition-all duration-150 group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 hover:shadow-md cursor-pointer`}
                        onClick={() => router.push(`/sales-crm/support/${ticket._id}`)}
                        title="View ticket details"
                      >
                        <td className="px-5 py-3 font-medium text-gray-900 border-b border-gray-100 whitespace-nowrap">{ticket.subject}</td>
                        <td className="px-5 py-3 border-b border-gray-100 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 border-b border-gray-100 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-700 border-b border-gray-100 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-gray-700 border-b border-gray-100 whitespace-nowrap">{ticket.user?.name || 'N/A'}</td>
                        <td className="px-5 py-3 border-b border-gray-100 whitespace-nowrap text-right">
                          <span className="inline-flex items-center gap-1 text-blue-600 group-hover:underline">
                            View
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 mt-4">No support tickets found for your company.</p>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">How do I reset my password?</h3>
                  <p className="text-sm text-gray-600">Visit the login page and click on "Forgot Password" to receive reset instructions.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Can I change my subscription plan?</h3>
                  <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade your plan anytime from the Settings {'>'} Billing section.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">How do I add team members?</h3>
                  <p className="text-sm text-gray-600">Go to Settings {'>'} Team Members and click on "Invite Member" to add new users.</p>
                </div>
                <div className="mt-6">
                  <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all FAQs →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'Closed':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Resolved':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityBadgeColor(priority: string) {
  switch (priority) {
    case 'Low':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'High':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}