import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  AlertTriangle,
  Award,
  Loader2,
  Calendar,
  Briefcase,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { getUserSessions, type InterviewSession } from "@/lib/interviewSessionStore";

// ---------------------------------------------------------------------------
// Mini SVG Trend Line
// ---------------------------------------------------------------------------
const TrendLine = ({ data, width = 400, height = 120 }: { data: number[]; width?: number; height?: number }) => {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm py-8" style={{ height }}>
        Complete 2+ interviews to see your trend
      </div>
    );
  }

  const padding = 30;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * w,
    y: padding + h - ((v - min) / range) * h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${padding + h} L ${points[0].x} ${padding + h} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {/* Horizontal grid lines */}
      {[0, 25, 50, 75, 100].map((v) => {
        if (v < min || v > max) return null;
        const y = padding + h - ((v - min) / range) * h;
        return (
          <g key={v}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-border" strokeWidth="1" opacity={0.3} />
            <text x={padding - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">{v}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="hsl(var(--primary))" fillOpacity={0.08} />

      {/* Line */}
      <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-foreground text-[9px] font-medium">{Math.round(data[i])}</text>
        </g>
      ))}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Mini Radar for aggregate
// ---------------------------------------------------------------------------
const MiniRadar = ({
  scores,
  size = 300,
}: {
  scores: { technical: number; communication: number; problemSolving: number; confidence: number };
  size?: number;
}) => {
  const center = size / 2;
  const radius = size / 2 - 60;
  const labels = [
    { key: "technical" as const, label: "Technical" },
    { key: "communication" as const, label: "Communication" },
    { key: "problemSolving" as const, label: "Problem Solving" },
    { key: "confidence" as const, label: "Confidence" },
  ];

  const angleStep = (2 * Math.PI) / labels.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const dataPoints = labels.map((l, i) => getPoint(i, scores[l.key]));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid
  const rings = [2.5, 5, 7.5, 10];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {rings.map((v) => {
        const pts = labels.map((_, i) => getPoint(i, v));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={v} d={path} fill="none" stroke="currentColor" className="text-border" strokeWidth="1" opacity={0.8} />;
      })}
      {labels.map((_, i) => {
        const end = getPoint(i, 10);
        return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="currentColor" className="text-border" strokeWidth="1" opacity={0.6} />;
      })}
      <path d={dataPath} fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="hsl(var(--primary))" />
      ))}
      {labels.map((l, i) => {
        const labelPt = getPoint(i, 13);
        return (
          <text key={l.key} x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xs font-medium">
            {l.label}
          </text>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Performance Page
// ---------------------------------------------------------------------------
const Performance = () => {
  const { user } = useUser();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getUserSessions(user.id)
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Compute stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.overall_score !== null);
  const avgMcq =
    totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.mcq_score ?? 0), 0) / totalSessions)
      : 0;
  const avgInterview =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => {
            const sc = s.interview_scores;
            if (!sc) return sum;
            return sum + ((sc.technical + sc.communication + sc.problemSolving + sc.confidence) / 4) * 10;
          }, 0) / completedSessions.length
        )
      : 0;
  const avgOverall =
    completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) / completedSessions.length)
      : 0;

  // Trend data (chronological, last 10)
  const trendData = [...completedSessions]
    .reverse()
    .slice(-10)
    .map((s) => s.overall_score ?? 0);

  // Aggregate skill scores
  const aggScores = { technical: 0, communication: 0, problemSolving: 0, confidence: 0 };
  if (completedSessions.length > 0) {
    for (const s of completedSessions) {
      if (s.interview_scores) {
        aggScores.technical += s.interview_scores.technical;
        aggScores.communication += s.interview_scores.communication;
        aggScores.problemSolving += s.interview_scores.problemSolving;
        aggScores.confidence += s.interview_scores.confidence;
      }
    }
    aggScores.technical = Math.round((aggScores.technical / completedSessions.length) * 10) / 10;
    aggScores.communication = Math.round((aggScores.communication / completedSessions.length) * 10) / 10;
    aggScores.problemSolving = Math.round((aggScores.problemSolving / completedSessions.length) * 10) / 10;
    aggScores.confidence = Math.round((aggScores.confidence / completedSessions.length) * 10) / 10;
  }

  // Weakest dimension
  const dimEntries = Object.entries(aggScores) as [string, number][];
  const weakest = dimEntries.length > 0 ? dimEntries.reduce((a, b) => (a[1] < b[1] ? a : b)) : null;
  const strongest = dimEntries.length > 0 ? dimEntries.reduce((a, b) => (a[1] > b[1] ? a : b)) : null;

  const dimLabel: Record<string, string> = {
    technical: "Technical",
    communication: "Communication",
    problemSolving: "Problem Solving",
    confidence: "Confidence",
  };

  // Latest improvement suggestions from most recent session
  const latestComplete = completedSessions[0];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  // Empty state
  if (totalSessions === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center space-y-6 py-20 animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <BarChart3 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">No Interview Data Yet</h1>
          <p className="text-muted-foreground">
            Complete your first mock interview to start tracking your performance.
          </p>
          <Link to="/mock-interview">
            <button className="btn-gradient px-8 py-3 rounded-xl font-medium text-sm inline-flex items-center gap-2">
              Start Mock Interview <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress across {totalSessions} interview{totalSessions !== 1 ? "s" : ""}.
          </p>
        </div>

        {/* Overview stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{avgOverall}%</p>
            <p className="text-sm text-muted-foreground">Overall Score</p>
          </div>
          <div className="glass-card p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{avgMcq}%</p>
            <p className="text-sm text-muted-foreground">Avg MCQ Score</p>
          </div>
          <div className="glass-card p-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">{avgInterview}%</p>
            <p className="text-sm text-muted-foreground">Avg Interview Score</p>
          </div>
          <div className="glass-card p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
            <p className="text-sm text-muted-foreground">Interviews Taken</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Score Trend */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Score Trend
            </h3>
            <TrendLine data={trendData} />
          </div>

          {/* Skill Radar */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Skill Profile
            </h3>
            {completedSessions.length > 0 ? (
              <>
                <MiniRadar scores={aggScores} />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {dimEntries.map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">{dimLabel[key]}</span>
                      <span className="font-bold text-foreground">{val}/10</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8">
                Complete an interview to see your skill profile
              </div>
            )}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        {completedSessions.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" /> Strongest Area
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-500">{strongest ? strongest[1] : 0}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{strongest ? dimLabel[strongest[0]] : "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Average across all interviews</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Needs Improvement
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-500">{weakest ? weakest[1] : 0}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{weakest ? dimLabel[weakest[0]] : "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Focus practice here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Sessions</h3>
          <div className="divide-y divide-border">
            {sessions.slice(0, 10).map((s) => {
              const mcq = s.mcq_total > 0 ? Math.round((s.mcq_correct / s.mcq_total) * 100) : 0;
              return (
                <Link
                  key={s.id}
                  to={`/session/${s.id}`}
                  className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors -mx-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{s.job_role}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(s.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">MCQ</p>
                      <p className="text-sm font-bold text-foreground">{mcq}%</p>
                    </div>
                    {s.overall_score !== null && (
                      <>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Interview</p>
                          <p className="text-sm font-bold text-foreground">
                            {s.interview_scores
                              ? Math.round(
                                  ((s.interview_scores.technical +
                                    s.interview_scores.communication +
                                    s.interview_scores.problemSolving +
                                    s.interview_scores.confidence) /
                                    4) *
                                    10
                                )
                              : "—"}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Overall</p>
                          <p className={`text-sm font-bold ${(s.overall_score ?? 0) >= 70 ? "text-emerald-500" : (s.overall_score ?? 0) >= 50 ? "text-amber-500" : "text-destructive"}`}>
                            {Math.round(s.overall_score ?? 0)}%
                          </p>
                        </div>
                      </>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Improvement Suggestions */}
        {latestComplete && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Latest Improvement Suggestions
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {latestComplete.interview_improvements && latestComplete.interview_improvements.length > 0 ? (
                latestComplete.interview_improvements.map((tip, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      From: {latestComplete.job_role} interview
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-sm text-muted-foreground py-4">
                  No specific suggestions available yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Performance;
