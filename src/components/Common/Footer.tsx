"use client";
import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { 
  Mail, 
  Twitter, 
  Linkedin, 
  Github,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Star
} from "lucide-react";

const Footer = () => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.8,
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // Define animation variants based on reduced motion preference
  const backgroundAnimations = {
    y: [-5, 5, -5],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  };

  const glowAnimation = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "linear",
    },
  };

  return (
    <footer className="relative bg-gradient-to-b from-white via-[#edeffe] to-[#ACD8FE] will-change-scroll">
      {/* Animated Background Elements - optimized */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={shouldReduceMotion ? undefined : backgroundAnimations}
          className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-2xl will-change-transform"
        />
        <motion.div
          animate={shouldReduceMotion ? undefined : backgroundAnimations}
          style={{ animationDelay: "2s" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-2xl will-change-transform"
        />
        <motion.div
          animate={shouldReduceMotion ? undefined : backgroundAnimations}
          style={{ animationDelay: "4s" }}
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-200 rounded-full opacity-20 blur-2xl will-change-transform"
        />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20"
      >
        {/* Newsletter Section - optimized */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-28"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : glowAnimation}
            className="inline-block mb-8 p-8 rounded-2xl backdrop-blur-sm backdrop-saturate-150 bg-white/30 border border-white/50 shadow-xl will-change-transform"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-r from-[#ACD8FE] to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            
            <h3 className="text-3xl md:text-4xl font-medium text-gray-800 mb-4">
              Ready to close more deals?
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
              Join thousands of sales professionals using CAISHEN to transform their pipeline
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 px-6 py-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gray-800 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-900 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Company Info & Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 bg-gradient-to-r from-[#ACD8FE] to-blue-400 rounded-lg flex items-center justify-center shadow-md"
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
              <span>CAISHEN</span>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The smartest CRM for ambitious sales teams. Built by founders who understand the hustle.
            </p>
            
            <div className="flex items-center space-x-2 text-gray-600 mb-6">
              <Mail className="w-4 h-4" />
              <span>hello@caishen.com</span>
            </div>

            {/* Social Links - matching hero button style */}
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Github, href: "#", label: "GitHub" }
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.95 }}
                  href={social.href}
                  className="w-12 h-12 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 border border-white/60 shadow-sm hover:shadow-md"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Product</span>
            </h4>
            <ul className="space-y-4">
              {[
                "Lead Management",
                "Deal Pipeline", 
                "Analytics",
                "Integrations"
              ].map((link, index) => (
                <motion.li 
                  key={link}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-gray-800 mb-6">Company</h4>
            <ul className="space-y-4">
              {[
                "About Us",
                "Blog",
                "Careers",
                "Contact"
              ].map((link, index) => (
                <motion.li 
                  key={link}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-blue-600 transition-all duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Trust indicators - matching hero testimonial style */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12 mb-12"
        >
          {/* Trust badges */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, rotate: -180 }}
                  whileInView={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </motion.div>
              ))}
            </div>
            <span className="text-gray-600 font-medium">5K+ happy customers</span>
          </div>

          <div className="text-gray-600 font-medium">
            ✨ SOC 2 Certified & GDPR Compliant
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="pt-8 border-t border-white/30 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          <div className="text-gray-600 text-sm">
            © 2025 CAISHEN. Made with ❤️ by ambitious founders.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            {["Privacy", "Terms"].map((link, index) => (
              <motion.a
                key={link}
                whileHover={{ color: "#2563eb" }}
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;