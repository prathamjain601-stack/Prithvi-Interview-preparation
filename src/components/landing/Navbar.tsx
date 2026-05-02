import { Link } from "react-router-dom";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Logo } from "@/components/Logo";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo className="w-10 h-10 text-purple-900 group-hover:scale-105 transition-transform" />
          <span className="text-xl font-extrabold text-purple-900 tracking-tight">PrepPrithvi</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-base font-bold text-purple-900/80 hover:text-purple-900 transition-colors">Features</a>
          <a href="#testimonials" className="text-base font-bold text-purple-900/80 hover:text-purple-900 transition-colors">Testimonials</a>
          <a href="#pricing" className="text-base font-bold text-purple-900/80 hover:text-purple-900 transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link to="/login">
              <Button variant="ghost" className="text-base font-bold text-purple-900 hover:text-purple-900 hover:bg-purple-100">Log in</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-base font-bold text-purple-900 hover:text-purple-900 hover:bg-purple-100">Dashboard</Button>
            </Link>
          </SignedIn>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-6 py-4 space-y-3 animate-fade-in">
          <a href="#features" className="block text-base font-bold text-purple-900/80 hover:text-purple-900">Features</a>
          <a href="#testimonials" className="block text-base font-bold text-purple-900/80 hover:text-purple-900">Testimonials</a>
          <div className="flex gap-2 pt-2">
            <SignedOut>
              <Link to="/login"><Button variant="ghost" className="text-base font-bold text-purple-900 hover:text-purple-900 hover:bg-purple-100">Log in</Button></Link>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard"><Button variant="ghost" className="text-base font-bold text-purple-900 hover:text-purple-900 hover:bg-purple-100">Dashboard</Button></Link>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
