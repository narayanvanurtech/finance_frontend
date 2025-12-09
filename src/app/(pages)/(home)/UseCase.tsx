"use client";

import { SwitchTabs } from "@/components/ui/SwitchTabs";

// Main Use Cases Component
export function UseCasesTabs() {
  const tabs = [
    {
      title: "Sales Teams",
      value: "sales",
      content: (
        <TabContent
          title="Close more deals with intelligent automation"
          description="Advanced pipeline management, AI-powered lead scoring, and automated follow-ups that convert prospects into customers faster."
          image="/screenshots/usecase-sales.png"
          icon="📊"
        />
      ),
    },
    {
      title: "Marketing Teams",
      value: "marketing",
      content: (
        <TabContent
          title="Drive campaigns that deliver results"
          description="Unified customer journey tracking, campaign attribution, and lead nurturing workflows that maximize ROI."
          image="/screenshots/usecase-marketing.png"
          icon="🎯"
        />
      ),
    },
    {
      title: "Customer Success",
      value: "customer-success",
      content: (
        <TabContent
          title="Retain and grow your customer base"
          description="Proactive health scoring, automated renewal workflows, and expansion opportunity identification."
          image="/screenshots/usecase-success.png"
          icon="🚀"
        />
      ),
    },
    {
      title: "Operations",
      value: "operations",
      content: (
        <TabContent
          title="Streamline processes across teams"
          description="Cross-functional workflow automation, performance analytics, and resource optimization tools."
          image="/screenshots/usecase-operations.png"
          icon="⚙️"
        />
      ),
    },
    {
      title: "Leadership",
      value: "leadership",
      content: (
        <TabContent
          title="Make data-driven strategic decisions"
          description="Executive dashboards, revenue forecasting, and team performance insights that drive growth."
          image="/screenshots/usecase-leadership.png"
          icon="📈"
        />
      ),
    },
  ];

  return (
    <div className="min-h-[28rem] md:min-h-[42rem] [perspective:1000px] relative flex flex-col max-w-6xl mx-auto w-full items-start justify-start my-40 px-4">
      <div className="w-full mb-12 text-center">
        <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
          Built for Every Team
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Powerful CRM capabilities tailored to your team's unique workflow and objectives
        </p>
      </div>
      <SwitchTabs
        tabs={tabs}
        containerClassName="bg-white/80 rounded-2xl p-2 backdrop-blur-sm border border-gray-100"
        activeTabClassName="bg-gradient-to-r from-indigo-50 via-blue-50 to-white shadow-lg border border-indigo-100"
        tabClassName="px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-md text-gray-600 hover:text-gray-900"
      />
    </div>
  );
}

type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

type TabContentProps = {
  title: string;
  description: string;
  image: string;
  icon?: string;
};

const TabContent = ({ title, description, image, icon }: TabContentProps) => {
  return (
    <div className="w-full overflow-hidden relative rounded-3xl p-8 md:p-12 bg-gradient-to-br from-indigo-50 via-blue-50 to-white shadow-xl border border-gray-100">
      {/* Premium glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-indigo-100/10 rounded-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-lg space-y-6">
        {icon && (
          <div className="text-2xl md:text-3xl mb-4 opacity-90">
            {icon}
          </div>
        )}
        
        <h3 className="text-2xl md:text-4xl font-bold text-gray-800 leading-tight">
          {title}
        </h3>
        
        <p className="text-base md:text-lg text-gray-600 font-medium leading-relaxed max-w-xl">
          {description}
        </p>
        
        {/* CTA Button */}
        <div className="pt-4">
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 group">
            Learn More
            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Dashboard mockup image */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-4/5 hidden md:block">
        <div className="w-full h-full bg-gradient-to-br from-white/60 to-indigo-50/40 rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm p-6">
          {/* Simulated dashboard content */}
          <div className="space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full w-1/3"></div>
              <div className="flex space-x-2">
                <div className="w-6 h-6 bg-indigo-400 rounded-full opacity-80"></div>
                <div className="w-6 h-6 bg-blue-400 rounded-full opacity-80"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-white/70 rounded-xl p-4 space-y-3">
                <div className="h-2 bg-indigo-200 rounded-full w-3/4"></div>
                <div className="h-2 bg-indigo-100 rounded-full w-1/2"></div>
                <div className="h-8 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-lg"></div>
              </div>
              
              <div className="bg-white/70 rounded-xl p-4 space-y-3">
                <div className="h-2 bg-blue-200 rounded-full w-2/3"></div>
                <div className="space-y-2">
                  <div className="h-1.5 bg-blue-100 rounded-full"></div>
                  <div className="h-1.5 bg-blue-100 rounded-full w-3/4"></div>
                  <div className="h-1.5 bg-blue-100 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 rounded-xl p-4">
              <div className="h-2 bg-indigo-200 rounded-full w-1/4 mb-2"></div>
              <div className="flex space-x-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`w-2 bg-gradient-to-t from-indigo-400 to-blue-300 rounded-t`} style={{height: `${Math.random() * 32 + 8}px`}}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};