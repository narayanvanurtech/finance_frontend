"use client";
import React, { useEffect, useState } from "react";

const CRMRadar = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { name: 'Marketing\nSegmentation', angle: 45, radius: 280, color: 'from-blue-200 to-blue-400' },
    { name: 'Sales\nEnablement', angle: 90, radius: 320, color: 'from-purple-200 to-purple-400' },
    { name: 'Generative\nAI', angle: 135, radius: 290, color: 'from-indigo-200 to-indigo-400' },
    { name: 'Advanced\nAnalytics', angle: 180, radius: 310, color: 'from-cyan-200 to-cyan-400' },
    { name: 'Predictive\nAI & BI', angle: 225, radius: 295, color: 'from-teal-200 to-teal-400' },
    { name: 'Kiosk\nStudio', angle: 270, radius: 285, color: 'from-emerald-200 to-emerald-400' },
    { name: 'Journey\nOrchestration', angle: 315, radius: 305, color: 'from-green-200 to-green-400' },
    { name: 'CPQ', angle: 0, radius: 200, color: 'from-blue-100 to-blue-300' },
    { name: 'Sales Force\nAutomation', angle: 60, radius: 180, color: 'from-violet-200 to-violet-400' }
  ];

  const getPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#ACD8FE] via-[#edeffe] to-white flex items-center justify-center p-8 overflow-hidden">

      {/* Particle background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg className="w-full h-full" style={{ opacity: 0.15 }}>
          {[...Array(200)].map((_, i) => {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const r = Math.random() * 1.2 + 0.3;
            return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="#a0aec0" />;
          })}
        </svg>
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-100/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-purple-300/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative w-full max-w-6xl aspect-square z-10">

        {/* Radar rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute border border-gray-300/30 rounded-full animate-fadeIn"
              style={{
                width: `${i * 20}%`,
                height: `${i * 20}%`,
              }}
            />
          ))}
        </div>

        {/* Radar sweep cone */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70" />
          <div
            className="absolute w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-emerald-400/60 -translate-x-1/2"
            style={{ right: "50%", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>

        {/* Central logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-white/50 to-white/20 backdrop-blur-md rounded-full border border-gray-300/40 flex items-center justify-center shadow-xl hover:scale-105 transition">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-white rounded-full opacity-90" />
            </div>
          </div>
        </div>

        {/* Feature cards */}
        {features.map((feature, index) => {
          const position = getPosition(feature.angle, feature.radius);

          const angleDiff = Math.abs((rotation - feature.angle + 360) % 360);
          const sweepAngle = 30; // full cone angle (±15)
          const maxRadius = 310;

          const isInAngle = angleDiff < sweepAngle / 2 || angleDiff > (360 - sweepAngle / 2);
          const isInRange = feature.radius <= maxRadius;

          const isActive = isInAngle && isInRange;

          return (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                isActive ? "scale-110 z-10" : "scale-100"
              }`}
              style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% - ${position.y}px)`
              }}
            >
              <div
                className={`
                  px-6 py-4 rounded-2xl backdrop-blur-md border border-gray-300/30
                  bg-gradient-to-br ${feature.color}
                  shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
                  ${isActive ? "shadow-2xl ring-2 ring-gray-400/30" : ""}
                  group cursor-pointer relative
                `}
              >
                <div className="text-slate-700 text-sm font-semibold text-center whitespace-pre-line leading-tight">
                  {feature.name}
                </div>
                <div
                  className={`
                    absolute inset-0 rounded-2xl bg-white/20 opacity-0
                    group-hover:opacity-100 transition-opacity duration-300
                    ${isActive ? "opacity-30" : ""}
                  `}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Headings */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-20">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          Everything your business needs,
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          with a neat 360° view.
        </h2>
      </div>
    </div>
  );
};

export default CRMRadar;
