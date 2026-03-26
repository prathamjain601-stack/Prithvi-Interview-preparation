import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    content: "InterviewAI completely transformed my preparation. The AI interviewer felt incredibly realistic, and the feedback was spot-on. Landed my dream job!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager at Meta",
    content: "The JD-based preparation feature is genius. It tailored questions exactly to the role I was applying for. Saved me weeks of manual prep.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Data Scientist at Amazon",
    content: "I loved how it analyzed my resume and found gaps in my preparation. The performance analytics kept me on track throughout my interview journey.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by candidates worldwide
          </h2>
          <p className="text-muted-foreground text-lg">
            See how InterviewAI has helped thousands ace their interviews.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed">"{t.content}"</p>
              <div className="pt-2 border-t border-border/50">
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
