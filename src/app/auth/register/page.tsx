"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, CircularProgress, Select, MenuItem } from "@mui/material";
import {
  register,
  RegisterFormData,
  companySizeOptions,
  industryOptions,
} from "@/api/authApi";
import { createCompany } from "@/api/companyApi";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { useCompanyStore } from "@/stores/salesCrmStore/useCompanyStore";
import { generateRandomCompanyName } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    name: "",
    mobile: "",
    companyName: "",
    role: "admin",
    isActive: true,
    companySize: "11-50",
    industry: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Store hooks
  const { setRegisteredUser, registeredUser, isRegistrationComplete } =
    useAuthStore();
  const { setCompany, setLoading: setCompanyLoading } = useCompanyStore();

  // Animation panel logic - Updated content for registration
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const steps = [
    {
      title: "Build your sales team from day one.",
      desc: "Invite colleagues and start collaborating immediately.",
    },
    {
      title: "Set up your company workspace in minutes.",
      desc: "Customize your CRM to match your business needs.",
    },
    {
      title: "Join thousands of growing businesses.",
      desc: "Start your journey with proven sales strategies.",
    },
  ];
  const ANIMATION_DURATION = 4000;
  const TRANSITION_DURATION = 800;
  const nextStep = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep((prev) => (prev + 1) % steps.length);
      setProgress(0);
      setIsAnimating(false);
    }, TRANSITION_DURATION / 2);
  }, [steps.length]);
  useEffect(() => {
    let startTime = Date.now();
    let animationId: number;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = 1 - Math.pow(1 - percent, 3);
      setProgress(easedProgress * 100);
      if (percent < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          nextStep();
          startTime = Date.now();
        }, 200);
      }
    };
    if (!isAnimating) {
      animate();
    }
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [step, isAnimating, nextStep]);

  // Store planid from URL in localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const planid = params.get("planid");
      if (planid) {
        localStorage.setItem("selectedPlanId", planid);
      }
    }
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 0: User Registration
    if (activeStep === 0) {
      setLoading(true);
      setError("");

      try {
        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
          role: formData.role,
        };

        const response = await register(registerData);

        if (response.success) {
          // Save registered user data
          setRegisteredUser({
            _id: response.result._id,
            email: response.result.email,
            name: response.result.name,
            mobile: response.result.mobile,
            role: response.result.role,
            tempTokens: response.result.tempTokens,
          });

          // Move to company setup step
          setActiveStep(1);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Registration failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 1: Company Setup
    if (activeStep === 1) {
      if (!termsAccepted) {
        setError("Please accept the Terms of Service and Privacy Policy");
        return;
      }

      if (!registeredUser) {
        setError("User registration data not found. Please start over.");
        return;
      }

      setLoading(true);
      setCompanyLoading(true);
      setError("");

      try {
        const companyData = {
          companyName:
            formData.companyName.trim() === ""
              ? generateRandomCompanyName()
              : formData.companyName,
          industry: formData.industry,
          size: formData.companySize,
        };

        const response = await createCompany(registeredUser._id, companyData);

        if (response.success) {
          setCompany(response.result);
          // Clear registration data and redirect to login
          router.push("/auth/login?registered=true");
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Company setup failed. Please try again."
        );
      } finally {
        setLoading(false);
        setCompanyLoading(false);
      }
    }
  };

  const textVariants = {
    initial: {
      opacity: 0,
      y: 40,
      scale: 0.98,
      filter: "blur(2px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // smooth cubic-bezier
      },
    },
    exit: {
      opacity: 0,
      y: -40,
      scale: 0.98,
      filter: "blur(2px)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row md:p-5">
      {/* Logo - Fixed positioning with better responsiveness */}
      <div className="absolute top-4 left-4 sm:top-10 sm:left-10 z-20">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold cursor-pointer text-white"
        >
          CAISHEN
        </Link>
      </div>

      {/* Left Panel - Animation (Now First) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-indigo-500 text-white p-6 sm:p-8 lg:p-16 relative min-h-[40vh] md:rounded-3xl">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 lg:rounded-3xl"></div>
        <div className="text-center space-y-6 max-w-md z-10 w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="min-h-[6rem] sm:min-h-[8rem] flex flex-col justify-center"
              transition={{
                layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 leading-tight">
                {steps[step].title}
              </h2>
              <p className="text-pink-100 text-sm sm:text-base leading-relaxed">
                {steps[step].desc}
              </p>
            </motion.div>
          </AnimatePresence>
          {/* Enhanced Progress bar */}
          <div className="w-full max-w-[50vw] md:max-w-xs mx-auto mt-8">
            <div className="flex gap-2 sm:gap-3">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden relative backdrop-blur-sm"
                >
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-white rounded-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width:
                        idx < step
                          ? "100%"
                          : idx === step
                          ? `${progress}%`
                          : "0%",
                    }}
                    transition={{
                      duration: idx === step ? 0.1 : 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form (Now Second) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 py-16 sm:py-12 lg:py-0 px-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {activeStep === 0 ? "Create your account" : "Setup your company"}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {activeStep === 0
                ? "Sign up to get started"
                : "Complete your company profile"}
            </p>
          </div>
          {activeStep === 0 && (
            <div className="text-center text-gray-400 text-sm">
              or register with email
            </div>
          )}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait" initial={false}>
              {activeStep === 0 ? (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PersonalInfo
                    formData={formData}
                    showPassword={showPassword}
                    onShowPasswordChange={() => setShowPassword(!showPassword)}
                    onChange={handleChange}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="company"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CompanyInfo
                    formData={formData}
                    onChange={handleChange}
                    onCompanySizeChange={(value) =>
                      setFormData((prev) => ({ ...prev, companySize: value }))
                    }
                    onIndustryChange={(value) =>
                      setFormData((prev) => ({ ...prev, industry: value }))
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-8 space-y-4">
              {activeStep === 1 && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-900">
                    I accept the Terms of Service and Privacy Policy
                  </label>
                </div>
              )}
              <div className="flex gap-4">
                {/* {activeStep === 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(0)}
      className="w-[30%] h-11 px-6 text-indigo-600 bg-white border-2 border-indigo-600 rounded-md hover:bg-indigo-50 font-medium"
                  >
                    Back
                  </button>
                )} */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 h-11 px-6 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 font-medium flex items-center justify-center ${
                    loading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : activeStep === 0 ? (
                    "Continue"
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface PersonalInfoProps {
  formData: RegisterFormData;
  showPassword: boolean;
  onShowPasswordChange: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfo = ({
  formData,
  showPassword,
  onShowPasswordChange,
  onChange,
}: PersonalInfoProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Name
      </label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={onChange}
        required
        placeholder="Enter your name"
        className="h-11 appearance-none block w-full px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email
      </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        required
        placeholder="Enter your email"
        className="h-11 appearance-none block w-full px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={onChange}
          required
          placeholder="Enter your password"
          className="h-11 appearance-none block w-full px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          <IconButton
            type="button"
            onClick={onShowPasswordChange}
            tabIndex={-1}
            size="small"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </span>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Mobile
      </label>
      <input
        type="tel"
        name="mobile"
        value={formData.mobile}
        onChange={onChange}
        required
        placeholder="Enter your mobile number"
        className="h-11 appearance-none block w-full px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  </div>
);

interface CompanyInfoProps {
  formData: RegisterFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCompanySizeChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
}

const CompanyInfo = ({
  formData,
  onChange,
  onCompanySizeChange,
  onIndustryChange,
}: CompanyInfoProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Company Name
      </label>
      <input
        type="text"
        name="companyName"
        value={formData.companyName}
        onChange={onChange}
        required
        placeholder="Enter company name"
        className="h-11 appearance-none block w-full px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Industry
      </label>
      <Select
        value={formData.industry}
        onChange={(e) => onIndustryChange(e.target.value)}
        displayEmpty
        className="h-11"
        sx={{
          width: "100%",
          height: "44px",
          "& .MuiSelect-select": {
            padding: "8px 16px",
          },
        }}
      >
        <MenuItem value="" disabled>
          Select an industry
        </MenuItem>
        {industryOptions.map((industry) => (
          <MenuItem key={industry} value={industry}>
            {industry}
          </MenuItem>
        ))}
      </Select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Company Size
      </label>
      <Select
        value={formData.companySize}
        onChange={(e) => onCompanySizeChange(e.target.value)}
        displayEmpty
        className="h-11"
        sx={{
          width: "100%",
          height: "44px",
          "& .MuiSelect-select": {
            padding: "8px 16px",
          },
        }}
      >
        <MenuItem value="" disabled>
          Company size
        </MenuItem>
        {companySizeOptions.map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </Select>
    </div>
  </div>
);
