"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Mail, Phone, Bot } from "lucide-react";

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}


interface FormData {
  name: string;
  email: string;
  phone: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  
  // Refs for focus management
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Auto-focus on first input when bot opens
  useEffect(() => {
    if (isOpen && !isSubmitted) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 300); // Small delay to ensure animation is complete
    }
  }, [isOpen, isSubmitted]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear phone error when user starts typing
    if (field === 'phone') {
      setPhoneError("");
    }
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentField: keyof FormData) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Move to next field or submit
      switch (currentField) {
        case 'name':
          emailRef.current?.focus();
          break;
        case 'email':
          phoneRef.current?.focus();
          break;
        case 'phone':
          if (isFormValid) {
            handleSubmit(e as any);
          }
          break;
      }
    } else if (e.key === 'Backspace') {
      // Move to previous field if current field is empty
      const currentValue = formData[currentField];
      if (currentValue === '') {
        e.preventDefault();
        
        switch (currentField) {
          case 'email':
            nameRef.current?.focus();
            break;
          case 'phone':
            emailRef.current?.focus();
            break;
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return;
    }

    // Validate phone number
    if (!validatePhone(formData.phone)) {
      setPhoneError("Please enter a valid 10-digit phone number");
      phoneRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset after showing success message
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "" });
      setIsSubmitted(false);
      setPhoneError("");
      onClose();
    }, 3000);
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.phone.trim() && validatePhone(formData.phone);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0, scale: 0.8, rotateY: -15 }}
          animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ x: "100%", opacity: 0, scale: 0.8, rotateY: -15 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 100,
            mass: 0.8,
            duration: 0.6
          }}
          className="fixed right-6 bottom-6 w-80 h-[420px] rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-md backdrop-saturate-150 bg-white/20 border border-white/90 ring-1 ring-white/80"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                y: [-10, 10, -10],
                x: [-5, 5, -5],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-8 left-8 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-2xl"
            />
            <motion.div
              animate={{
                y: [10, -10, 10],
                x: [5, -5, 5],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute bottom-8 right-8 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-2xl"
            />
          </div>

          {/* Header */}
          <div className="relative z-10 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Chisen Assistant</h3>
                  <p className="text-xs text-gray-300">Let's get you started!</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="relative z-10 flex-1 p-4 h-[320px] overflow-y-auto">
            {!isSubmitted ? (
              <div className="space-y-4">
                {/* Welcome Message */}
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-md px-3 py-2.5 max-w-[85%] shadow-lg border border-white/50">
                    <p className="text-gray-800 text-sm font-medium">
                      Hi! Share your details and we'll get back to you soon!
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Name Input */}
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      ref={nameRef}
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "name")}
                      placeholder="Full name"
                      className="w-full pl-10 pr-3 py-2.5 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 outline-none transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                      required
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      ref={emailRef}
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "email")}
                      placeholder="Email address"
                      className="w-full pl-10 pr-3 py-2.5 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 outline-none transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                      required
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      ref={phoneRef}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "phone")}
                      placeholder="Phone number"
                      className={`w-full pl-10 pr-3 py-2.5 bg-white/90 backdrop-blur-sm border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 outline-none transition-all duration-200 shadow-sm hover:shadow-md text-sm ${
                        phoneError ? 'focus:ring-red-500' : ''
                      }`}
                      required
                    />
                    {phoneError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-1 ml-3"
                      >
                        {phoneError}
                      </motion.p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2.5 rounded-xl hover:from-gray-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-sm font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Started</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Success Message */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-semibold text-gray-800 mb-2"
                  >
                    Thank you!
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-sm font-medium"
                  >
                    We'll contact you soon!
                  </motion.p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBot; 