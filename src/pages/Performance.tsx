import DashboardLayout from "@/components/DashboardLayout";
import { TrendingUp, Target, AlertTriangle, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const weakTopics = [
  { topic: "System Design", score: 45 },
  { topic: "Dynamic Programming", score: 52 },
  { topic: "Graph Algorithms", score: 60 },
];

const recentScores = [
  { test: "React Fundamentals", score: 85, date: "Mar 22" },
  { test: "System Design Basics", score: 70, date: "Mar 20" },
  { test: "Data Structures", score: 90, date: "Mar 18" },
  { test: "SQL Queries", score: 75, date: "Mar 15" },
];

const Performance = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance</h1>
          <p className="text-muted-foreground mt-1">Track your progress and identify areas for improvement.</p>
        </div>

        {/* Overview stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Target, label: "Overall Accuracy", value: "78%", color: "bg-primary/10 text-primary" },
            { icon: Award, label: "Best Topic", value: "Arrays", color: "bg-emerald-100 text-emerald-600" },
            { icon: AlertTriangle, label: "Weakest Topic", value: "System Design", color: "bg-amber-100 text-amber-600" },
            { icon: TrendingUp, label: "Streak", value: "7 days", color: "bg-accent/10 text-accent" },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weak topics */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-semibold text-foreground">Areas for Improvement</h3>
            {weakTopics.map(topic => (
              <div key={topic.topic} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{topic.topic}</span>
                  <span className="text-muted-foreground">{topic.score}%</span>
                </div>
                <Progress value={topic.score} className="h-2 rounded-full" />
              </div>
            ))}
          </div>

          {/* Recent scores */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Recent Scores</h3>
            <div className="space-y-3">
              {recentScores.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.test}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16">
                      <Progress value={item.score} className="h-1.5 rounded-full" />
                    </div>
                    <span className="text-sm font-bold text-foreground w-10 text-right">{item.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Improvement Suggestions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Practice System Design", desc: "Focus on high-level architecture patterns and trade-offs." },
              { title: "Review DP Problems", desc: "Start with classic problems: knapsack, LCS, coin change." },
              { title: "Mock Interviews", desc: "Schedule 2-3 AI interviews per week for best results." },
            ].map(s => (
              <div key={s.title} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
