import { Card, CardContent } from "@/components/ui/card";

const StatsSection = () => {
  const stats = [
    {
      number: "150K+",
      label: "Active Businesses",
      description: "Trust AccountFlow for their daily operations"
    },
    {
      number: "178+",
      label: "Countries",
      description: "Worldwide coverage and support"
    },
    {
      number: "$2.5B+",
      label: "Processed",
      description: "In transactions through our platform"
    },
    {
      number: "99.9%",
      label: "Uptime",
      description: "Reliable service you can count on"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Businesses
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of successful businesses that have transformed their operations with AccountFlow.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-border/50 hover:shadow-soft transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonial Quote */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed">
              "AccountFlow has revolutionized how we manage our finances. What used to take hours now takes minutes."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">SJ</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Sarah Johnson</div>
                <div className="text-muted-foreground">CEO, TechStart Inc.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;