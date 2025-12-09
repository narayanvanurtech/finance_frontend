"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started",
      monthlyPrice: 15,
      annualPrice: 12,
      features: [
        "Up to 3 team members",
        "1,000 contacts",
        "Basic pipeline management",
        "Email integration",
        "Mobile app access",
        "Standard support"
      ],
      popular: false,
      cta: "Start Free Trial",
      color: "blue"
    },
    {
      name: "Professional",
      description: "Advanced features for growing businesses",
      monthlyPrice: 45,
      annualPrice: 36,
      features: [
        "Up to 15 team members",
        "10,000 contacts",
        "Advanced automation",
        "Custom fields & workflows",
        "API access",
        "Advanced reporting",
        "Priority support",
        "Third-party integrations"
      ],
      popular: true,
      cta: "Start Free Trial",
      color: "purple"
    },
    {
      name: "Enterprise",
      description: "Complete solution for large organizations",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "Unlimited team members",
        "Unlimited contacts",
        "Advanced AI features",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced security",
        "Custom reporting",
        "24/7 phone support",
        "SSO & SAML",
        "Data migration assistance"
      ],
      popular: false,
      cta: "Contact Sales",
      color: "indigo"
    }
  ];

  const enterprises = [
    { name: "Salesforce", logo: "🏢" },
    { name: "HubSpot", logo: "🚀" },
    { name: "Pipedrive", logo: "📊" },
    { name: "Zoho", logo: "⚡" },
    { name: "Monday.com", logo: "📈" }
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 will-change-scroll">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-black  mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your team. All plans include a 14-day free trial with no credit card required.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-8">
            <motion.button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                !isAnnual 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Monthly
            </motion.button>
            <motion.button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium relative ${
                isAnnual 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Annual
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                Save 25%
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className={`relative rounded-3xl p-8 border will-change-transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                plan.popular
                  ? 'bg-white border-blue-200 shadow-lg scale-105'
                  : 'bg-white border-gray-200 hover:border-blue-200'
              }`}
            >
              {plan.popular && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                >
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </motion.div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <motion.div
                    key={isAnnual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-5xl font-bold text-slate-800">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-600 ml-2">/month</span>
                    {isAnnual && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Billed annually (${(isAnnual ? plan.annualPrice : plan.monthlyPrice) * 12})
                      </div>
                    )}
                  </motion.div>
                </div>

                <button className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg hover:-translate-y-0.5'
                }`}>
                  {plan.cta}
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  Everything included:
                </h4>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Section */}
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white mb-16">
          <h3 className="text-3xl font-bold mb-4">Need a Custom Solution?</h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            For organizations with specific requirements, we offer custom enterprise solutions with dedicated support and tailored features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-demo">
            <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              Schedule a Demo
            </button>
            </Link>
            <Link href="/contact">
            <button className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300">
              Contact Sales
            </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}