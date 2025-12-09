"use client"
import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, Users, TrendingUp, Target, CheckCircle, Mail, Calendar, DollarSign, Star } from 'lucide-react';

const InteractiveStoryMode = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const steps = [
    {
      id: 0,
      title: "Ready to Transform Your Sales?",
      subtitle: "Watch your leads journey from first contact to closed deal",
      scene: "intro",
      cta: "Start the Journey"
    },
    {
      id: 1,
      title: "Capture Every Lead",
      subtitle: "Leads flow in from multiple channels automatically",
      scene: "capture",
      description: "Website forms, social media, and campaigns all feed into one centralized system"
    },
    {
      id: 2,
      title: "Nurture with Intelligence",
      subtitle: "Smart automation engages prospects at the perfect moment",
      scene: "nurture",
      description: "Personalized email sequences and targeted campaigns based on behavior"
    },
    {
      id: 3,
      title: "Track Progress Seamlessly",
      subtitle: "Real-time insights keep you ahead of every opportunity",
      scene: "track",
      description: "Visual pipeline management with forecasting and priority scoring"
    },
    {
      id: 4,
      title: "Close with Confidence",
      subtitle: "Turn prospects into loyal customers",
      scene: "close",
      description: "Collaboration tools and automated follow-ups ensure nothing is missed"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToStep = (step:number) => {
    if (step !== currentStep && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(step);
        setIsAnimating(false);
      }, 300);
    }
  };

  useEffect(() => {
    let interval:any;
    if (autoPlay && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, currentStep]);

  const renderScene = () => {
    const step = steps[currentStep];
    
    switch (step.scene) {
      case 'intro':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Play className="w-12 h-12 text-white ml-2" />
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Interactive Demo</h3>
                <p className="text-blue-100 max-w-md mx-auto">Experience how our CRM transforms your sales process step by step</p>
              </div>
            </div>
          </div>
        );

      case 'capture':
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
              {/* Lead Sources */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-6">Lead Sources</h4>
                {['Website Form', 'Social Media', 'Email Campaign', 'Referral'].map((source, idx) => (
                  <div 
                    key={source}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 animate-pulse"
                    style={{ animationDelay: `${idx * 0.5}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                      <span className="text-white">{source}</span>
                      <ArrowRight className="w-4 h-4 text-blue-300 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Central Dashboard */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">Lead Dashboard</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Johnson', source: 'Website', status: 'New' },
                    { name: 'Mike Chen', source: 'LinkedIn', status: 'Qualified' },
                    { name: 'Anna Davis', source: 'Email', status: 'Contacted' },
                  ].map((lead, idx) => (
                    <div 
                      key={lead.name}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg animate-fadeIn"
                      style={{ animationDelay: `${idx * 0.3 + 1}s` }}
                    >
                      <div>
                        <div className="font-medium text-gray-800">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.source}</div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'nurture':
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              <div className="grid grid-cols-3 gap-6">
                {/* Email Automation */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-800">Email Sequence</span>
                  </div>
                  <div className="space-y-3">
                    {['Welcome Email', 'Product Demo', 'Case Study', 'Follow-up'].map((email, idx) => (
                      <div 
                        key={email}
                        className={`p-3 rounded-lg transition-all duration-500 ${
                          idx <= 1 ? 'bg-green-100 border-l-4 border-green-500' : 'bg-gray-100'
                        }`}
                        style={{ animationDelay: `${idx * 0.8}s` }}
                      >
                        <div className="text-sm font-medium text-gray-800">{email}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {idx <= 1 ? '✓ Sent' : 'Scheduled'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Engagement Tracking */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">Engagement</span>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 animate-pulse">87%</div>
                      <div className="text-sm text-gray-500">Open Rate</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Email Opens</span>
                        <span className="text-green-600">↑ 23</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Link Clicks</span>
                        <span className="text-blue-600">↑ 12</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Replies</span>
                        <span className="text-purple-600">↑ 5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Actions */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-gray-800">Smart Actions</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { action: 'Schedule Follow-up', time: 'In 2 days', status: 'auto' },
                      { action: 'Send Case Study', time: 'Now', status: 'triggered' },
                      { action: 'Book Demo Call', time: 'Pending', status: 'waiting' }
                    ].map((item, idx) => (
                      <div 
                        key={item.action}
                        className="p-3 bg-orange-50 rounded-lg animate-slideIn"
                        style={{ animationDelay: `${idx * 0.4 + 1}s` }}
                      >
                        <div className="text-sm font-medium text-gray-800">{item.action}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'track':
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-5xl w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
                {/* Pipeline Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <h4 className="text-xl font-semibold text-gray-800">Sales Pipeline</h4>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">$127K</div>
                      <div className="text-sm text-gray-500">Forecasted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">23</div>
                      <div className="text-sm text-gray-500">Active Deals</div>
                    </div>
                  </div>
                </div>

                {/* Pipeline Stages */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { stage: 'Qualified', count: 8, value: '$45K', color: 'blue' },
                    { stage: 'Proposal', count: 6, value: '$38K', color: 'purple' },
                    { stage: 'Negotiation', count: 5, value: '$32K', color: 'orange' },
                    { stage: 'Closed Won', count: 4, value: '$12K', color: 'green' }
                  ].map((stage, idx) => (
                    <div key={stage.stage} className="space-y-3">
                      <div className="text-center p-4 bg-gray-100 rounded-lg">
                        <div className="font-semibold text-gray-800">{stage.stage}</div>
                        <div className="text-sm text-gray-500 mt-1">{stage.count} deals • {stage.value}</div>
                      </div>
                      
                      {/* Deal Cards */}
                      <div className="space-y-2">
                        {Array.from({ length: Math.min(stage.count, 3) }).map((_, cardIdx) => (
                          <div 
                            key={cardIdx}
                            className={`p-3 bg-${stage.color}-50 border-l-4 border-${stage.color}-500 rounded animate-slideUp`}
                            style={{ animationDelay: `${idx * 0.2 + cardIdx * 0.1}s` }}
                          >
                            <div className="text-sm font-medium text-gray-800">
                              Deal #{idx * 3 + cardIdx + 1}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ${Math.floor(Math.random() * 15) + 5}K
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'close':
        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              <div className="grid grid-cols-2 gap-8">
                {/* Deal Summary */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-800">Deal Closed!</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-800">Acme Corp Deal</div>
                        <div className="text-sm text-gray-500">Enterprise Plan</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">$24,500</div>
                        <div className="text-sm text-gray-500">Annual Value</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">47</div>
                        <div className="text-xs text-gray-500">Days to Close</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">12</div>
                        <div className="text-xs text-gray-500">Touchpoints</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-800">Success Metrics</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { metric: 'Conversion Rate', value: '23%', change: '+5%', trend: 'up' },
                      { metric: 'Avg. Deal Size', value: '$18.5K', change: '+12%', trend: 'up' },
                      { metric: 'Sales Cycle', value: '42 days', change: '-8 days', trend: 'up' },
                      { metric: 'Win Rate', value: '67%', change: '+15%', trend: 'up' }
                    ].map((item, idx) => (
                      <div 
                        key={item.metric}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg animate-fadeIn"
                        style={{ animationDelay: `${idx * 0.2}s` }}
                      >
                        <span className="font-medium text-gray-800">{item.metric}</span>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{item.value}</div>
                          <div className="text-sm text-green-600">{item.change}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-center">
                    <div className="text-white font-semibold">🎉 Congratulations!</div>
                    <div className="text-green-100 text-sm mt-1">Your sales process is now optimized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 text-center pt-12 pb-8">
          <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {steps[currentStep].title}
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {steps[currentStep].subtitle}
            </p>
            {steps[currentStep].description && (
              <p className="text-blue-200 mt-2 text-sm max-w-xl mx-auto">
                {steps[currentStep].description}
              </p>
            )}
          </div>
        </div>

        {/* Main Interactive Canvas */}
        <div className="flex-1 relative">
          <div className={`h-full transition-all duration-500 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            {renderScene()}
          </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 pb-12">
          <div className="max-w-4xl mx-auto px-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                {steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === currentStep 
                        ? 'bg-white scale-125' 
                        : idx < currentStep 
                          ? 'bg-green-400' 
                          : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <div className="w-full bg-white/20 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
              >
                Previous
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                    autoPlay 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {autoPlay ? 'Pause' : 'Auto Play'}
                </button>
                
                <span className="text-white/60 text-sm">
                  {currentStep + 1} of {steps.length}
                </span>
              </div>

              <button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
              >
                {currentStep === 0 ? steps[currentStep].cta : 'Next Step'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
        .animate-slideIn { animation: slideIn 0.5s ease-out forwards; opacity: 0; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; opacity: 0; }
      `}</style>
    </section>
  );
};

export default InteractiveStoryMode;