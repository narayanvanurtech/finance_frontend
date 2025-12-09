"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { contactUs } from "@/api/contactApi";
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Building2,
} from "lucide-react";

const InquiryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Allows formats: +1234567890, 1234567890, 123-456-7890
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      message: "",
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await contactUs({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.phone.trim(),
        message: formData.message.trim(),
      });
      setIsSubmitted(true);
    } catch (error) {
      alert("Failed to submit the form. Please try again.");
      console.error("Contact form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-6 bg-[#78c0ff] rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-8">
            We've received your inquiry and will get back to you within 24 hours
            with a personalized CRM solution.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSubmitted(false)}
            className="bg-[#54adfb] text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
          >
            Submit Another Inquiry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-[#78c0ff]" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 bg-white/50 border ${
                  errors.name ? "border-red-500" : "border-[#ACD8FE]/20"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ACD8FE] focus:border-transparent transition-all duration-200`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 bg-white/50 border ${
                    errors.email ? "border-red-500" : "border-[#ACD8FE]/20"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ACD8FE] focus:border-transparent transition-all duration-200`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 bg-white/50 border ${
                    errors.phone ? "border-red-500" : "border-[#ACD8FE]/20"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ACD8FE] focus:border-transparent transition-all duration-200`}
                  placeholder="+91 1234567890"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Message */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-[#78c0ff]" />
            Additional Information
          </h3>
          <div className="mt-6">
            <label
              htmlFor="message"
              className="block text-gray-700 font-medium mb-2"
            >
              Message <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 bg-white/50 border border-[#ACD8FE]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ACD8FE] focus:border-transparent transition-all duration-200"
              placeholder="How can we help you?"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <motion.div className="text-center pt-4">
          <motion.button
            onClick={handleSubmit}
            disabled={isLoading}
            whileTap={{
              scale: 0.95,
              boxShadow: "0 10px 15px rgba(99, 102, 241, 0.2)",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              backgroundPosition: {
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                type: "spring",
                stiffness: 300,
                damping: 15,
              },
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-300 bg-[length:200%_200%] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto shadow-lg cursor-pointer"
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ) : (
              <motion.div
                initial={{ x: -5 }}
                animate={{ x: 5 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
              </motion.div>
            )}
            {isLoading ? "Processing..." : "Schedule Enterprise Demo"}
          </motion.button>
          <p className="text-gray-600 mt-3 text-sm">
            We'll contact you within 24 hours to schedule your personalized
            enterprise demo
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InquiryForm;
