"use client"
import React from "react";
import { Clock, BarChart3, Users, ArrowRight } from "lucide-react";

const KeyBenefits = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Save Time with Automation",
      description: "Automate repetitive tasks like follow-ups, lead scoring, and pipeline updates. Focus on what matters most — closing deals.",
      stats: "3x faster workflows",
      gradient: "from-blue-500 to-cyan-400",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: BarChart3,
      title: "Sell Smarter with Analytics",
      description: "Get real-time insights into your sales performance, conversion rates, and revenue forecasts to make data-driven decisions.",
      stats: "40% better conversion",
      gradient: "from-purple-500 to-pink-400",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: Users,
      title: "Stay Organized Across Teams",
      description: "Keep your entire sales team aligned with shared pipelines, unified customer data, and seamless collaboration tools.",
      stats: "100% team visibility",
      gradient: "from-green-500 to-teal-400",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  return (
    <section className="relative py-20 lg:py-32 bg-white">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 lg:mb-24">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium text-gray-800 leading-tight mb-6">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chisen
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your sales process with tools designed for results, not complexity.
            Experience the difference value-driven features make.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group relative"
            >
              <div className="relative p-8 lg:p-10 rounded-3xl bg-white border border-gray-100 shadow-md transition-shadow duration-200 hover:shadow-lg">
                <div className={`inline-flex items-center justify-center md:w-16 md:h-16 ${benefit.bgColor} rounded-2xl mb-6`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.iconColor}`} />
                </div>

                <div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {benefit.description}
                  </p>

                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-full text-sm font-medium text-gray-700">
                    <span>{benefit.stats}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 lg:mt-24">
          <button className="inline-flex items-center justify-center space-x-4 px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl transition-shadow duration-200 hover:shadow-lg">
            <span className="text-lg font-medium">Ready to transform your sales?</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default KeyBenefits;