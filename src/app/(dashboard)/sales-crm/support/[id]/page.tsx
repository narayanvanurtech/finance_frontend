'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupportStore } from '@/stores/salesCrmStore/useSupportStore';
import { toast } from 'sonner';

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedTicket, isLoading, error, fetchTicketById } = useSupportStore();
  const ticketId = params.id as string;

  useEffect(() => {
    if (ticketId) {
      if (!selectedTicket || selectedTicket._id !== ticketId) {
        fetchTicketById(ticketId);
      }
    }
  }, [ticketId, fetchTicketById, selectedTicket]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load ticket', {
        description: error,
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading ticket details...</p>
      </div>
    );
  }

  if (!selectedTicket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-4">The support ticket you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/support')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl my-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/support')}
          className="text-indigo-600 hover:underline mb-4"
        >
          &larr; Back to Support
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Details</h1>
        <p className="text-lg text-gray-600 max-w-2xl">View the details of your support ticket below.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{selectedTicket.subject}</h2>
            <p className="text-gray-500 mb-6">Ticket #{selectedTicket._id}</p>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Details</h3>
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-sm text-gray-600">Status: </span>
                  <span className="text-sm text-gray-900 font-medium">{selectedTicket.status}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Priority: </span>
                  <span className="text-sm text-gray-900 font-medium">{selectedTicket.priority}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Category: </span>
                  <span className="text-sm text-gray-900">{selectedTicket.category}</span>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitted By</h3>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedTicket.user?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-600">{selectedTicket.user?.email || 'No email provided'}</p>
                {selectedTicket.user?.mobile && (
                  <p className="text-sm text-gray-600">{selectedTicket.user.mobile}</p>
                )}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Timestamps</h3>
              <div>
                <p className="text-sm text-gray-600">Created: {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                {selectedTicket.updatedAt !== selectedTicket.createdAt && (
                  <p className="text-sm text-gray-600">Last Updated: {new Date(selectedTicket.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
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
