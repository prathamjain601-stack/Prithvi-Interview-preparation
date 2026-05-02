import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import heroIllustration from "@/assets/download.jpg";
import heroBg from "@/assets/download-1.jpg";

const HeroSection = () => {
  return (
    <section 
      className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/60" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-sm animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Powered by Advanced AI
            </div><h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-purple-900 animate-fade-up" style={{ animationDelay: '0.1s' }}>

            
              Ace Your Interviews{" "}
              with PrepPrithvi
            </h1>

            <p className="text-lg text-purple-800 max-w-lg leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Prepare smarter with AI-powered mock interviews, personalized question banks, and real-time feedback. From theory to resume-based practice — we've got you covered.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <SignedOut>
                <Link to="/dashboard">
                  <Button className="h-auto px-8 py-3.5 text-base bg-purple-100 border border-purple-300 text-purple-800 hover:bg-purple-200 rounded-xl transition-all">
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
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-purple-200 bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-800">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-purple-700">
                <span className="font-semibold text-purple-900">2,500+</span> candidates prepared this month
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
