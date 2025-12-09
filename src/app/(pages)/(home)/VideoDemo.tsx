"use client"
import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import Link from 'next/link';

const CRMDemoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-gradient-to-b from-white py-12 sm:py-24 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 sm:mb-6 tracking-tight">
            See it in action
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-light px-4">
            Experience our intuitive email management system in action
          </p>
        </div>
        {/* Premium Video Container */}
        <div className="relative">
          {/* Simplified background effect */}
          <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl opacity-30 blur-2xl"></div>
          <div className="relative">
            {/* Main Video Frame */}
            <div className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xl cursor-pointer border border-gray-200"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            >
              {/* Video Aspect Ratio Container */}
              <div className="aspect-video relative overflow-hidden">
                {/* Dashboard Image */}
                <div className="absolute inset-0">
                  <img 
                    src="/images/crm-dashboard-preview.jpg" 
                    alt="CRM Dashboard Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Simplified Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Simplified button without animations */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/95 rounded-full shadow-lg flex items-center justify-center border border-white/30">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" fill="currentColor" />
                      ) : (
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800 ml-1" fill="currentColor" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Minimal CTA */}
        <div className="text-center mt-8 sm:mt-16">
          <div className="flex flex-col sm:inline-flex sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto bg-gray-900 text-white px-6 sm:px-8 py-3 rounded-full hover:bg-gray-800 font-medium shadow-lg">
              Watch Full Demo
            </button>
            <Link href={'/auth/register'}>
            <button className="w-full sm:w-auto text-gray-600 hover:text-gray-900 font-medium">
              Start free trial →
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDemoSection;