"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Trophy, BadgeCheck, Building2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { Plan } from "@/stores/salesCrmStore/useplanStore";
import { usePlanStore } from '@/stores/salesCrmStore/useplanStore';
import { CustomPlanModal } from "@/components/Common/CustomPlanModal";
import PricingModal from "@/components/Common/PricingModal";

export default function PremiumCRMPricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  // Zustand plan store
  const { plans, loading, error, fetchPlans } = usePlanStore();

  // Get current plan from user data (adjust based on your user structure)
  const currentPlanId = user?.subscription?.plan?._id || "";
  const currentPlan = currentPlanId ? plans.find((plan) => plan._id === currentPlanId)?.name || "" : "";
  const isSubscribed = Boolean(currentPlanId);
  //console.log(user);

  useEffect(() => {
    // Fetch plans from Zustand store
    fetchPlans();
    // Trigger the sliding animation after component mounts
    const timer = setTimeout(() => {
      setCardsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlanClick = (plan: Plan) => {
    if (!user) {
      // If not logged in, redirect to registration
      router.push(`/auth/register?planid=${plan._id}`);
      return;
    }

    // If logged in but not ADMIN, show error and do not proceed
    if (user.role !== "admin") {
      alert("Only admin users can purchase or upgrade plans."); 
      return;
    }

    // If logged in and ADMIN, show modal
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handleUpgrade = (plan: Plan) => {
    // This function is called from the modal when upgrade is successful
    // The actual upgrade logic is handled in the PricingModal component
    // We just close the modal here as the subscription update is handled in useEffect
    //console.log('Plan upgraded successfully to:', plan);
    setModalOpen(false);
  };

  const handleDowngrade = (plan: Plan) => {
    // Handle downgrade logic here
    //console.log('Downgrading to:', plan);
    // You can add your downgrade API call here
    setModalOpen(false);
  };

  const handleEnterpriseClick = () => {
    setCustomModalOpen(true);
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Animation variants for the sliding cards
  const cardVariants = {
    initial: (index: number) => ({
      x: index === 0 ? 50 : index === 2 ? -50 : 0,
      y: index === 1 ? 40 : 0, // subtle upward float
      opacity: 0,
      scale: 0.95,
      zIndex: index === 1 ? 30 : 20,
    }),

    animate: (index: number) => ({
      x: 0,
      y: 0,
      opacity: 1,
      scale: index === 1 ? 1.04 : 1,
      zIndex: index === 1 ? 30 : 20,
      transition: {
        duration: 0.8,
        delay: index === 1 ? 0 : 1.5, // stagger side cards slightly
        ease: [0.25, 0.8, 0.25, 1], // smooth bezier ease
        type: "spring",
        stiffness: 80,
        damping: 18,
      },
    }),
  };

  const displayedPlans = plans
    .filter(plan => plan.isActive)
    .sort((a, b) => {
      // Put free plan first, then popular plan
      if (a.name.toLowerCase() === 'free') return -1;
      if (b.name.toLowerCase() === 'free') return 1;
      if (a.name.toLowerCase() === 'popular') return -1;
      if (b.name.toLowerCase() === 'popular') return 1;
      return 0;
    });


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ACD8FE] via-[#edeffe] to-white relative overflow-hidden pt-[72px]">
      {/* Animated background elements matching hero */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "4s" }}
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-200 rounded-full opacity-20 blur-3xl"
        />
      </div>

      <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-full px-6 py-2 mb-6 shadow-sm">
            <Rocket className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 text-sm font-medium">
              Pricing that scales with your success
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-gray-800 leading-tight mb-6">
            Revenue-Driven
            <br />
            <span className="text-gray-800">Pricing Plans</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Choose the plan that matches your revenue goals. Every tier is
            designed to multiply your sales performance and drive real results.
          </p>

          {/* Billing Toggle */}
          <div className="relative inline-flex p-1 bg-white/20 border border-white/20 rounded-full shadow-inner">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`absolute top-1 left-1 w-1/2 h-[calc(100%-0.5rem)] rounded-full bg-black z-0 ${
                isAnnual ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <button
              className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 cursor-pointer ${
                !isAnnual ? "text-white" : "text-black"
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 cursor-pointer ${
                isAnnual ? "text-white" : "text-black"
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Annually
            </button>
          </div>
        </motion.div>

        {/* Main Paid Plans as 3 Cards + Custom Plan */}
        <div className="relative mb-20">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {(() => {
              return displayedPlans.map((plan: Plan, index: number) => {
                return (
                  <motion.div
                    key={plan._id}
                    custom={index}
                    initial="initial"
                    animate={cardsVisible ? "animate" : "initial"}
                    variants={cardVariants}
                    className={`relative ${index === 1 ? "lg:z-30" : "lg:z-20"} h-full flex flex-col`}
                  >
                    <div
                      className={`relative bg-white/40 backdrop-blur-md backdrop-saturate-150 border ${
                        index === 1
                          ? "border-white/60 shadow-xl ring-1 ring-white/50"
                          : "border-white/40 shadow-lg"
                      } rounded-2xl p-8 transition-all duration-500 hover:shadow-xl h-full flex flex-col`}
                    >
                      {index === 1 && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                          <div className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 justify-center">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            Most Popular
                          </div>
                        </div>
                      )}
                      
                      {/* Current Plan Badge */}
                      {user && currentPlanId === plan._id && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          Current Plan
                        </div>
                      )}

                      {/* STATIC HEADER */}
                      <div className="text-center mb-8">
                        {/* Icon selection based on plan name */}
                        {(() => {
                          let IconComponent = BadgeCheck;
                          if (plan.name.toLowerCase() === 'popular') IconComponent = Rocket;
                          else if (plan.name.toLowerCase() === 'enterprise') IconComponent = Building2;
                          return (
                            <div
                              className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl mb-4 shadow-sm`}
                            >
                              <IconComponent className="w-7 h-7 text-white" />
                            </div>
                          );
                        })()}
                        <h3 className="text-2xl font-medium text-gray-800 mb-2">
                          {plan.name}
                        </h3>
                        <p className={`text-slate-700 font-medium mb-2`}>
                          {plan.description}
                        </p>
                      </div>
                      
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-semibold text-gray-800">
                            ₹{isAnnual ? plan.billingCycle.yearly.price.toLocaleString() : plan.billingCycle.monthly.price.toLocaleString()}
                          </span>
                          <span className="text-gray-600">
                            /{isAnnual ? 'year' : 'month'}
                          </span>
                        </div>
                        {isAnnual && plan.billingCycle.monthly.price > 0 && (
                          <div className="text-sm text-green-600 mt-2">
                            Save {(((plan.billingCycle.monthly.price * 12) - plan.billingCycle.yearly.price) / (plan.billingCycle.monthly.price * 12) * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4 flex-grow">
                        <div className="space-y-3">
                          <div className="font-medium text-gray-800">Included Modules:</div>
                          {plan.modules.map((module) => (
                            <div key={module._id} className="flex items-center gap-2">
                              <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-600">{module.name} <span className="text-gray-500 text-xs">{module.price}/-</span></span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-3 mt-6">
                          <div className="font-medium text-gray-800">Plan Features:</div>
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-600">Up to {plan.maxUsers} team members</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-600">Up to {plan.maxManagers} managers</span>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePlanClick(plan)}
                        disabled={currentPlanId === plan._id}
                        className={`w-full py-4 px-6 rounded-xl font-medium text-base transition-all duration-300 mt-6 ${
                          currentPlanId === plan._id
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : index === 1
                            ? 'bg-gray-800 text-white hover:bg-gray-900 shadow-md hover:shadow-lg cursor-pointer'
                            : 'bg-white/50 text-gray-800 hover:bg-white/70 shadow hover:shadow-md cursor-pointer'
                        }`}
                      >
                        {currentPlanId === plan._id ? 'Current Plan' : 'Choose Plan'}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              });
            })()}
            
            {/* Custom Plan Card */}
            <motion.div
              custom={3}
              initial="initial"
              animate={cardsVisible ? "animate" : "initial"}
              variants={cardVariants}
              className="relative lg:z-20 h-full flex flex-col"
            >
              <div className="relative bg-white/40 backdrop-blur-md backdrop-saturate-150 border border-white/40 shadow-lg rounded-2xl p-8 transition-all duration-500 hover:shadow-xl h-full flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl mb-4 shadow-sm">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-800 mb-2">
                    Custom Plan
                  </h3>
                  <p className="text-slate-700 font-medium mb-2">
                    Tailored solutions for your specific business needs
                  </p>
                </div>
                
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-semibold text-gray-800">
                      Custom Pricing
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    Get a personalized quote
                  </div>
                </div>
                
                <div className="space-y-4 flex-grow">
                  <div className="space-y-3">
                    <div className="font-medium text-gray-800">Custom Benefits:</div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">Unlimited users & managers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">All available modules included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">Custom feature development</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">Dedicated support team</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">White-labeled solutions</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnterpriseClick}
                  className="w-full py-4 px-6 rounded-xl font-medium text-base transition-all duration-300 mt-6 cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                >
                  Get Custom Quote
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Custom Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="bg-gray-800 rounded-2xl p-12 text-center shadow-xl"
        >
          <h3 className="text-3xl font-medium text-white mb-4">
            Need Enterprise-Level Solutions?
          </h3>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Custom solutions for organizations ready to completely transform
            their sales operations and achieve unprecedented growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-gray-900 px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push('/book-demo')}
            >
              Schedule Demo Call
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-white/20 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
              onClick={handleEnterpriseClick}
            >
              Get Custom Quote
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Pricing Modal */}
      {selectedPlan && (
        <PricingModal
          open={modalOpen}
          currentPlan={currentPlan}
          clickedPlan={selectedPlan}
          isSubscribed={isSubscribed}
          onUpgrade={handleUpgrade}
          onDowngrade={handleDowngrade}
          onClose={() => {
            setModalOpen(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {customModalOpen && (
        <CustomPlanModal open={customModalOpen} onClose={() => setCustomModalOpen(false)} />
      )}
    </div>
  );
}