"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import ChatBot from "./ChatBot";

const FloatingChatButton: React.FC = () => {
  const [isBotOpen, setIsBotOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsBotOpen(!isBotOpen)}
        className="w-16 h-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-40 flex items-center justify-center backdrop-blur-md backdrop-saturate-150 border border-white/20 ring-1 ring-white/30"
      >
        <AnimatePresence mode="wait">
          {!isBotOpen ? (
            <motion.div
              key="message"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ 
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              <MessageCircle className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ 
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Bot */}
      <ChatBot isOpen={isBotOpen} onClose={() => setIsBotOpen(false)} />
    </div>
  );
};

export default FloatingChatButton; 