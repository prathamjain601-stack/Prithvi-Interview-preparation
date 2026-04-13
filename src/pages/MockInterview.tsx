import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, ArrowRight, ArrowLeft, Bot, User, Loader2, Upload, FileText, X, Briefcase, PhoneOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { JOB_ROLES } from "./Prepare";
import { Input } from "@/components/ui/input";
import { useAiInterviewer } from "@/hooks/useAiInterviewer";
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  RoomAudioRenderer,
  ControlBar,
  useRoomContext,
  useDataChannel,
} from '@livekit/components-react';
import { Track, RoomEvent, type RemoteParticipant } from 'livekit-client';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import "@livekit/components-styles";

// Point PDF.js to the locally bundled worker (same as Prepare.tsx)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// --- MCQ Module ---
interface Question {
  q: string;
  options: string[];
  correct: number;
}

const McqModule = ({ onProceed }: { onProceed: (context: { jobRole: string; jdText: string; resumeText: string }) => void }) => {
  const [phase, setPhase] = useState<"setup" | "test" | "result">("setup");
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft] = useState(300);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jdText, setJdText] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const prompt = `You are an expert technical interviewer. Generate strictly 12 highly realistic, practical multiple-choice questions for a candidate applying for the role of "${jobRole}". 
      
Use the following Job Description (JD) to tailor the questions specifically to the required skills, tools, and responsibilities.
DO NOT use or refer to any resume information, only base the questions on the Job Role and JD.

JD:
${jdText.substring(0, 3000)}

Return the output STRICTLY as a JSON array of objects with the exact keys: "q" (the question string), "options" (an array of exactly 4 strings), and "correct" (the 0-indexed integer position of the correct option). Do not include any markdown formatting like \`\`\`json, just the pure JSON array.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "You are an expert technical interviewer. Produce strictly JSON arrays." }] },
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error("Failed to fetch from Gemini API");

      const data = await response.json();
      let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsedQuestions: Question[] = JSON.parse(aiText);
      if (parsedQuestions.length === 0) throw new Error("No questions generated.");
      
      setQuestions(parsedQuestions);
      setAnswers(Array(parsedQuestions.length).fill(null));
      setPhase("test");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setResumeFile(file);
      // Extract text from the file for AI context
      try {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          // Parse PDF using pdfjs-dist
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item: any) => item.str)
              .join(' ');
            fullText += pageText + '\n';
          }
          setResumeText(fullText.substring(0, 4000));
          console.log('[resume] Extracted', fullText.length, 'chars from PDF');
        } else {
          // Plain text / docx fallback
          const text = await file.text();
          setResumeText(text.substring(0, 4000));
        }
      } catch (err) {
        console.error('[resume] Failed to extract text:', err);
        setResumeText(file.name);
        toast.error("Could not extract resume text. The AI will have limited context.");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[current] = optionIdx;
    setAnswers(newAnswers);
  };

  const score = answers.reduce((acc, a, i) => acc + (a === questions[i].correct ? 1 : 0), 0);

  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mock Interview Assessment Module</h1>
          <p className="text-muted-foreground mt-1">Configure and start your assessment. This module includes an MCQ Test followed by an AI Interview.</p>
        </div>
        <div className="glass-card p-8 space-y-6">
          <div className="space-y-4">
            {/* Resume Upload */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                Upload Resume <span className="text-destructive">*</span>
              </label>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                } ${resumeFile ? "bg-muted/30" : ""}`}
              >
                <input {...getInputProps()} />
                {!resumeFile ? (
                  <>
                    <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive ? "Drop the file here..." : "Drag & drop your resume here"}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX up to 5MB</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{resumeFile.name}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                        }}
                        className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Role Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                Job Role <span className="text-destructive">*</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <Input 
                  placeholder="e.g. Frontend Developer, Data Scientist" 
                  className="w-full h-11 rounded-xl"
                  value={jobRole}
                  onChange={(e) => {
                    setJobRole(e.target.value);
                    setShowRoleDropdown(true);
                  }}
                  onFocus={() => setShowRoleDropdown(true)}
                />
                {showRoleDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {JOB_ROLES.filter(r => jobRole ? r.toLowerCase().startsWith(jobRole.toLowerCase()) : true).length > 0 ? (
                      <ul className="py-1">
                        {JOB_ROLES.filter(r => jobRole ? r.toLowerCase().startsWith(jobRole.toLowerCase()) : true).map(role => (
                          <li 
                            key={role}
                            className="px-4 py-2.5 text-sm hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => {
                              setJobRole(role);
                              setShowRoleDropdown(false);
                            }}
                          >
                            {role}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        No matching roles found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* JD Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> Company Job Description <span className="text-destructive">*</span>
              </label>
              <textarea
                className="w-full h-32 rounded-xl border border-border bg-background p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Paste the job requirements and description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="w-full btn-gradient h-12 text-sm flex items-center justify-center gap-2" 
            onClick={generateQuestions}
            disabled={!resumeFile || !jobRole.trim() || !jdText.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Start Assessment <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-primary">{score}/{questions.length}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">MCQ Test Complete!</h1>
          <p className="text-muted-foreground">You scored {Math.round((score / questions.length) * 100)}%</p>
        </div>

        <div className="space-y-3">
          {questions.map((q, i) => {
            const correct = answers[i] === q.correct;
            return (
              <div key={i} className="glass-card p-5 flex items-start gap-4">
                {correct ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium text-foreground">{q.q}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your answer: {q.options[answers[i] ?? 0]} {!correct && `• Correct: ${q.options[q.correct]}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Button className="w-full btn-gradient h-12 text-sm" onClick={() => onProceed({ jobRole, jdText, resumeText })}>
          Proceed to AI Interview <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        <span className="text-sm font-medium text-foreground">Question {current + 1} of {questions.length}</span>
      </div>

      <Progress value={((current + 1) / questions.length) * 100} className="h-2 rounded-full" />

      {/* Question */}
      <div className="glass-card p-8 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">{questions[current].q}</h2>
        <div className="space-y-3">
          {questions[current].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                answers[current] === i
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50 text-foreground"
              }`}
            >
              <span className="text-muted-foreground mr-3">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" className="rounded-xl" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        {current === questions.length - 1 ? (
          <Button className="btn-gradient text-sm px-6 py-2 h-auto" onClick={() => setPhase("result")}>
            Submit Test
          </Button>
        ) : (
          <Button className="btn-gradient text-sm px-6 py-2 h-auto" onClick={() => setCurrent(current + 1)}>
            Next <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface AiModuleProps {
  context: { jobRole: string; jdText: string; resumeText: string };
}

// ---------------------------------------------------------------------------
// AvatarView: Renders the Beyond Presence avatar's video track from the room.
// The avatar joins via the backend LiveKit agent — no frontend SDK needed.
// ---------------------------------------------------------------------------
const AvatarView = () => {
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    { onlySubscribed: true }
  );

  // Find the avatar worker's video track.
  // The Beyond Presence avatar participant has the attribute `lk.publish_on_behalf`
  // or its identity contains "bey-avatar" or it is an agent participant.
  const avatarTrack = tracks.find((t) => {
    const p = t.participant as RemoteParticipant;
    return (
      p.isAgent ||
      p.identity?.includes('bey-avatar') ||
      p.identity?.includes('agent') ||
      (p.attributes && 'lk.publish_on_behalf' in p.attributes)
    );
  });

  return (
    <div className="w-full h-full relative bg-black/90 rounded-xl overflow-hidden shadow-2xl">
      {avatarTrack ? (
        <VideoTrack
          trackRef={avatarTrack}
          className="w-full h-full object-contain animate-fade-in"
          style={{ objectPosition: 'center center' }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <p className="text-white/60 text-sm font-medium">
            Avatar is joining the room...
          </p>
        </div>
      )}
      <RoomAudioRenderer />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <ControlBar variation="minimal" />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TranscriptPanel: Listens for agent transcription events via data channels
// and displays them in a chat-style UI.
// ---------------------------------------------------------------------------
const TranscriptPanel = () => {
  const [messages, setMessages] = useState<
    { role: 'agent' | 'user'; text: string; timestamp: number }[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    // Listen for transcription events from the agent
    const handleTranscription = (
      segments: any[],
      participant: any
    ) => {
      for (const seg of segments) {
        if (seg.final && seg.text?.trim()) {
          const isAgent =
            participant?.isAgent ||
            participant?.identity?.includes('agent') ||
            participant?.identity?.includes('bey-avatar');
          setMessages((prev) => [
            ...prev,
            {
              role: isAgent ? 'agent' : 'user',
              text: seg.text.trim(),
              timestamp: Date.now(),
            },
          ]);
        }
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className="glass-card p-4 flex flex-col" style={{ height: 'calc(100vh - 14rem)', maxHeight: 'calc(100vh - 14rem)' }}>
      <h3 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2 mb-3 shrink-0">
        Conversation Transcript
      </h3>
      <div ref={scrollRef} className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-10 opacity-50">
            Waiting for interview to start...
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl text-sm leading-relaxed ${
                msg.role === 'agent'
                  ? 'bg-primary/10 rounded-tl-none border border-primary/20 mr-4'
                  : 'bg-muted rounded-tr-none ml-4 border border-border'
              }`}
            >
              <p className="text-foreground">{msg.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// RoomContent: The main interview UI rendered inside <LiveKitRoom>.
// ---------------------------------------------------------------------------
const RoomContent = () => {
  const room = useRoomContext();
  const [agentConnected, setAgentConnected] = useState(false);

  useEffect(() => {
    if (!room) return;

    const checkAgent = () => {
      const hasAgent = Array.from(room.remoteParticipants.values()).some(
        (p) => p.isAgent || p.identity?.includes('agent') || p.identity?.includes('bey-avatar')
      );
      setAgentConnected(hasAgent);
    };

    room.on(RoomEvent.ParticipantConnected, checkAgent);
    room.on(RoomEvent.ParticipantDisconnected, checkAgent);
    checkAgent(); // Check on mount

    return () => {
      room.off(RoomEvent.ParticipantConnected, checkAgent);
      room.off(RoomEvent.ParticipantDisconnected, checkAgent);
    };
  }, [room]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Live AI Interview</h1>
          <p className="text-sm text-muted-foreground">Beyond Presence Real-Time Avatar</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              agentConnected
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              agentConnected ? 'text-emerald-500' : 'text-amber-500'
            }`}
          >
            {agentConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6" style={{ minHeight: 0 }}>
        {/* Avatar Video */}
        <div className="col-span-2 rounded-2xl overflow-hidden border border-border shadow-xl bg-black relative" style={{ height: 'calc(100vh - 14rem)' }}>
          <AvatarView />
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 z-40 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                agentConnected ? 'bg-primary' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="text-white text-xs font-medium">
              {agentConnected ? 'AI Interviewer Active' : 'Waiting for agent...'}
            </span>
          </div>
        </div>

        {/* Transcript Panel */}
        <div className="col-span-1 flex flex-col gap-4">
          <TranscriptPanel />
          <Button
            variant="outline"
            className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => room?.disconnect()}
          >
            <PhoneOff className="w-4 h-4 mr-2" /> End Interview
          </Button>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// AiModule: Orchestrates the session — fetches a token, then renders the room.
// ---------------------------------------------------------------------------
const AiModule = ({ context }: AiModuleProps) => {
  const { session, status, error, retry } = useAiInterviewer(context);

  if (status === 'connecting' || status === 'idle') {
    return (
      <div className="h-[calc(100vh-7rem)] flex flex-col items-center justify-center space-y-4 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-foreground font-medium text-lg">
          Initializing Interview Session...
        </p>
        <p className="text-muted-foreground text-sm max-w-sm text-center">
          Preparing the media room and waking up your AI Interviewer.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-[calc(100vh-7rem)] flex flex-col items-center justify-center space-y-4 text-center">
        <XCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Connection Failed</h2>
        <p className="text-muted-foreground">
          {error || 'Unable to establish secure media link.'}
        </p>
        <Button variant="outline" onClick={retry}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col max-w-5xl mx-auto animate-fade-up">
      <LiveKitRoom
        serverUrl={session!.url}
        token={session!.token}
        connect={true}
        video={false}
        audio={true}
        onDisconnected={() => toast('Interview Session Ended.')}
        className="flex flex-col flex-1"
      >
        <RoomContent />
      </LiveKitRoom>
    </div>
  );
};

const MockInterview = () => {
  const [globalPhase, setGlobalPhase] = useState<"mcq" | "ai">("mcq");
  const [interviewContext, setInterviewContext] = useState<{ jobRole: string; jdText: string; resumeText: string } | null>(null);

  return (
    <DashboardLayout>
      {globalPhase === "mcq" ? (
        <McqModule 
          onProceed={(context) => {
            setInterviewContext(context);
            setGlobalPhase("ai");
          }} 
        />
      ) : (
        <AiModule context={interviewContext!} />
      )}
    </DashboardLayout>
  );
};

export default MockInterview;
