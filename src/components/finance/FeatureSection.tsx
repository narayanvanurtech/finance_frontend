import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Calculator, 
  Users, 
  BarChart3, 
  CreditCard, 
  Smartphone,
  Shield,
  Zap,
  Globe
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Smart Invoicing",
      description: "Create professional invoices in seconds with automated calculations and payment tracking."
    },
    {
      icon: Calculator,
      title: "Automated Accounting",
      description: "Streamline your bookkeeping with intelligent categorization and real-time financial insights."
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Manage your customer relationships with detailed profiles and interaction history."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get powerful insights into your business performance with customizable reports."
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Accept payments online with integrated payment gateways and automatic reconciliation."
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Access your business data anywhere with our responsive mobile-first design."
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade security and regular backups."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Experience blazing-fast performance with our optimized cloud infrastructure."
    },
    {
      icon: Globe,
      title: "Multi-Currency",
      description: "Work with clients globally using support for 100+ currencies and tax systems."
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Manage Your Business</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to simplify your accounting, enhance customer relationships, 
            and accelerate your business growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border-border/50"
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Ready to transform your business operations?
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-accent/10 text-accent rounded-full text-sm font-medium">
            ✨ Start your free 14-day trial - No credit card required
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;