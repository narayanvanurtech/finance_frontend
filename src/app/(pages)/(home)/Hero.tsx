"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
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

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: 1.2,
        ease: "easeOut",
      },
    },
  };

  const testimonialUsers = [
    { name: "David Lee", bg: "bg-red-400" },
    { name: "Priya Mehta", bg: "bg-indigo-400" },
    { name: "Carlos Ruiz", bg: "bg-yellow-500" },
    { name: "Hannah Kim", bg: "bg-teal-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ACD8FE]  via-[#edeffe] to-white relative overflow-hidden pt-[72px]">
      {/* Bottom background image (non-overlapping) */}
      <div className="absolute bottom-0 w-full pointer-events-none z-[1] h-[40vh]">
        <div
          className="absolute inset-0 bg-[url('/background.svg')] bg-no-repeat bg-left-bottom bg-cover w-full h-full"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0))",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0))",
          }}
        />
      </div>

      {/* Top-left grid background */}
      <div className="absolute right-0 w-full h-[60%] pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-[url('/Herogrid.png')] bg-no-repeat bg-right-top opacity-40"
          style={{
            WebkitMaskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0))",
            maskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0))",
          }}
        />
      </div>
      {/* Animated background elements */}
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

      {/* Navigation */}

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 text-center mt-16 lg:mt-24"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-medium text-gray-800 leading-tight mb-8"
        >
          Close More Deals, Effortlessly
          <br />
          <span className="">With Chisen's Sales CRM</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          From capturing leads to sealing deals — manage your entire sales
          pipeline with clarity. Chisen helps teams prioritize prospects, track
          interactions, and drive conversions faster.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
        >
          <Link href="/book-demo">
            <button className="bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-medium cursor-pointer hover:bg-gray-900">
              Book Live Demo
            </button>
          </Link>
          <Link href={'/contact'}>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg cursor-pointer font-medium transition-colors duration-200 hover:border-gray-400">
              Contact Us
            </button>
          </Link>
        </motion.div>

        {/* Testimonial Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-row items-center justify-center space-x-8 mb-16"
        >
          {/* Left: Avatars (Vertical) */}
          <div className="flex items-center -space-x-2 justify-center">
            {testimonialUsers.map((user, index) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                className={`w-12 h-12 ${user.bg} rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-semibold text-sm`}
              >
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </motion.div>
            ))}
          </div>

          {/* Right: Stars + Text (Vertical) */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 + i * 0.1 }}
                >
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </motion.div>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="text-gray-600 font-medium"
            >
              Trusted by 5K+ sales professionals worldwide
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={statsVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto mt-8 max-w-xl px-6 py-6 rounded-2xl 
             backdrop-blur-md backdrop-saturate-150 
             bg-white/20 border-5 border-white/90 
             shadow-xl ring-1 ring-white/80"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/20 text-center">
            {[
              { number: "12K+", label: "Leads Captured" },
              { number: "8.5K", label: "Deals Closed" },
              { number: "98%", label: "Faster Follow-ups" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.2 }}
                whileHover={{ scale: 1.03 }}
                className="py-4 px-2"
              >
                <div className="text-3xl font-bold text-black drop-shadow-sm">
                  {stat.number}
                </div>
                <div className="text-black/80 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      {/* White gradient fade into next section */}
      <div className="absolute bottom-0 w-full h-32 pointer-events-none z-[2]">
        <div className="w-full h-full bg-gradient-to-b from-transparent to-white" />
      </div>
      {/* <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}
    </div>
  );
};

export default Hero;
