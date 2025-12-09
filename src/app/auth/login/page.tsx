"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import usePushNotifications from "@/hooks/usePushNotifications";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import CircularProgress from "@mui/material/CircularProgress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { fcmToken, generateFCMToken } = usePushNotifications();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user, loginUser } = useAuthStore();

  const steps = [
    {
      title: "Visualize your sales pipeline in real-time.",
      desc: "See every deal, lead, and opportunity at a glance.",
    },
    {
      title: "Collaborate with your team and close deals faster.",
      desc: "Assign tasks, share notes, and never miss a follow-up.",
    },
    {
      title: "Get actionable insights to grow your business.",
      desc: "Track performance and make data-driven decisions.",
    },
  ];

  const ANIMATION_DURATION = 4000; // 4 seconds per step
  const TRANSITION_DURATION = 800; // 0.8 seconds for text transition

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

      // Smooth easing function for progress bar
      const easedProgress = 1 - Math.pow(1 - percent, 3); // Ease-out cubic
      setProgress(easedProgress * 100);

      if (percent < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Reset and move to next step
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let deviceToken: string | null = fcmToken;
      if (!deviceToken) {
        deviceToken = await generateFCMToken();
      }
      await loginUser(email, password, deviceToken || "sfslalj38395sfk");
      toast.success("Login successful!", {
        position: "top-center",
        style: { background: "#4caf50", color: "#fff" },
      });
      // Check role and navigate accordingly
      const role = useAuthStore.getState().user?.role;

      if (role === "superadmin" || role === "admin") {
        router.push("/sales-crm/home");
      } else if (role === "manager") {
        router.push("/manager/sales-crm/home");
      } else if (role === "user") {
        router.push("/user/sales-crm/home");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password.");
      toast.error(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const textVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom bezier curve for smooth animation
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row md:p-5">
      {/* Logo - Fixed positioning with better responsiveness */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold cursor-pointer md:text-gray-900 text-white"
        >
          CAISHEN
        </Link>
      </div>

      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 py-16 sm:py-12 lg:py-0 px-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back
            </h1>
            <p className="text-sm text-gray-600 mt-2">Login to your account</p>
          </div>

          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <FcGoogle className="w-5 h-5" />
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Continue with Google
            </span>
          </button>

          <div className="text-center text-gray-400 text-sm">
            or login with email
          </div>

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
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <CircularProgress size={20} className="text-white" />
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Animation */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-indigo-500 text-white p-6 sm:p-8 lg:p-16 relative min-h-[40vh]  md:rounded-3xl order-first lg:order-last ">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 lg:rounded-3xl"></div>

        <div className="text-center space-y-6 max-w-md z-10 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="min-h-[6rem] sm:min-h-[8rem] flex flex-col justify-center"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 leading-tight">
                {steps[step].title}
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                {steps[step].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Enhanced Progress bar */}
          <div className="w-full max-w-[50vw] md:max-w-xs  mx-auto mt-8">
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
    </div>
  );
}
