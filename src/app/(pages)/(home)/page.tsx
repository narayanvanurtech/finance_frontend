"use client"
import TrustedClientsSection from "./Clients";
import Hero from "./Hero";
import HowItWorks from "./howitworks";
import KeyBenefits from "./Benifits";
import DemoSection from "./VideoDemo";
import { UseCasesTabs } from "./UseCase";
import { PricingSection } from "./Pricing";
import { TestimonialsSection } from "./Testimonial";
import { TextParallaxContentExample } from "./Features";



const Homepage = () => {
  
  return (
    <div>
      <Hero />
      <TrustedClientsSection />
      <DemoSection/>
      <HowItWorks />
      <KeyBenefits/>
      <TextParallaxContentExample/>
      <UseCasesTabs/>
      <TestimonialsSection/>
      <PricingSection/>
    </div>
  );
};

export default Homepage;
