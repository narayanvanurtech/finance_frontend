"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { format, parse } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookDemo, BookDemoRequest } from "@/api/demoApi";

const BookingForm = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setCalendarOpen(false);
      }
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target as Node)
      ) {
        setTimePickerOpen(false);
      }
    };

    if (calendarOpen || timePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarOpen, timePickerOpen]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (formError) {
      setFormError("");
    }
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (formError) {
      setFormError("");
    }
    
    if (selectedDate) {
      const formattedDate = format(selectedDate, "dd/MM/yyyy");
      setFormData((prev) => ({
        ...prev,
        date: formattedDate,
      }));
      setDate(selectedDate);
      setTimeout(() => {
        setCalendarOpen(false);
      }, 0);
    }
  };
  const handleTimeSelect = (timeValue: string) => {
    if (formError) {
      setFormError("");
    }
    
    setFormData({
      ...formData,
      time: timeValue,
    });
    setTimePickerOpen(false);
  };


  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError("Please enter your name");
      return false;
    }
    if (!formData.email.trim()) {
      setFormError("Please enter your email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      setFormError("Please enter your phone number");
      return false;
    }
    if (!formData.date) {
      setFormError("Please select a date");
      return false;
    }
    if (!formData.time) {
      setFormError("Please select a time");
      return false;
    }
    return true;
  };



  const formatDateTimeForAPI = (dateStr: string, timeStr: string): string => {
    try {
      // Parse the date from dd/MM/yyyy format
      const [day, month, year] = dateStr.split('/');
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      
      // Parse the time (format: "h:mm a" like "9:30 AM")
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Set the time on the parsed date
      parsedDate.setHours(hours, minutes, 0, 0);
      
      // Format to ISO string (UTC)
      return parsedDate.toISOString();
    } catch (error) {
      console.error('Error formatting date:', error);
      throw new Error('Invalid date or time format');
    }
  };



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFormError("");
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format the combined date and time for the API
      const scheduledAt = formatDateTimeForAPI(formData.date, formData.time);
      
      // Prepare the API request data
      const requestData: BookDemoRequest = {
        name: formData.name,
        email: formData.email,
        mobile: formData.phone,
        scheduledAt: scheduledAt
      };

      console.log('Submitting:', requestData); // For debugging

      
      const response = await bookDemo(requestData);
      
      if (response) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error booking demo:', error);
      setFormError("Failed to book demo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeOptions = Array.from({ length: 19 }, (_, i) => {
    const hour = Math.floor((i + 18) / 2);
    const minute = (i + 18) % 2 === 0 ? "00" : "30";
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return {
      value: `${displayHour}:${minute} ${period}`,
      label: `${displayHour}:${minute} ${period}`
    };
  });

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
      y: [-15, 15, -15],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#ACD8FE] via-[#edeffe] to-white relative overflow-hidden flex items-center justify-center">
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
            style={{ animationDelay: "3s" }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center max-w-md mx-auto px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Demo Booked Successfully!
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for your interest in Chisen CRM. We've received your
            booking request and will send you a confirmation email shortly with
            the meeting details.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-900 transition-all duration-200 shadow-lg cursor-pointer"
          >
            Back to Homepage
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ACD8FE] via-[#edeffe] to-white relative overflow-hidden pt-24">
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
          style={{ animationDelay: "3s" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "6s" }}
          className="absolute top-1/2 left-1/4 w-48 h-48 bg-indigo-200 rounded-full opacity-20 blur-3xl"
        />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="relative z-10 max-w-4xl mx-auto px-6 py-12"
      >
        <div className="text-center mb-12">
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-medium text-gray-800 mb-4"
          >
            Book Your Live Demo
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Schedule a personalized demo of Chisen CRM and discover how we can
            transform your sales process
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Benefits */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="relative z-10 p-8 rounded-2xl backdrop-blur-md backdrop-saturate-150 bg-white/20 border border-white/60 shadow-xl">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                What You'll Get:
              </h3>
              <div className="space-y-4">
                {[
                  "30-minute personalized walkthrough",
                  "See how Chisen fits your sales process",
                  "Live Q&A with our product experts",
                  "Custom pricing based on your needs",
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              variants={itemVariants}
              className="relative z-10 p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-white/60"
            >
              <p className="text-gray-600 italic">
                "The demo was incredibly insightful. Within 30 minutes, I could
                see exactly how Chisen would streamline our sales workflow."
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center text-white font-semibold">
                  SM
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    Sarah Mitchell
                  </div>
                  <div className="text-sm text-gray-600">Sales Director</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            variants={itemVariants}
            className="relative z-10 p-8 rounded-2xl backdrop-blur-md backdrop-saturate-150 bg-white/20 border border-white/60 shadow-xl"
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#ACD8FE] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#ACD8FE] focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#ACD8FE] focus:border-transparent transition-all duration-200"
                  placeholder="+91 - 123-456-7890"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Preferred Date
                </label>
                <div className="relative" ref={calendarRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-between transition-colors duration-200",
                      calendarOpen ? "border-blue-500" : "hover:border-gray-300"
                    )}
                    onClick={() => setCalendarOpen(!calendarOpen)}
                  >
                    {formData.date || "Pick a date"}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        calendarOpen ? "transform rotate-180" : ""
                      )}
                    />
                  </Button>
                  <AnimatePresence>
                    {calendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                      >
                        <DayPicker
                          mode="single"
                          defaultMonth={new Date()}
                          selected={date}
                          onSelect={handleDateSelect}
                          className="p-3"
                          disabled={[{ before: new Date() }]}
                          modifiers={{
                            booked: [], // Add any booked dates here
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-3 text-sm">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Preferred Time
                </label>
                <div className="relative" ref={timePickerRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-between transition-colors duration-200",
                      timePickerOpen
                        ? "border-blue-500"
                        : "hover:border-gray-300"
                    )}
                    onClick={() => setTimePickerOpen(!timePickerOpen)}
                  >
                    {formData.time || "Select time"}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        timePickerOpen ? "transform rotate-180" : ""
                      )}
                    />
                  </Button>
                  <AnimatePresence>
                    {timePickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200"
                      >
                        <div
                          className="p-2 max-h-[200px] overflow-y-auto custom-scrollbar"
                          onWheel={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {timeOptions.map((time) => (
                            <button
                              key={time.value}
                              type="button"
                              onClick={() => handleTimeSelect(time.value)}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200",
                                formData.time === time.value
                                  ? "bg-blue-500 text-white"
                                  : "hover:bg-gray-100 text-gray-700"
                              )}
                            >
                              {time.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                whileHover={{
                  scale: isSubmitting ? 1 : 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg",
                  isSubmitting 
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-900 text-white"
                )}
              >
                {isSubmitting ? "Booking..." : "Book Your Demo"}
              </motion.button>

              {formError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  {formError}
                </motion.div>
              )}
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              No commitment required • Free consultation • 30-day trial
              available
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingForm;