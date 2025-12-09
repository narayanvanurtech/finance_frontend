import { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, X, CheckCircle, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import "react-day-picker/dist/style.css";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Generate time options for the picker
  const timeOptions = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor((i + 18) / 2);
    const minute = (i + 18) % 2 === 0 ? "00" : "30";
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return {
      value: `${displayHour}:${minute} ${period}`,
      label: `${displayHour}:${minute} ${period}`
    };
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setTimePickerOpen(false);
      }
    };

    if (calendarOpen || timePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [calendarOpen, timePickerOpen]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };
  console.log(formData);

  const closeModal = () => {
    onClose();
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: ""
      });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl rounded-2xl bg-white shadow-xl my-4 md:my-8"
          >
            <div className="p-8">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>

              {!isSubmitted ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-medium text-gray-800 mb-4">
                      Book Your Live Demo
                    </h2>
                    <p className="text-gray-600">
                      Schedule a personalized demo and see how Chisen CRM can transform your sales process
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Benefits */}
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-gray-50">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">What you'll get:</h3>
                        <div className="space-y-3">
                          {[
                            "30-minute personalized walkthrough",
                            "See how Chisen fits your workflow",
                            "Live Q&A with product experts",
                            "Custom pricing for your team"
                          ].map((benefit, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2 text-sm">
                            <User className="w-4 h-4 inline mr-2" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your name"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-2 text-sm">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+91</div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="98765 43210"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">
                          <CalendarIcon className="w-4 h-4 inline mr-2" />
                          Preferred Date
                        </label>
                        <div className="relative" ref={calendarRef}>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between transition-colors duration-200",
                              calendarOpen ? "border-blue-500" : "hover:border-gray-300"
                            )}
                            onClick={() => setCalendarOpen(!calendarOpen)}
                          >
                            {formData.date ? format(new Date(formData.date), "PPP") : "Pick a date"}
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              calendarOpen ? "transform rotate-180" : ""
                            )} />
                          </Button>
                          <AnimatePresence>
                            {calendarOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200"
                              >
                                <DayPicker
                                  mode="single"
                                  selected={formData.date ? new Date(formData.date) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      setFormData({
                                        ...formData,
                                        date: date.toISOString().split('T')[0]
                                      });
                                      setCalendarOpen(false);
                                    }
                                  }}
                                  disabled={(date) => date < new Date()}
                                  className="p-3"
                                  classNames={{
                                    day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                                    day_today: "bg-gray-100 text-gray-900",
                                    day_disabled: "text-gray-400 opacity-50"
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
                            variant="outline"
                            className={cn(
                              "w-full justify-between transition-colors duration-200",
                              timePickerOpen ? "border-blue-500" : "hover:border-gray-300"
                            )}
                            onClick={() => setTimePickerOpen(!timePickerOpen)}
                          >
                            {formData.time || "Select time"}
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              timePickerOpen ? "transform rotate-180" : ""
                            )} />
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
                                      onClick={() => {
                                        setFormData({
                                          ...formData,
                                          time: time.value
                                        });
                                        setTimePickerOpen(false);
                                      }}
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

                      <button
                        onClick={handleSubmit}
                        className="w-full bg-gray-800 text-white px-6 py-4 rounded-lg text-lg font-medium hover:bg-gray-900"
                      >
                        Book Your Demo
                      </button>

                      <p className="text-center text-xs text-gray-500">
                        No commitment required • Free consultation • 7-day trial available
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Success State
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Demo Booked Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We've received your request and will send you a confirmation email with meeting details shortly.
                  </p>
                  
                  <button
                    onClick={closeModal}
                    className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-900"
                  >
                    Continue Exploring
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
