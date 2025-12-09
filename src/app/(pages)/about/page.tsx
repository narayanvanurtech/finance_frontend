"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Users,
  Target,
  Award,
  Zap,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Globe,
  Shield,
} from "lucide-react";

// Custom hook for counting animation
const useCountUp = (end: number, duration: number = 2000, decimals: number = 0) => {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = easeOutQuart * end;
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, end, duration]);

  return { count, ref };
};

const AboutPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 1, 0.4]);

  const prefersReducedMotion = useReducedMotion();

  // Only animate mesh background if not reduced motion
  const meshY = prefersReducedMotion ? 0 : y;
  const meshOpacity = prefersReducedMotion ? 0.2 : opacity;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const values = [
    {
      icon: Sparkles,
      title: "Innovation at Core",
      description:
        "We don't just follow trends--we create them. Every line of code is crafted to push boundaries.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Target,
      title: "Precision Focused",
      description:
        "Laser-focused on solving real problems with elegant solutions that actually work.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: TrendingUp,
      title: "Growth Obsessed",
      description:
        "Your success is our algorithm. We're relentlessly optimizing for your competitive advantage.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Shield,
      title: "Trust by Design",
      description:
        "Enterprise-grade security meets intuitive design. Your data is fortress-protected.",
      gradient: "from-orange-500 to-red-600",
    },
  ];

  const stats = [
    {
      number: 500,
      suffix: "+",
      label: "Sales Champions",
      sublabel: "across 6 continents",
      decimals: 0,
    },
    { 
      number: 2.4, 
      suffix: "Cr+", 
      prefix: "Rs. ",
      label: "Revenue Generated", 
      sublabel: "by our users",
      decimals: 1,
    },
    {
      number: 1.5,
      suffix: "x",
      label: "Faster Closures",
      sublabel: "vs traditional CRMs",
      decimals: 1,
    },
    {
      number: 98,
      suffix: "%",
      label: "Uptime Guaranteed",
      sublabel: "enterprise reliability",
      decimals: 0,
    },
  ];

  // Create count up hooks for each stat
  const statCounts = stats.map(stat => useCountUp(stat.number, 2000, stat.decimals));

  return (
    <div className="relative bg-white overflow-hidden pt-[72px]">
      {/* Dynamic background with mouse tracking */}
      <motion.div
        className="absolute inset-0 opacity-20 will-change-transform"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.10), transparent 60%)`,
        }}
      />

      {/* Optimized Animated mesh background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <motion.div style={{ y: meshY, opacity: meshOpacity, willChange: 'transform, opacity' }} className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-xl opacity-10" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur-xl opacity-10" />
          <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full blur-xl opacity-10" />
        </motion.div>
      </div>

      <div
        className="relative max-w-7xl mx-auto px-6 lg:px-12 py-32"
        ref={containerRef}
      >
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-32"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Globe className="w-4 h-4" />
            <span>Trusted Globally</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-light text-gray-900 leading-[0.9] mb-8"
          >
            Where Sales
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-medium">
              Dreams
            </span>{" "}
            Come True
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
          >
            We're not just another CRM company. We're the architects of sales
            success, crafting experiences that transform how teams connect,
            convert, and conquer markets.
          </motion.p>
        </motion.div>

        {/* Floating Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl transition-all duration-400 will-change-transform"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="relative z-10 text-center" ref={statCounts[index].ref}>
                <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {stat.prefix || ""}{statCounts[index].count.toFixed(stat.decimals)}{stat.suffix}
                </div>
                <div className="text-gray-800 font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">{stat.sublabel}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Story Section with Parallax */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="inline-flex items-center space-x-2 text-blue-600 font-medium mb-6">
              <div className="w-8 h-px bg-blue-600" />
              <span>Our Genesis</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-8 leading-tight">
              Born from
              <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Frustration
              </span>
              <br />
              Forged by
              <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Vision
              </span>
            </h2>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Picture this: It's 2023. Our founders are drowning in
                spreadsheets, juggling five different tools, and watching
                million-dollar deals slip through digital cracks.
              </p>
              <p>
                The "aha" moment? Existing CRMs were built by engineers who'd
                never made a cold call. We decided to flip the script--build
                something by salespeople, for salespeople.
              </p>
              <p>
                Today, we're not just a tool. We're the secret weapon of sales
                teams who refuse to settle for ordinary results.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {[
                "AI that actually understands sales psychology",
                "Interfaces so intuitive, your team will love using them",
                "Insights that turn gut feelings into data-driven wins",
              ].map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                  }
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            {/* 3D Card Effect */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/30 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    2023
                  </div>
                  <div className="text-gray-600 text-lg">The Beginning</div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Team Size</span>
                    <span className="font-semibold">3 {'>'} 47</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Customers</span>
                    <span className="font-semibold">0 {'>'} 5,000+</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Revenue Tracked</span>
                    <span className="font-semibold">$0 {'>'} $247M+</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Grid with Hover Effects */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-32"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              What Makes Us
              <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Different
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These aren't just buzzwords on our wall. They're the DNA of every
              decision we make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                className="group relative bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl transition-all duration-400 overflow-hidden"
              >
                <div className="relative z-10">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${value.gradient} mb-6 transition-transform duration-300`}
                  >
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 rounded-3xl opacity-90" />
          <div className="absolute inset-0 rounded-3xl bg-[url('data:image/svg+xml,%3Csvg width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 40 40\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.03\\'%3E%3Cpath d=\\'M20 20c0 11.046-8.954 20-20 20v20h40V20H20z\\'/%3E%3C/g%3E%3C/svg%3E')]" />

          <div className="relative z-10 px-12 py-16">
            <h3 className="text-4xl md:text-5xl font-light text-white mb-6">
              Your Sales Revolution
              <span className="font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                Starts Now
              </span>
            </h3>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join the elite circle of sales professionals who've discovered
              what it feels like to have technology that truly works for them.
            </p>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(255,255,255,0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 bg-white text-gray-900 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl"
            >
              <span>Experience the Difference</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <div className="mt-8 text-gray-400 text-sm">
              No credit card required * 14-day free trial * Cancel anytime
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
