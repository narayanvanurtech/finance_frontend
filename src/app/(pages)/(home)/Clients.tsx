"use client";
import { motion } from "framer-motion";

const clients = [
  { name: "Google", logo: "https://vanurmedia.com/wp-content/uploads/2025/05/7.webp" },
  { name: "Amazon", logo: "https://vanurmedia.com/wp-content/uploads/2025/05/11.webp" },
  { name: "Netflix", logo: "https://vanurmedia.com/wp-content/uploads/2025/05/10.webp" },
  { name: "Slack", logo: "https://vanurmedia.com/wp-content/uploads/2025/05/5.webp" },
  { name: "Zoom", logo: "https://vanurmedia.com/wp-content/uploads/2025/05/1.webp" },
  { name: "Spotify", logo: "https://vanurmedia.com/wp-content/uploads/2025/05/6.webp" },
];

export default function TrustedClientsSection() {
  const scrollingClients = [...clients, ...clients]; // duplicate for seamless scroll

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-semibold text-gray-800 mb-10"
        >
          Trusted by 100+ companies worldwide
        </motion.h2>

        <div className="overflow-hidden relative">
          {/* Left fade overlay */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          
          {/* Right fade overlay */}
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <motion.div
            className="flex gap-10"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 20,
            }}
          >
            {scrollingClients.map((client, idx) => (
              <div
                key={idx}
                className="flex justify-center items-center p-4 min-w-[120px] rounded-lg  backdrop-blur-md border border-white/50 shadow-sm my-4"
              >
                <img
                  src={client.logo}
                  alt={client.name}
                  className="h-10 object-contain grayscale hover:grayscale-0 transition duration-300"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
