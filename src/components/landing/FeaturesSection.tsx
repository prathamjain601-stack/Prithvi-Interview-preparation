import { BookOpen, FileText, Briefcase, Bot, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Theory-Based Prep",
    description: "Master core concepts with curated question banks spanning data structures, system design, and more.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileText,
    title: "Resume-Based Prep",
    description: "Upload your resume and get targeted questions based on your experience, skills, and projects.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Briefcase,
    title: "JD-Based Prep",
    description: "Paste a job description and receive role-specific questions tailored to the position.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Bot,
    title: "Mock Interview Assessment",
    description: "Take comprehensive mock interviews featuring MCQ assessments followed by real-time conversational AI interviewer sessions.",
    color: "bg-rose-100 text-rose-600",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress with detailed analytics showing strengths, weaknesses, and growth over time.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get AI-powered evaluations of your answers with improvement suggestions in real-time.",
    color: "bg-emerald-100 text-emerald-600",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to{" "}
            <span className="gradient-text">nail your interview</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive toolkit designed to maximize your interview preparation and boost your confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
