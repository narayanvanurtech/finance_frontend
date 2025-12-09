"use client";

import React from "react";
import { Person, Edit, Schedule } from "@mui/icons-material";
import { CallUser, CallDeal, CallCounts } from "@/api/callsApi";
import { useCallsStore } from "@/stores/salesCrmStore/useCallsStore";

interface CallsOtherInfoProps {
  user: CallUser;
  deal: CallDeal[];
  counts: CallCounts;
}

const CallsOtherInfo: React.FC<CallsOtherInfoProps> = ({
  user,
  deal,
  counts,
}) => {
  const { isLoading, error } = useCallsStore();

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-5xl mx-auto border border-red-200">
        <div className="text-red-500">Error loading call details: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mx-auto border border-gray-200">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-md font-bold text-gray-800">Other Information</h2>
      </div>

      <div className="space-y-4">
        {/* Call Owner Info */}
        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="bg-blue-100 p-2 rounded-full mt-1">
            <Person className="text-blue-600" fontSize="small" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500">Call Owner</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-2 mt-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ) : user ? (
              <div className="space-y-2 mt-2">
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.email} {user.phone ? `• ${user.phone}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {user.address?.full || "No address"}
                  </p>
                  {/* <p className="text-sm text-gray-500">
                    {user.address.city}, {user.address.country}
                  </p> */}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                No owner information available
              </p>
            )}
          </div>
        </div>

        {/* Creation & Modification Info */}
        {/* <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="bg-purple-100 p-2 rounded-full mt-1">
            <Schedule className="text-purple-600" fontSize="small" />
          </div>
          <div className="flex-1">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="text-sm text-gray-600 mt-1">Not available</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Modified</h3>
                <p className="text-sm text-gray-600 mt-1">Not available</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Deals Info */}
        {deal && deal.length > 0 && (
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-full mt-1">
              <Edit className="text-green-600" fontSize="small" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">
                Associated Deals
              </h3>
              <div className="space-y-3 mt-2">
                {deal.map((deal) => (
                  <div
                    key={deal._id}
                    className="bg-white p-3 rounded border border-gray-100"
                  >
                    <p className="font-medium text-gray-800">{deal.dealName}</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <p className="text-sm text-gray-500">
                        Amount: Rs.{deal.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stage: {deal.stage}
                      </p>
                      <p className="text-sm text-gray-500">
                        Probability: {deal.probability}%
                      </p>
                      <p className="text-sm text-gray-500">
                        Expected: Rs.{deal?.expectedRevenue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Counts */}
        {counts && (
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-full mt-1">
              <Schedule className="text-purple-600" fontSize="small" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">
                Activity Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="bg-white p-3 rounded border border-gray-100 text-center">
                  <p className="text-lg font-semibold text-gray-800">
                    {counts.tasks}
                  </p>
                  <p className="text-sm text-gray-500">Tasks</p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-100 text-center">
                  <p className="text-lg font-semibold text-gray-800">
                    {counts.calls}
                  </p>
                  <p className="text-sm text-gray-500">Calls</p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-100 text-center">
                  <p className="text-lg font-semibold text-gray-800">
                    {counts.meetings}
                  </p>
                  <p className="text-sm text-gray-500">Meetings</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallsOtherInfo;
