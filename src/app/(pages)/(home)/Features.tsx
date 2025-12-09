import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { Users, BarChart3, Zap, MessageSquare } from "lucide-react";

export const TextParallaxContentExample = () => {
  const features = [
    {
      title: "360° Customer View",
      subtitle: "Complete Customer Insights",
      description: "Get a comprehensive view of every customer interaction across channels. Track emails, calls, meetings, and deals in one unified dashboard. Make informed decisions with real-time customer data.",
      benefits: ["Unified customer profiles", "Interaction history", "Activity timeline"],
      icon: Users,
      imgUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      title: "Sales Pipeline Management",
      subtitle: "Deal Tracking & Forecasting",
      description: "Visualize and manage your entire sales pipeline. Track deals through custom stages, forecast revenue accurately, and identify bottlenecks before they impact your business.",
      benefits: ["Custom pipeline stages", "Revenue forecasting", "Deal analytics"],
      icon: BarChart3,
      imgUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2615&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      title: "Automated Workflows",
      subtitle: "Smart Process Automation",
      description: "Automate repetitive tasks and streamline your sales process. Set up custom workflows for lead nurturing, follow-ups, and deal progression. Save time and reduce manual work.",
      benefits: ["Lead nurturing", "Task automation", "Process optimization"],
      icon: Zap,
      imgUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      title: "Team Collaboration",
      subtitle: "Seamless Team Communication",
      description: "Enable seamless collaboration across your sales, marketing, and support teams. Share customer insights, coordinate activities, and maintain consistent communication with customers.",
      benefits: ["Team chat", "Shared calendars", "Document sharing"],
      icon: MessageSquare,
      imgUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  return (
    <div className="bg-white">
      {features.map((feature, index) => (
        <TextParallaxContent
          key={index}
          imgUrl={feature.imgUrl}
          subheading={feature.subtitle}
          heading={feature.title}
        >
          <ExampleContent feature={feature} />
        </TextParallaxContent>
      ))}
    </div>
  );
};

const IMG_PADDING = 12;

interface TextParallaxContentProps {
  imgUrl: string;
  subheading: string;
  heading: string;
  children: React.ReactNode;
}

const TextParallaxContent = ({ imgUrl, subheading, heading, children }: TextParallaxContentProps) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[100vh] max-w-7xl mx-auto">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

interface StickyImageProps {
  imgUrl: string;
}

const StickyImage = ({ imgUrl }: StickyImageProps) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(50vh -  ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

interface OverlayCopyProps {
  subheading: string;
  heading: string;
}

const OverlayCopy = ({ subheading, heading }: OverlayCopyProps) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

interface Feature {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  icon: React.ElementType;
}

interface ExampleContentProps {
  feature: Feature;
}

const ExampleContent = ({ feature }: ExampleContentProps) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
      {feature.title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
        {feature.description}
      </p>
      <ul className="mb-8 space-y-2">
        {feature.benefits.map((benefit, index) => (
          <li key={index} className="flex items-center space-x-2 text-lg text-neutral-600">
            <feature.icon className="w-5 h-5 text-blue-600" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <button className="w-full rounded bg-neutral-900 px-9 py-4 text-xl text-white transition-colors hover:bg-neutral-700 md:w-fit">
        Learn more <FiArrowUpRight className="inline" />
      </button>
    </div>
  </div>
);