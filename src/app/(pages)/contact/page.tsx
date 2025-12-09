"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import InquiryForm from "./Inquiry";
import { ShieldCheck, Clock, Users, Phone, Mail, MapPin, MessageSquare } from "lucide-react";

const ContactUspage = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-[#f4f8fe] to-white py-32 px-6 overflow-hidde">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-gray-900"
        >
          Let's Connect
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="text-lg text-gray-600 mt-4"
        >
          Have questions about our CRM platform? We're always ready to help you
          scale smarter.
        </motion.p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-center">
        {/* Left: Static Contact Details */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full h-full max-w-xl mx-auto flex justify-center items-center"
        >
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 w-full">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Get in Touch</h3>
                <p className="text-gray-600 text-xs">We'd love to hear from you</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Phone</p>
                    <p className="text-gray-600 text-xs">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Email</p>
                    <p className="text-gray-600 text-xs">hello@yourcrm.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Address</p>
                    <p className="text-gray-600 text-xs">123 Business Ave, Suite 100<br />San Francisco, CA 94105</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Live Chat</p>
                    <p className="text-gray-600 text-xs">Available 24/7</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-center text-gray-600 text-xs">
                  Business Hours: Mon-Fri 9AM-6PM PST
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Contact Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          className="bg-white shadow-2xl rounded-2xl p-10 border border-gray-100 w-full"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Talk to Sales
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Ready to take the next step? Fill out the form and we'll be in
            touch within 1 business day.
          </p>
          <InquiryForm />
        </motion.div>
      </div>

      {/* Trust Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={itemVariants}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24"
      >
        <div className="flex items-start space-x-4">
          <ShieldCheck className="text-blue-500 w-8 h-8" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              SOC 2 Certified
            </h4>
            <p className="text-sm text-gray-600">
              We take your data seriously with enterprise-grade security.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <Clock className="text-blue-500 w-8 h-8" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              99.9% Uptime SLA
            </h4>
            <p className="text-sm text-gray-600">
              Reliable infrastructure with minimal downtime.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <Users className="text-blue-500 w-8 h-8" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Dedicated Success Team
            </h4>
            <p className="text-sm text-gray-600">
              Our experts are available to support your success.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUspage;