"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap, Star, LifeBuoy, Rocket, TrendingUp, Target, Building2, LineChart, Cloud, CircleUser } from "lucide-react";
import type { ReactElement } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  company: string;
  rating: number;
  icon: ReactElement;
  highlight: string;
}

interface FeaturedTestimonial {
  quote: string;
  author: string;
  title: string;
  company: string;
  icon: ReactElement;
  results: string;
  industry: string;
  color: string;
}

export function TestimonialsSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const featuredTestimonials: FeaturedTestimonial[] = [
    {
      quote: "This CRM has revolutionized our sales process. We've seen a 45% increase in conversion rates and our team is 60% more efficient. The AI-powered insights are truly game-changing.",
      author: "Sarah Chen",
      title: "VP of Sales",
      company: "TechFlow Solutions",
      icon: <CircleUser className="w-8 h-8" />,
      results: "+45% conversion rate",
      industry: "Technology",
      color: "from-blue-500 to-indigo-600"
    },
    {
      quote: "The forecasting accuracy and pipeline visibility have transformed our quarterly planning. We're now hitting our revenue targets with 90% accuracy, which is unprecedented for our industry.",
      author: "Marcus Rodriguez",
      title: "Head of Revenue Operations",
      company: "ScaleUp Ventures",
      icon: <CircleUser className="w-8 h-8" />,
      results: "90% forecast accuracy",
      industry: "Consulting",
      color: "from-purple-500 to-pink-600"
    },
    {
      quote: "Managing our growing client base became effortless. The automated workflows and health scoring have helped us achieve a 25% increase in customer retention while reducing churn by 40%.",
      author: "Emily Watson",
      title: "Customer Success Director",
      company: "GrowthCorp",
      icon: <CircleUser className="w-8 h-8" />,
      results: "25% retention increase",
      industry: "SaaS",
      color: "from-emerald-500 to-teal-600"
    }
  ];

  const quickStats = [
    { stat: "200+", label: "Happy Customers", icon: <Users className="w-8 h-8" /> },
    { stat: "99.9%", label: "Uptime Guarantee", icon: <Zap className="w-8 h-8" /> },
    { stat: "4.9/5", label: "Customer Rating", icon: <Star className="w-8 h-8" /> },
    { stat: "24/7", label: "Expert Support", icon: <LifeBuoy className="w-8 h-8" /> }
  ];

  const detailedTestimonials: Testimonial[] = [
    {
      quote: "The reporting dashboard gives us insights we never had before. We can now identify bottlenecks in our sales process and optimize in real-time.",
      author: "David Kim",
      title: "Sales Manager",
      company: "Apex Marketing",
      rating: 5,
      icon: <CircleUser className="w-8 h-8" />,
      highlight: "Real-time insights"
    },
    {
      quote: "Integration with our existing tools was seamless. The API documentation is excellent and the support team helped us every step of the way.",
      author: "Lisa Thompson",
      title: "IT Director",
      company: "MedTech Solutions",
      rating: 5,
      icon: <CircleUser className="w-8 h-8" />,
      highlight: "Seamless integration"
    },
    {
      quote: "As a startup, we needed something that could grow with us. This CRM scales perfectly and the pricing is transparent with no hidden fees.",
      author: "Alex Johnson",
      title: "Co-founder",
      company: "StartupXYZ",
      rating: 5,
      icon: <CircleUser className="w-8 h-8" />,
      highlight: "Perfect scaling"
    },
    {
      quote: "The mobile app is fantastic. Our field sales team can update deals and access customer info on the go. It's increased our responsiveness significantly.",
      author: "Maria Garcia",
      title: "Field Sales Lead",
      company: "Regional Distributors",
      rating: 5,
      icon: <CircleUser className="w-8 h-8" />,
      highlight: "Mobile-first"
    }
  ];

  // Auto-rotate featured testimonials
  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % featuredTestimonials.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovered]);

  return (
    <div className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join thousands of companies that have transformed their business with our intelligent CRM platform.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {quickStats.map((item, idx) => (
            <div
              key={idx}
              className="text-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 will-change-transform"
            >
              <div className="text-blue-600 mb-3 flex justify-center">
                {item.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {item.stat}
              </div>
              <div className="text-slate-600 font-medium">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial Carousel */}
        <div 
          className="mb-20" 
          onMouseEnter={() => setIsHovered(true)} 
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="relative overflow-hidden rounded-3xl bg-blue-50 p-12 md:p-16 shadow-lg border border-blue-100"
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              perspective: 1000
            }}
          >
            <div className="relative z-10">
              <AnimatePresence mode="wait" initial={false}>
                {featuredTestimonials.map((testimonial, idx) => (
                  idx === activeSlide && (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                      className="max-w-4xl mx-auto text-center"
                      style={{
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        perspective: 1000
                      }}
                    >
                      <blockquote className="text-2xl md:text-3xl font-medium text-slate-800 mb-8 leading-relaxed">
                        {testimonial.quote}
                      </blockquote>
                      
                      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="flex items-center space-x-4">
                          <div className="text-blue-600">{testimonial.icon}</div>
                          <div className="text-left">
                            <div className="font-bold text-slate-800">{testimonial.author}</div>
                            <div className="text-slate-600">{testimonial.title}</div>
                            <div className="text-blue-600 font-medium">{testimonial.company}</div>
                          </div>
                        </div>
                        
                        <div 
                          className="bg-white px-6 py-3 rounded-xl shadow text-blue-600"
                          style={{
                            transform: 'translateZ(0)',
                            backfaceVisibility: 'hidden'
                          }}
                        >
                          <div className="text-lg font-bold">{testimonial.results}</div>
                          <div className="text-sm opacity-90">{testimonial.industry}</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center space-x-3 mt-8">
              {featuredTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    idx === activeSlide 
                      ? 'bg-blue-600' 
                      : 'bg-blue-200 hover:bg-blue-300'
                  }`}
                  style={{
                    transform: 'translateZ(0)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {detailedTestimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 will-change-transform"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <div className="text-blue-600">
                  {testimonial.icon}
                </div>
              </div>
              
              <blockquote className="text-slate-700 mb-6 text-lg leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{testimonial.author}</div>
                    <div className="text-slate-600">{testimonial.title}</div>
                    <div className="text-blue-600 font-medium">{testimonial.company}</div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {testimonial.highlight}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}