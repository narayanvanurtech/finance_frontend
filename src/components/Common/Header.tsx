"use client";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        opacity: { duration: 0 },
        y: { duration: 0 },
      }}
      className={`fixed top-0 w-full z-50 flex items-center justify-between px-6 lg:px-12 py-4 border-b transition-all duration-700 ease-out ${
        isMobileMenuOpen
          ? "bg-black/95 backdrop-blur-xl border-gray-700 shadow-2xl"
          : "bg-white/10 backdrop-blur-lg border-white/20 "
      }`}
    >
      <motion.a
        href="/"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`text-2xl font-bold cursor-pointer transition-all duration-500 ease-out ${
          isMobileMenuOpen ? "text-white" : "text-gray-800"
        }`}
      >
        CAISHEN
      </motion.a>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {navItems.map((item, index) => (
          <motion.a
            key={index}
            href={item.href}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            whileHover={{
              scale: 1.05,
              y: -2,
              transition: { type: "spring", stiffness: 400, damping: 20 },
            }}
            className={`transition-all duration-500 ease-out relative ${
              isMobileMenuOpen
                ? "text-white"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {item.name}
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </motion.a>
        ))}
      </div>

      {/* Desktop Auth Buttons */}
      {!user && (
        <div className="hidden md:flex items-center space-x-4">
          <Link href={"/auth/login"}>
            <motion.button
              whileHover={{
                scale: 1.05,
                y: -2,
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
              whileTap={{ scale: 0.95 }}
              className="transition-all duration-500 ease-out px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-black/5"
            >
              Log in
            </motion.button>
          </Link>

          <Link href={"/auth/register"}>
            <motion.button
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-500 ease-out bg-gray-800 text-white hover:bg-gray-900 shadow-lg"
            >
              Free Trial
            </motion.button>
          </Link>
        </div>
      )}
      {user && (
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href={user.role === "admin" ? "/sales-crm/home" : "/user/sales-crm/home"}
            className="rounded-full transition-all duration-300 border-2 border-transparent hover:border-blue-500 p-[1px]"
          >
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : <span>U</span>}
            </div>
          </Link>
        </div>
      )}

      {/* Mobile Menu Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`md:hidden p-3 rounded-xl transition-all duration-500 ease-out ${
          isMobileMenuOpen ? " bg-white/5" : ""
        }`}
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <motion.span
            animate={{
              rotate: isMobileMenuOpen ? 45 : 0,
              y: isMobileMenuOpen ? 8 : 0,
            }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className={`w-full h-0.5 origin-center transition-colors duration-500 ease-out ${
              isMobileMenuOpen ? "bg-white" : "bg-gray-600"
            }`}
          />
          <motion.span
            animate={{
              opacity: isMobileMenuOpen ? 0 : 1,
              x: isMobileMenuOpen ? -10 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`w-full h-0.5 transition-colors duration-500 ease-out ${
              isMobileMenuOpen ? "bg-white" : "bg-gray-600"
            }`}
          />
          <motion.span
            animate={{
              rotate: isMobileMenuOpen ? -45 : 0,
              y: isMobileMenuOpen ? -8 : 0,
            }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className={`w-full h-0.5 origin-center transition-colors duration-500 ease-out ${
              isMobileMenuOpen ? "bg-white" : "bg-gray-600"
            }`}
          />
        </div>
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
              transition: {
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
                height: { duration: 0.3 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -10,
              transition: {
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1],
              },
            }}
            className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-gray-700 md:hidden overflow-hidden shadow-2xl z-40"
          >
            <motion.div
              className="flex flex-col p-6 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.1 + index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="text-white hover:text-gray-200 transition-all duration-200 ease-out py-3 text-lg font-medium border-b border-gray-800 last:border-b-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </motion.a>
              ))}

              <motion.div
                className="flex flex-col space-y-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {!user && (
                  <>
                    <Link href={"/auth/login"}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-white hover:text-gray-200 transition-all duration-300 ease-out py-3 px-4 rounded-xl border border-gray-700 hover:border-gray-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log in
                      </motion.button>
                    </Link>

                    <Link href={"/auth/register"}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-out font-medium shadow-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Free Trail
                      </motion.button>
                    </Link>
                  </>
                )}
                {user && (
                  <Link
                    href={user.role === "admin" ? "sales-crm/home" : "/user/sales-crm/home"}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl cursor-pointer mx-auto mt-2 mb-2 hover:bg-blue-700 transition-all duration-300">
                      {user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <span>U</span>
                      )}
                    </div>
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
