import { useEffect, useState } from "react";
import { Sparkles, Rocket } from "lucide-react";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { AnimatePresence, motion } from "framer-motion";

interface CustomPlanModalProps {
  open: boolean;
  onClose: () => void;
}

export const CustomPlanModal: React.FC<CustomPlanModalProps> = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const [requirements, setRequirements] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Autofill email and phone when modal opens and user is logged in
  useEffect(() => {
    if (open && user) {
      setEmail(user.email || "");
      setPhone(user.mobile || "");
    }
    if (!open) {
      setEmail("");
      setPhone("");
    }
  }, [open, user]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    setEmailError("");
    setPhoneError("");
    // Basic email validation
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
    // Basic phone validation (10+ digits)
    if (!phone.match(/^[0-9\-\+\s]{8,}$/)) {
      setPhoneError("Please enter a valid phone number.");
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  // Close modal after thank you is shown for 2 seconds
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRequirements("");
        setEmail("");
        setPhone("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-lg relative border border-blue-100 animate-popIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-700 text-2xl font-bold transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {/* Banner/Icon */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="bg-blue-100 rounded-full p-4 shadow mb-3 animate-bounce-slow">
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Dream Big. Build Bigger.</h2>
        </div>
        <div className="text-center text-gray-700 text-base mb-4 px-8">
          We don't just provide CRM – we deliver all kinds of software solutions, from custom platforms and integrations to analytics, automation, and more.<br/>
          <span className="font-semibold text-blue-700">Tell us your vision. We'll make it real!</span>
        </div>
        <AnimatePresence mode="wait">
          {!submitted && (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="px-8 pb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <label className="block mb-1 text-gray-800 font-semibold text-left">Email</label>
              <input
                type="email"
                className="w-full bg-white border border-gray-300 rounded-lg p-3 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all placeholder-gray-400 text-gray-900"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
              {emailError && <div className="text-red-600 text-xs font-medium pl-1">{emailError}</div>}
              <div className="mb-4" />
              <label className="block mb-1 text-gray-800 font-semibold text-left">Phone Number</label>
              <input
                type="tel"
                className="w-full bg-white border border-gray-300 rounded-lg p-3 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all placeholder-gray-400 text-gray-900"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="Your phone number"
              />
              {phoneError && <div className="text-red-600 text-xs font-medium pl-1">{phoneError}</div>}
              <div className="mb-4" />
              <label className="block mb-1 text-gray-800 font-semibold text-left">Describe your requirements</label>
              <textarea
                className="w-full bg-white border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all placeholder-gray-400 text-gray-900"
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                required
                placeholder="Tell us about your dream project, team size, features, integrations, or any wild idea!"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:from-indigo-600 hover:via-blue-600 hover:to-sky-600 transition-all mt-2 animate-popIn relative overflow-hidden shimmer-btn flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="mr-2 inline-block">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block align-middle"></span>
                    </span>
                    Submitting...
                  </>
                ) : (
                  'Submit Your Vision'
                )}
              </button>
            </motion.form>
          )}
          {submitted && (
            <motion.div
              key="thankyou"
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Rocket className="w-14 h-14 text-blue-400 mb-6 animate-popIn" />
              <div className="text-3xl font-bold text-blue-700 mb-4">Thank you!</div>
              <div className="text-gray-700 text-lg text-center max-w-xs">Our team will reach out soon to help you launch your next big thing 🚀</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s;
        }
        .animate-popIn {
          animation: popIn 0.4s cubic-bezier(0.25, 1.25, 0.5, 1.1);
        }
        .animate-bounce-slow {
          animation: bounce 2.5s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .shimmer-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%);
          animation: shimmer 3.2s cubic-bezier(0.4,0,0.2,1) infinite;
          z-index: 1;
          pointer-events: none;
        }
        .shimmer-btn {
          position: relative;
          overflow: hidden;
        }
        @keyframes shimmer {
          0% { left: -75%; }
          100% { left: 125%; }
        }
      `}</style>
    </div>
  );
};
