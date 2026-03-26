import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, FileCheck, Bot, TrendingUp, Clock, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  { icon: BookOpen, title: "Start Preparation", desc: "Theory, Resume, or JD-based", path: "/prepare", color: "bg-primary/10 text-primary" },
  { icon: FileCheck, title: "Take a Test", desc: "MCQ tests with AI feedback", path: "/tests", color: "bg-accent/10 text-accent" },
  { icon: Bot, title: "AI Interview", desc: "Practice with AI interviewer", path: "/interviewer", color: "bg-purple-100 text-purple-600" },
];

const recentActivity = [
  { type: "Test", title: "React Fundamentals MCQ", score: "85%", time: "2 hours ago" },
  { type: "Interview", title: "System Design Mock", score: "7/10", time: "Yesterday" },
  { type: "Prep", title: "Data Structures Review", score: "Completed", time: "2 days ago" },
];

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && user && !user.unsafeMetadata?.onboarded) {
      navigate("/onboarding");
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.firstName || "User"} 👋</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your interview preparation journey.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Target, label: "Accuracy", value: "78%", change: "+5%" },
            { icon: FileCheck, label: "Tests Taken", value: "24", change: "+3" },
            { icon: Clock, label: "Practice Hours", value: "32h", change: "+4h" },
            { icon: TrendingUp, label: "Improvement", value: "15%", change: "↑" },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium text-accent">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map(action => (
              <Link key={action.path} to={action.path} className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{action.desc}</p>
                <span className="text-sm font-medium text-primary flex items-center gap-1">
                  Get started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="glass-card divide-y divide-border">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{item.type}</span>
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-foreground">{item.score}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
