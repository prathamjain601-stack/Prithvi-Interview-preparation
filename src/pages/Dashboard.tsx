import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, FileCheck, Bot, TrendingUp, Clock, Target, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getUserSessions, type InterviewSession } from "@/lib/interviewSessionStore";

const quickActions = [
  { icon: BookOpen, title: "Start Preparation", desc: "Theory, Resume, or JD-based", path: "/prepare", color: "bg-primary/10 text-primary" },
  { icon: Bot, title: "Mock Interview", desc: "MCQ and AI Interview", path: "/mock-interview", color: "bg-accent/10 text-accent" },
];

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (isLoaded && user && !user.unsafeMetadata?.onboarded) {
      navigate("/onboarding");
    }
  }, [isLoaded, user, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    getUserSessions(user.id)
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoadingSessions(false));
  }, [user?.id]);

  if (!isLoaded || !user) return null;

  // Compute real stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.overall_score !== null);
  const avgOverall =
    completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) / completedSessions.length)
      : 0;

  // Compute improvement: compare last 3 vs previous 3
  let improvement = "—";
  if (completedSessions.length >= 4) {
    const recent = completedSessions.slice(0, 3);
    const older = completedSessions.slice(3, 6);
    if (older.length > 0) {
      const recentAvg = recent.reduce((s, x) => s + (x.overall_score ?? 0), 0) / recent.length;
      const olderAvg = older.reduce((s, x) => s + (x.overall_score ?? 0), 0) / older.length;
      const diff = Math.round(recentAvg - olderAvg);
      improvement = diff >= 0 ? `+${diff}%` : `${diff}%`;
    }
  }

  // Recent activity from real data
  const recentActivity = sessions.slice(0, 4).map((s) => {
    const mcqPercent = s.mcq_total > 0 ? Math.round((s.mcq_correct / s.mcq_total) * 100) : 0;
    const hasInterview = s.overall_score !== null;
    const timeAgo = getTimeAgo(new Date(s.created_at));
    return {
      id: s.id,
      type: hasInterview ? "Interview" : "MCQ Only",
      title: s.job_role,
      score: hasInterview ? `${Math.round(s.overall_score!)}%` : `MCQ: ${mcqPercent}%`,
      time: timeAgo,
    };
  });

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
            { icon: Target, label: "Avg Score", value: totalSessions > 0 ? `${avgOverall}%` : "—", change: completedSessions.length > 0 ? `${completedSessions.length} rated` : "" },
            { icon: FileCheck, label: "Interviews", value: String(totalSessions), change: totalSessions > 0 ? "total" : "" },
            { icon: Clock, label: "Latest MCQ", value: sessions.length > 0 ? `${sessions[0].mcq_total > 0 ? Math.round((sessions[0].mcq_correct / sessions[0].mcq_total) * 100) : 0}%` : "—", change: sessions.length > 0 ? sessions[0].job_role.substring(0, 15) : "" },
            { icon: TrendingUp, label: "Improvement", value: improvement, change: completedSessions.length >= 4 ? "vs prev" : "need 4+" },
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
          {loadingSessions ? (
            <div className="glass-card p-8 flex justify-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground text-sm">
              No interviews yet. Start your first mock interview to see activity here.
            </div>
          ) : (
            <div className="glass-card divide-y divide-border">
              {recentActivity.map((item, i) => (
                <Link
                  key={item.id || i}
                  to={item.id ? `/session/${item.id}` : "#"}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{item.type}</span>
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground">{item.score}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Helper: relative time
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default Dashboard;
