import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import heroIllustration from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  return (
    <section className="hero-gradient relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground/80 text-sm animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Powered by Advanced AI
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-primary-foreground animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Ace Your Interviews{" "}
              <span className="gradient-text">with AI</span>
            </h1>

            <p className="text-lg text-primary-foreground/60 max-w-lg leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Prepare smarter with AI-powered mock interviews, personalized question banks, and real-time feedback. From theory to resume-based practice — we've got you covered.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <SignedOut>
                <Link to="/dashboard">
                  <Button className="h-auto px-8 py-3.5 text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl transition-all">
                    <Play className="mr-2 w-4 h-4" />
                    Try Demo
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button className="btn-gradient text-base px-8 py-3.5 h-auto">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </SignedIn>
            </div>

            <div className="flex items-center gap-6 pt-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-foreground/20 bg-primary/30 flex items-center justify-center text-xs font-medium text-primary-foreground/80">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary-foreground/50">
                <span className="font-semibold text-primary-foreground/80">2,500+</span> candidates prepared this month
              </p>
            </div>
          </div>

          <div className="relative animate-fade-up hidden lg:block" style={{ animationDelay: '0.3s' }}>
            <div className="relative rounded-2xl overflow-hidden border border-primary-foreground/10 shadow-2xl animate-float">
              <img src={heroIllustration} alt="AI Interview Platform" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
