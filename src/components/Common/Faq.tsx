"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Users, BarChart3, Shield, Zap } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = useCallback((index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  }, [openIndex]);

  const faqData = useMemo(() => [
    {
      icon: <Users className="w-5 h-5" />,
      question: "How does Chisen help manage my sales team?",
      answer: "Chisen provides comprehensive team management tools including lead assignment, performance tracking, commission calculations, and real-time collaboration features. You can monitor individual and team performance, set targets, and automate workflow distributions to maximize your team's efficiency."
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      question: "What kind of analytics and reporting does Chisen offer?",
      answer: "Our CRM includes advanced analytics with customizable dashboards, sales forecasting, conversion rate tracking, and pipeline analysis. You get real-time insights into your sales performance, customer behavior patterns, and revenue projections to make data-driven decisions."
    },
    {
      icon: <Zap className="w-5 h-5" />,
      question: "Can I integrate Chisen with my existing tools?",
      answer: "Yes! Chisen seamlessly integrates with 200+ popular business tools including Gmail, Outlook, Slack, Zapier, QuickBooks, and major marketing platforms. Our API also allows for custom integrations to fit your unique workflow requirements."
    },
    {
      icon: <Shield className="w-5 h-5" />,
      question: "How secure is my customer data in Chisen?",
      answer: "Security is our top priority. Chisen uses enterprise-grade encryption, complies with GDPR and SOC 2 standards, and includes features like two-factor authentication, role-based access controls, and regular security audits to protect your sensitive customer data."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Absolutely! Chisen offers native mobile apps for iOS and Android, allowing you to manage leads, update deals, and communicate with prospects on the go. The mobile app syncs seamlessly with your desktop version for consistent access anywhere."
    },
    {
      question: "What support and training do you provide?",
      answer: "We provide 24/7 customer support, comprehensive onboarding assistance, video tutorials, and live training sessions. Our dedicated customer success team helps you get up and running quickly and ensures you're maximizing Chisen's potential for your business."
    },
    {
      question: "Can I customize Chisen for my specific industry?",
      answer: "Yes! Chisen is highly customizable with industry-specific templates for real estate, insurance, SaaS, manufacturing, and more. You can create custom fields, workflows, and automation rules tailored to your unique sales processes and industry requirements."
    },
    {
      question: "What's included in the free trial?",
      answer: "Our 14-day free trial includes full access to all premium features, unlimited contacts, email integration, reporting tools, and mobile apps. No credit card required, and you'll have dedicated onboarding support to help you explore all features during your trial period."
    }
  ], []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // ✅ Moved useEffect inside the component
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(-8px); }
        50% { transform: translateY(8px); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const floatingStyle = {
    animation: "float 8s ease-in-out infinite",
  };

  return (
    <div className="relative min-h-screen py-20 overflow-hidden will-change-transform">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          style={floatingStyle}
          className="absolute top-10 right-20 w-40 h-40 bg-blue-200 rounded-full opacity-10 blur-3xl transform-gpu"
        />
        <div
          style={{ ...floatingStyle, animationDelay: "3s" }}
          className="absolute bottom-40 left-10 w-60 h-60 bg-indigo-200 rounded-full opacity-10 blur-3xl transform-gpu"
        />
        <div
          style={{ ...floatingStyle, animationDelay: "6s" }}
          className="absolute top-1/3 right-1/4 w-32 h-32 bg-purple-200 rounded-full opacity-10 blur-3xl transform-gpu"
        />
      </div>

      {/* FAQ Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg"
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-800 mb-6"
          >
            Frequently Asked
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Questions
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to know about Chisen CRM. Can't find the answer you're looking for? 
            <span className="text-blue-600 font-medium"> Contact our support team.</span>
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-4"
        >
          {faqData.map((item, index) => (
            <motion.div key={index} variants={itemVariants} className="group" layout="position">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 will-change-transform"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 md:px-8 py-6 text-left focus:outline-none rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {item.icon && (
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-300">
                          {item.icon}
                        </div>
                      )}
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800 pr-4">
                        {item.question}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" />
                    </motion.div>
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0, transformOrigin: "top" }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden transform-gpu"
                    >
                      <div className="px-6 md:px-8 pb-6">
                        <div className={`pl-6 ${item.icon ? 'ml-14' : 'ml-0'}`}>
                          <motion.p
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-600 leading-relaxed text-base md:text-lg"
                          >
                            {item.answer}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(FAQ);
