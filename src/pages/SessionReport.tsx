import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
  Target,
  MessageSquare,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { getSessionById, type InterviewSession } from "@/lib/interviewSessionStore";

// ---------------------------------------------------------------------------
// Radar Chart (pure SVG)
// ---------------------------------------------------------------------------
const RadarChart = ({
  scores,
  size = 220,
}: {
  scores: { technical: number; communication: number; problemSolving: number; confidence: number };
  size?: number;
}) => {
  const center = size / 2;
  const radius = size / 2 - 30;
  const labels = [
    { key: "technical", label: "Technical" },
    { key: "communication", label: "Communication" },
    { key: "problemSolving", label: "Problem Solving" },
    { key: "confidence", label: "Confidence" },
  ] as const;

  const angleStep = (2 * Math.PI) / labels.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  // Grid rings
  const rings = [2, 4, 6, 8, 10];

  // Data polygon
  const dataPoints = labels.map((l, i) => getPoint(i, scores[l.key]));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid rings */}
      {rings.map((v) => {
        const pts = labels.map((_, i) => getPoint(i, v));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={v} d={path} fill="none" stroke="currentColor" className="text-border" strokeWidth="1" opacity={0.4} />;
      })}

      {/* Axis lines */}
      {labels.map((_, i) => {
        const end = getPoint(i, 10);
        return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="currentColor" className="text-border" strokeWidth="1" opacity={0.3} />;
      })}

      {/* Data polygon */}
      <path d={dataPath} fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="hsl(var(--primary))" />
      ))}

      {/* Labels */}
      {labels.map((l, i) => {
        const labelPt = getPoint(i, 12);
        return (
          <text
            key={l.key}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-[10px] font-medium"
          >
            {l.label}
          </text>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Circular Score Gauge
// ---------------------------------------------------------------------------
const ScoreGauge = ({ score, label, size = 140 }: { score: number; label: string; size?: number }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 75
      ? "text-emerald-500"
      : score >= 50
        ? "text-amber-500"
        : "text-destructive";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-border" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className={`text-3xl font-bold ${color}`}>{Math.round(score)}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Session Report Page
// ---------------------------------------------------------------------------
const SessionReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showMcqDetails, setShowMcqDetails] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSessionById(id)
      .then((s) => setSession(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-7rem)] flex flex-col items-center justify-center space-y-4">
          <XCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-bold">Session Not Found</h2>
          <Button variant="outline" onClick={() => navigate("/performance")}>
            Back to Performance
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const mcqPercent = session.mcq_total > 0 ? Math.round((session.mcq_correct / session.mcq_total) * 100) : 0;
  const hasInterview = !!session.interview_scores;
  const interviewAvg = hasInterview
    ? Math.round(
        ((session.interview_scores!.technical +
          session.interview_scores!.communication +
          session.interview_scores!.problemSolving +
          session.interview_scores!.confidence) /
          4) *
          10
      )
    : 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDuration = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}m ${sec}s`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate("/performance")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Interview Report</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> {session.job_role}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatDate(session.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Score + Radar */}
        <div className="glass-card p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center relative">
              <ScoreGauge score={session.overall_score ?? mcqPercent} label="Overall Score" size={160} />
            </div>
            {hasInterview ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 text-center">Skill Breakdown</h3>
                <RadarChart scores={session.interview_scores!} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-sm text-muted-foreground">Interview evaluation pending or unavailable</p>
              </div>
            )}
          </div>
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{mcqPercent}%</p>
            <p className="text-sm text-muted-foreground">MCQ Score</p>
            <p className="text-xs text-muted-foreground mt-1">{session.mcq_correct}/{session.mcq_total} correct</p>
          </div>
          {hasInterview && (
            <>
              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{interviewAvg}%</p>
                <p className="text-sm text-muted-foreground">Interview Score</p>
              </div>
              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {session.interview_transcript?.length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Exchanges</p>
              </div>
              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {session.interview_duration_seconds ? formatDuration(session.interview_duration_seconds) : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
            </>
          )}
        </div>

        {/* Individual Scores */}
        {hasInterview && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Dimension Scores</h3>
            {(
              [
                { key: "technical" as const, label: "Technical Knowledge", icon: "💻" },
                { key: "communication" as const, label: "Communication", icon: "🗣️" },
                { key: "problemSolving" as const, label: "Problem Solving", icon: "🧠" },
                { key: "confidence" as const, label: "Confidence", icon: "💪" },
              ] as const
            ).map(({ key, label, icon }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{icon} {label}</span>
                  <span className="text-muted-foreground font-bold">{session.interview_scores![key]}/10</span>
                </div>
                <Progress value={session.interview_scores![key] * 10} className="h-2 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* AI Feedback */}
        {hasInterview && session.interview_feedback && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Feedback
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {session.interview_feedback}
            </p>
          </div>
        )}

        {/* Strengths + Improvements */}
        {hasInterview && (
          <div className="grid md:grid-cols-2 gap-6">
            {session.interview_strengths && session.interview_strengths.length > 0 && (
              <div className="glass-card p-6 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {session.interview_strengths.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium border border-emerald-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {session.interview_improvements && session.interview_improvements.length > 0 && (
              <div className="glass-card p-6 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Areas to Improve
                </h3>
                <div className="flex flex-wrap gap-2">
                  {session.interview_improvements.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium border border-amber-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MCQ Details (expandable) */}
        {session.mcq_questions && session.mcq_questions.length > 0 && (
          <div className="glass-card p-6">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setShowMcqDetails(!showMcqDetails)}
            >
              <h3 className="font-semibold text-foreground">MCQ Question Details</h3>
              {showMcqDetails ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            {showMcqDetails && (
              <div className="mt-4 space-y-3">
                {session.mcq_questions.map((q, i) => {
                  const correct = q.userAnswer === q.correct;
                  return (
                    <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3">
                      {correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{q.q}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your answer: {q.options[q.userAnswer ?? 0]}
                          {!correct && ` • Correct: ${q.options[q.correct]}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Transcript (expandable) */}
        {session.interview_transcript && session.interview_transcript.length > 0 && (
          <div className="glass-card p-6">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <h3 className="font-semibold text-foreground">Full Interview Transcript</h3>
              {showTranscript ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            {showTranscript && (
              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
                {session.interview_transcript.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === "agent"
                        ? "bg-primary/10 rounded-tl-none border border-primary/20 mr-8"
                        : "bg-muted rounded-tr-none ml-8 border border-border"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {msg.role === "agent" ? (
                        <Bot className="w-3 h-3 text-primary" />
                      ) : (
                        <User className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground">
                        {msg.role === "agent" ? "Interviewer" : "You"}
                      </span>
                    </div>
                    <p className="text-foreground">{msg.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link to="/mock-interview" className="flex-1">
            <Button className="w-full btn-gradient h-12">
              Take Another Interview <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/performance" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl">
              View Performance Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SessionReport;
