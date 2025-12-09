/* Fixed Profilesheet Component with Proper Scrolling */

import React, { useState } from "react";
import { Avatar } from "@mui/material";
import {
  X,
  LogOut,
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Shield,
  Users,
  HardDrive,
  PhoneCall,
  BarChart3,
  Target,
  FileText,
  Handshake,
  PieChart,
} from "lucide-react";
import {
  useAuthStore,
  User as UserType,
} from "@/stores/salesCrmStore/useAuthStore";
import Link from "next/link";
import ConfirmationDialog from "./ConfirmationDialog";
import { useRouter } from "next/navigation";

interface ProfilesheetProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  onProfile: () => void;
}

const Profilesheet: React.FC<ProfilesheetProps> = ({
  open,
  onClose,
  onLogout,
  onProfile,
}) => {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const user = useAuthStore((state) => state.user) as UserType | null;
  const plan = user?.subscription?.plan;
  const subscription = user?.subscription;
  const router = useRouter();

  const handleSignOutClick = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirmation(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-600 bg-green-50";
      case "inactive":
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "trial":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
      case "overdue":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatStorage = (storage: number) => {
    if (storage >= 1024) return `${(storage / 1024).toFixed(1)} TB`;
    return `${storage} GB`;
  };

  const isTrialActive = () => {
    if (!subscription?.trialEndDate) return false;
    return new Date(subscription.trialEndDate) > new Date();
  };

  const getTrialDaysLeft = () => {
    if (!subscription?.trialEndDate) return 0;
    const trialEnd = new Date(subscription.trialEndDate);
    const today = new Date();
    const diffTime = trialEnd.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[99] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-full md:w-96 bg-white shadow-2xl z-[100] transform transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {/* Header Section - Fixed */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-indigo-950 flex-shrink-0">
          <div className="flex items-center justify-between p-4">
            <div className="text-xl font-semibold text-white">Profile</div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* User Info Section */}
          <div className="flex flex-col items-center py-6 px-4 relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                <Avatar
                  src="/user.jpg"
                  sx={{ width: 80, height: 80 }}
                  alt={user?.name || "User"}
                  className="ring-4 ring-white/30 shadow-2xl"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white shadow-lg ${
                    user?.isActive ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
              </div>
              <div className="mt-3 text-2xl font-bold text-white drop-shadow-sm">
                {user?.name || "User"}
              </div>
              <div className="text-sm text-white/80 mb-4 drop-shadow-sm">
                {user?.email || "No email"}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full max-w-xs">
                <Link href={`/settings/user/${user?._id}`}>
                  <button
                    className=" py-2.5 px-4 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors duration-200 border border-white/20 shadow-lg backdrop-blur-sm flex items-center justify-center gap-2"
                    onClick={onProfile}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                </Link>
                <button
                  className=" py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors duration-200 border border-white/20 shadow-lg backdrop-blur-sm flex items-center justify-center gap-2"
                  onClick={handleSignOutClick}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>

              {/* User Type Badge */}
              <div className="flex items-center gap-2 mt-3">
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg ${
                    user?.role === "ADMIN"
                      ? "bg-white/25 text-white"
                      : "bg-white/20 text-white/90"
                  }`}
                >
                  {user?.role === "ADMIN" ? "Administrator" : "User"}
                </div>
                {plan?.isFree && (
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 text-white/90 border border-white/20 shadow-lg">
                    Free Plan
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-6 space-y-6">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user?.email || "Not provided"}
                    </div>
                    <div className="text-xs text-gray-500">Email Address</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user?.mobile || "Not provided"}
                    </div>
                    <div className="text-xs text-gray-500">Mobile Number</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user?.companyId || "Not assigned"}
                    </div>
                    <div className="text-xs text-gray-500">Company ID</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            {subscription && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  Subscription Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {plan?.name || "Unknown Plan"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {plan?.description || "No description"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {plan?.price ? formatPrice(plan.price) : "Free"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {plan?.billingCycle ||
                          subscription.billingCycle ||
                          "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          subscription.status
                        )}`}
                      >
                        {subscription.status === "active" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {subscription.status || "Unknown"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Payment</div>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          subscription.paymentStatus
                        )}`}
                      >
                        {subscription.paymentStatus === "paid" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {subscription.paymentStatus || "Unknown"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Start Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(subscription.startDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">End Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(subscription.endDate)}
                      </span>
                    </div>
                    {subscription.trialEndDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Trial End</span>
                        <span
                          className={`text-sm font-medium ${
                            isTrialActive() ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          {formatDate(subscription.trialEndDate)}
                          {isTrialActive() && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                              {getTrialDaysLeft()} days left
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Plan Features */}
            {plan?.features && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-indigo-600" />
                  Plan Features
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      plan.features.meeting
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span className="text-sm font-medium">Meetings</span>
                    {plan.features.meeting ? (
                      <CheckCircle className="w-4 h-4 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      plan.features.task
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Tasks</span>
                    {plan.features.task ? (
                      <CheckCircle className="w-4 h-4 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      plan.features.deal
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Handshake className="w-4 h-4" />
                    <span className="text-sm font-medium">Deals</span>
                    {plan.features.deal ? (
                      <CheckCircle className="w-4 h-4 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      plan.features.lead
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">Leads</span>
                    {plan.features.lead ? (
                      <CheckCircle className="w-4 h-4 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      plan.features.reporting
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Reporting</span>
                    {plan.features.reporting ? (
                      <CheckCircle className="w-4 h-4 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      plan.features.analytics
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <PieChart className="w-4 h-4" />
                    <span className="text-sm font-medium">Analytics</span>
                    {plan.features.analytics ? (
                      <CheckCircle className="w-4 h-4 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      plan.features.call
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Calls</span>
                    {plan.features.call ? (
                      <CheckCircle className="w-4 h-4 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Max Users
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {plan.features.maxUsers === -1
                        ? "Unlimited"
                        : plan.features.maxUsers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Storage
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatStorage(plan.features.storage)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user?.isActive
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {user?.isActive ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {user?.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Device Tokens</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.deviceTokens?.length || 0} registered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        show={showLogoutConfirmation}
        title="Sign Out"
        message="Are you sure you want to sign out? You will be logged out of your account."
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        confirmText="Sign Out"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
};

export default Profilesheet;
