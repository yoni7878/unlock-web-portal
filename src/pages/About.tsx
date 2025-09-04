import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Shield, 
  Globe, 
  Zap, 
  Users, 
  Award,
  Heart,
  Lock,
  Wifi,
  Server
} from "lucide-react";

interface AboutProps {
  onBack?: () => void;
}

export const About = ({ onBack }: AboutProps) => {
  const features = [
    {
      icon: Shield,
      title: "Secure Browsing",
      description: "Military-grade encryption ensures your browsing remains private and secure",
      color: "text-green-400"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized proxy servers provide blazing fast connection speeds",
      color: "text-yellow-400"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Access any website from anywhere in the world without restrictions",
      color: "text-blue-400"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "No logs, no tracking, no data collection - your privacy is guaranteed",
      color: "text-purple-400"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Countries", value: "150+", icon: Globe },
    { label: "Uptime", value: "99.9%", icon: Server },
    { label: "Satisfaction", value: "98%", icon: Heart }
  ];

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <header className="flex items-center gap-6 mb-12 max-w-6xl mx-auto">
        {onBack && (
          <Button
            onClick={onBack}
            variant="secondary"
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <div className="space-y-2">
          <h1 className="hero-title animate-scale-in">About UnblockEd</h1>
          <p className="text-xl text-muted-foreground/90 font-medium">Learn more about our mission and technology</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="status-dot"></div>
            <span className="text-sm font-mono text-green-400">Trusted by thousands</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Mission Section */}
        <Card className="portal-card p-8 interactive-card">
          <div className="text-center space-y-6">
            <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
              <Award className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-bold gradient-text">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe the internet should be free and accessible to everyone. UnblockEd Portal breaks down digital barriers, 
              providing secure, fast, and reliable access to the web without compromise. Whether you're a student, professional, 
              or curious explorer, we're here to unlock the full potential of the internet for you.
            </p>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Why Choose UnblockEd?</h2>
            <p className="text-muted-foreground">Discover what makes us the preferred choice for secure browsing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="portal-card p-8 interactive-card group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-secondary/50 rounded-2xl group-hover:bg-primary/10 transition-colors duration-300">
                        <IconComponent className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <h3 className="text-2xl font-bold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <Card className="portal-card p-8 interactive-card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Trusted Worldwide</h2>
            <p className="text-muted-foreground">Join thousands of users who trust UnblockEd Portal</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center space-y-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Technology Section */}
        <Card className="portal-card p-8 interactive-card">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Wifi className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Advanced Technology</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Our cutting-edge proxy technology leverages multiple servers worldwide to ensure optimal performance. 
                We use state-of-the-art encryption protocols and smart routing algorithms to deliver the fastest, 
                most secure browsing experience possible.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-4 py-2">SSL/TLS Encryption</Badge>
                <Badge variant="secondary" className="px-4 py-2">Smart Routing</Badge>
                <Badge variant="secondary" className="px-4 py-2">Global CDN</Badge>
                <Badge variant="secondary" className="px-4 py-2">Zero Logs</Badge>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-8 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-primary/10 rounded-full animate-pulse flex items-center justify-center">
                    <Server className="w-16 h-16 text-primary" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400/20 rounded-full animate-bounce flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="portal-card p-8 interactive-card text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Ready to Unlock the Web?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who trust UnblockEd Portal for secure, fast, and unrestricted internet access.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="portal-button px-8 py-3"
            >
              Start Browsing Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};