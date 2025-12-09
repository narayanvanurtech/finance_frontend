import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              🎉 Trusted by 150K+ businesses worldwide
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">Smart Accounting</span>
                <br />
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Streamline your invoicing, accounting, and customer management
                in one powerful platform. Save time, reduce errors, and grow
                your business faster.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="default" size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-bold text-2xl text-foreground">150K+</div>
                <div>Active Users</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-foreground">178+</div>
                <div>Countries</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-foreground">99.9%</div>
                <div>Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative animate-slide-in-left lg:animate-fade-in-up">
            <div className="relative">
              {/* Main Dashboard Image */}
              <img
                src={heroDashboard.src}
                alt="AccountFlow Dashboard"
                className="w-full h-auto rounded-2xl shadow-strong"
              />

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-card rounded-lg shadow-medium p-4 animate-float hidden md:block">
                <div className="text-sm font-medium text-accent">Revenue</div>
                <div className="text-2xl font-bold text-foreground">
                  $47,382
                </div>
                <div className="text-xs text-muted-foreground">
                  +12% this month
                </div>
              </div>

              <div
                className="absolute -bottom-4 -right-4 bg-card rounded-lg shadow-medium p-4 animate-float hidden md:block"
                style={{ animationDelay: "1s" }}
              >
                <div className="text-sm font-medium text-primary">Invoices</div>
                <div className="text-2xl font-bold text-foreground">24</div>
                <div className="text-xs text-muted-foreground">pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
