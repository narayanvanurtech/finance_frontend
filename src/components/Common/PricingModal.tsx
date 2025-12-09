import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useUpgradePlanStore } from "@/stores/salesCrmStore/useUpgradePlanStore";
import { Plan, BillingCycle } from "@/stores/salesCrmStore/useplanStore";

interface PricingModalProps {
  open: boolean;
  currentPlan: string; // e.g. 'free', 'pro', 'enterprise'
  clickedPlan: Plan;
  isSubscribed: boolean;
  onUpgrade: (plan: Plan) => void;
  onDowngrade: (plan: Plan) => void;
  onClose: () => void;
}

const getPlanLevel = (planName: string) => {
  // You can adjust this order as per your plan names
  const order = ["free", "starter", "popular", "enterprise"];
  return order.indexOf(planName.toLowerCase());
};

export const PricingModal: React.FC<PricingModalProps> = ({
  open,
  currentPlan,
  clickedPlan,
  isSubscribed,
  onUpgrade,
  onDowngrade,
  onClose,
}) => {
  if (!open) return null;

  const { user, updateUserSubscription } = useAuthStore();
  const { upgradePlan, loading, error, clearError } = useUpgradePlanStore();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [localError, setLocalError] = useState<string | null>(null);
  const currentLevel = getPlanLevel(currentPlan);
  const clickedLevel = getPlanLevel(clickedPlan.name);
  const isSame = currentLevel === clickedLevel;
  const isUpgrade = clickedLevel > currentLevel;
  const isDowngrade = clickedLevel < currentLevel;

  let title = "";
  let description = "";
  let actionLabel = "";
  let onAction: (() => void) | undefined;
  let showAction = true;

  if (isSame) {
    title = `You're already on the ${clickedPlan.name} plan`;
    description =
      "This is your current subscription. Enjoy all the features you have!";
    showAction = false;
  } else if (isUpgrade) {
    title = `Upgrade to ${clickedPlan.name} plan?`;
    description =
      `Get more features and higher limits with the ${clickedPlan.name} plan.`;
    actionLabel = clickedPlan.billingCycle.monthly.price === 0 && clickedPlan.billingCycle.yearly.price === 0 
      ? "Start Free Plan" 
      : "Upgrade Now";
    onAction = async () => {
      if (!user?._id) {
        setLocalError("User not found. Please login again.");
        return;
      }

      clearError();
      setLocalError(null);

      try {
        const response = await upgradePlan({
          userId: user._id,
          planId: clickedPlan._id,
          billingCycle: clickedPlan.billingCycle.monthly.price === 0 && clickedPlan.billingCycle.yearly.price === 0 
            ? "none" as any
            : billingCycle
        });

        if (response.success) {
          const subscription = response.result.subscription;
          
          // Update user subscription in auth store
          updateUserSubscription(subscription);
          
          // Check if it's a free plan
          if (subscription.price === 0 || subscription.billingCycle === "none") {
            // Free plan - redirect to sales CRM home
            router.push("/sales-crm/home");

            onClose();
          } else {
            // Paid plan - redirect to payment URL
            if (subscription.paymentUrl) {
              window.location.href = subscription.paymentUrl;
            } else {
              setLocalError("Payment URL not found. Please try again.");
            }
          }
        } else {
          setLocalError(response.message || "Failed to upgrade plan.");
        }
      } catch (err: any) {
        setLocalError(err?.response?.data?.message || err.message || "Something went wrong.");
      }
    };
  } else if (isDowngrade) {
    title = `Downgrade to ${clickedPlan.name} plan?`;
    description =
      `You will lose some features by switching to the ${clickedPlan.name} plan.`;
    actionLabel = "Downgrade not possible";
    onAction = () => onDowngrade(clickedPlan);
  }




  // Get price for the selected billing cycle
  const price = billingCycle === 'yearly' 
    ? clickedPlan.billingCycle.yearly.price 
    : clickedPlan.billingCycle.monthly.price;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl mb-4 shadow-sm">
                <span className="text-xl font-semibold text-white">
                  {clickedPlan.name.charAt(0)}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
              <p className="text-gray-600 mb-6">{description}</p>
              {/* Billing cycle selection */}
              {(clickedPlan.billingCycle.monthly.price > 0 || clickedPlan.billingCycle.yearly.price > 0) && (
                <div className="mb-4 flex justify-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billingCycle"
                      value="monthly"
                      checked={billingCycle === 'monthly'}
                      onChange={() => setBillingCycle('monthly')}
                      disabled={loading}
                    />
                    <span>Monthly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billingCycle"
                      value="yearly"
                      checked={billingCycle === 'yearly'}
                      onChange={() => setBillingCycle('yearly')}
                      disabled={loading}
                    />
                    <span>Yearly</span>
                  </label>
                </div>
              )}
              <div className="mb-6">
                {/* Price Display */}
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  ₹{price.toLocaleString()} <span className="text-gray-500 text-base">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                
                {billingCycle === 'yearly' && clickedPlan.billingCycle.monthly.price > 0 && (
                  <div className="text-sm text-green-600 mb-4">
                    Save {(((clickedPlan.billingCycle.monthly.price * 12) - clickedPlan.billingCycle.yearly.price) / (clickedPlan.billingCycle.monthly.price * 12) * 100).toFixed(0)}%
                  </div>
                )}

                <div className="text-sm text-gray-500 mb-4">
                  {clickedPlan.description}
                </div>

                {/* Modules List */}
                <div className="text-left">
                  <h4 className="font-medium text-gray-800 mb-2">Included Modules:</h4>
                  <ul className="space-y-2">
                    {clickedPlan.modules.map((module) => (
                      <li key={module._id} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-600">{module.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Features */}
                <div className="text-left mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Plan Features:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-600">Up to {clickedPlan.maxUsers} team members</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-600">Up to {clickedPlan.maxManagers} managers</span>
                    </li>
                  </ul>
                </div>
              </div>
              {(error || localError) && (
                <div className="text-red-500 text-sm mb-2">{error || localError}</div>
              )}
              {showAction && (
                <button
                  className="w-full py-3 px-6 rounded-xl font-medium text-base transition-all duration-300 mt-2 text-white shadow-md hover:shadow-lg bg-gray-800 cursor-pointer hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={onAction}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : actionLabel}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;
