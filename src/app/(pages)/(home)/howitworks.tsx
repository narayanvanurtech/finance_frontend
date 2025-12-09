"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Database,
  Bell,
  BarChart3,
  Zap,
  Star,
  Globe,
} from "lucide-react";
import Link from "next/link";

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [viewportIntersection, setViewportIntersection] = useState(false);

  const steps = [
    {
      id: 0,
      title: "Capture Leads",
      subtitle: "Multi-Channel Lead Generation",
      description:
        "Automatically capture leads from multiple channels including your website, social media, and marketing campaigns. Our intelligent system organizes and scores leads based on their potential.",
      icon: Users,
      features: [
        "Multi-channel integration",
        "Lead scoring",
        "Automatic data enrichment",
        "Duplicate detection",
      ],
      color: "from-blue-400 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      accentColor: "blue",
      mockData: ["Website Form", "LinkedIn Ad", "Email Campaign", "Referral"],
    },
    {
      id: 1,
      title: "Nurture & Qualify",
      subtitle: "Intelligent Lead Engagement",
      description:
        "Engage with prospects through automated workflows and personalized communication. Track interactions and identify the most promising opportunities.",
      icon: Target,
      features: [
        "Automated workflows",
        "Email sequences",
        "Activity tracking",
        "Lead qualification",
      ],
      color: "from-purple-400 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      accentColor: "purple",
      mockData: [
        "Email Opened",
        "Demo Scheduled",
        "Proposal Sent",
        "Follow-up",
      ],
    },
    {
      id: 2,
      title: "Convert to Deals",
      subtitle: "Pipeline Management",
      description:
        "Transform qualified leads into active deals with our intuitive pipeline management. Track progress, set reminders, and never miss an opportunity.",
      icon: TrendingUp,
      features: [
        "Visual pipeline",
        "Deal stages",
        "Probability tracking",
        "Custom fields",
      ],
      color: "from-green-400 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      accentColor: "green",
      mockData: ["Qualified Lead", "Proposal", "Negotiation", "Closing"],
    },
    {
      id: 3,
      title: "Close & Analyze",
      subtitle: "Data-Driven Insights",
      description:
        "Close deals faster with built-in analytics and reporting. Gain insights into your sales performance and optimize your processes for better results.",
      icon: CheckCircle,
      features: [
        "Real-time analytics",
        "Performance reports",
        "Revenue forecasting",
        "Team insights",
      ],
      color: "from-orange-400 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      accentColor: "orange",
      mockData: [
        "Deal Closed",
        "Revenue +$50K",
        "Report Generated",
        "Next Quarter",
      ],
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !viewportIntersection) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, viewportIntersection, steps.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const stepCardVariants = {
    inactive: {
      scale: 0.9,
      opacity: 0.6,
      y: 20,
      rotateY: -5,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    active: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${((activeStep + 1) / steps.length) * 100}%`,
      transition: { duration: 1, ease: "easeInOut" },
    },
  };

  const floatingElementVariants = {
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const mockDataVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: (
      i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-white-200/20 to-purple-200/20 rounded-full blur-3xl"
          variants={floatingElementVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl"
          variants={floatingElementVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          onViewportEnter={() => setViewportIntersection(true)}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700 mb-6"
          >
            <Zap className="w-4 h-4 mr-2" />
            Intelligent CRM Workflow
          </motion.div>

          <motion.h2
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            How It{" "}
            <span className="relative text-gray-700">
              Works
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience the future of customer relationship management with our
            AI-powered platform. From lead capture to deal closure, every step
            is optimized for maximum conversion.
          </motion.p>
        </motion.div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-16 px-4">
          {/* Step Buttons - Responsive Layout */}
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 mb-4">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                className={`w-full sm:flex-1 sm:max-w-xs p-4 rounded-2xl border-2 transition-all duration-500 relative overflow-hidden ${
                  activeStep === index
                    ? "border-blue-400 bg-white shadow-xl"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => {
                  setActiveStep(index);
                  setIsAutoPlaying(false);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeStep === index && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"
                    layoutId="activeBackground"
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                )}
                <div className="relative z-10 flex items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                      activeStep === index
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    variants={pulseVariants}
                    animate={activeStep === index ? "animate" : "initial"}
                  >
                    <step.icon className="w-5 h-5" />
                  </motion.div>
                  <div className="text-left">
                    <div
                      className={`font-semibold text-sm ${
                        activeStep === index ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.subtitle}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Responsive Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
              variants={progressVariants}
              initial="hidden"
              animate="visible"
            />
          </div>
        </div>

        {/* Enhanced Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <motion.div
                  className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${steps[activeStep].bgColor} rounded-full text-sm font-semibold mb-4`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <span
                    className={`w-2 h-2 bg-${steps[activeStep].accentColor}-500 rounded-full mr-2 animate-pulse`}
                  />
                  Step {activeStep + 1} of {steps.length}
                </motion.div>

                <motion.h3
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {steps[activeStep].title}
                </motion.h3>

                <motion.p
                  className="text-lg text-gray-600 leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {steps[activeStep].description}
                </motion.p>
              </div>

              {/* Enhanced Features List */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {steps[activeStep].features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                    variants={mockDataVariants}
                    initial="hidden"
                    animate="visible"
                    custom={idx}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mr-4 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Enhanced Visual Side */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {/* Main Card */}
              <div
                className={`relative bg-gradient-to-br ${steps[activeStep].bgColor} p-8 rounded-3xl shadow-2xl border border-white/50`}
              >
                {/* Floating Icon */}
                <motion.div
                  className={`hidden md:absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r ${steps[activeStep].color} rounded-2xl flex items-center justify-center shadow-xl`}
                  variants={pulseVariants}
                  animate="animate"
                >
                  {React.createElement(steps[activeStep].icon, {
                    className: "w-8 h-8 text-white",
                  })}
                </motion.div>

                {/* Mock Data Visualization */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-6">
                    Live Activity
                  </h4>

                  {steps[activeStep].mockData.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm"
                      variants={mockDataVariants}
                      initial="hidden"
                      animate="visible"
                      custom={idx}
                    >
                      <div
                        className={`w-3 h-3 bg-gradient-to-r ${steps[activeStep].color} rounded-full mr-4 animate-pulse`}
                      />
                      <span className="text-gray-700 font-medium flex-1">
                        {item}
                      </span>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </motion.div>
                  ))}
                </div>

                {/* Animated Connections */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: -1 }}
                >
                  <motion.path
                    d="M 50 50 Q 150 100 250 150 T 350 200"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                      <stop
                        offset="100%"
                        stopColor="#8B5CF6"
                        stopOpacity="0.6"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-75" />
            <Link href={"/auth/register"}>
              <button className="relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                Start Your Free Trial
                <ArrowRight className="ml-3 w-6 h-6" />
              </button>
            </Link>
          </motion.div>
          <p className="mt-6 text-gray-500">
            No credit card required • 14-day free trial • Setup in 5 minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
