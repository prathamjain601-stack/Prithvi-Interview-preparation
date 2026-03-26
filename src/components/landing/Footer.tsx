import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/70 py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-background">InterviewAI</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered interview preparation to help you land your dream job.
            </p>
          </div>

          {[
            { title: "Product", links: ["Features", "Pricing", "Demo", "Changelog"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security"] },
          ].map(section => (
            <div key={section.title}>
              <h4 className="font-semibold text-background text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link}>
                    <Link to="#" className="text-sm hover:text-background transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-sm">
          © 2026 InterviewAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
