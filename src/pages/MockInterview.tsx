import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, ArrowRight, ArrowLeft, Bot, User, Send, Mic, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// --- MCQ Module ---
const questions = [
  { q: "What is the default value of a boolean variable in Java?", options: ["true", "false", "null", "0"], correct: 1 },
  { q: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array", "LinkedList"], correct: 1 },
  { q: "What is the time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correct: 2 },
  { q: "Which protocol is used for secure web communication?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], correct: 2 },
  { q: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "System Query Language"], correct: 0 },
];

const McqModule = ({ onProceed }: { onProceed: () => void }) => {
  const [phase, setPhase] = useState<"setup" | "test" | "result">("setup");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [timeLeft] = useState(300);

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
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Topic</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm">
                <option>General CS Fundamentals</option>
                <option>Data Structures & Algorithms</option>
                <option>System Design</option>
                <option>Web Development</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Difficulty</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm">
                <option>Mixed</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Number of Questions</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm">
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
            </div>
          </div>
          <Button className="w-full btn-gradient h-12 text-sm" onClick={() => setPhase("test")}>
            Start Assessment <ArrowRight className="ml-2 w-4 h-4" />
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

        <Button className="w-full btn-gradient h-12 text-sm" onClick={onProceed}>
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

// --- AI Interview Module ---
interface Message {
  role: "ai" | "user";
  text: string;
}

const initialMessages: Message[] = [
  { role: "ai", text: "Hello! I'm your AI interviewer. Your MCQ test is complete, let's move on to the conversational part. Can you tell me about yourself and your most recent project?" },
];

const AiModule = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const questionNum = Math.min(Math.ceil(messages.filter(m => m.role === "ai").length), 10);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { role: "user", text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    
    if (questionNum >= 10) {
      setMessages([...newMessages, {
        role: "ai",
        text: "Great job! That concludes our interview session. You demonstrated strong knowledge across multiple areas. I'd recommend focusing more on system design patterns for future interviews."
      }]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "You are an expert technical interviewer. The user is a candidate. Evaluate the user's previous answer briefly and then ask the next interview question. Keep it concise." }]
          },
          contents: newMessages.map(m => ({
            role: m.role === "ai" ? "model" : "user",
            parts: [{ text: m.text }]
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from Gemini API");
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't quite catch that. Could you please elaborate?";
      
      setMessages([...newMessages, { role: "ai", text: aiText }]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col max-w-4xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">AI Conversational Interview</h1>
          <p className="text-sm text-muted-foreground">Question {questionNum}/10</p>
        </div>
        <div className="w-48">
          <Progress value={(questionNum / 10) * 100} className="h-2 rounded-full" />
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 glass-card p-6 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === "ai" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
            }`}>
              {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "ai"
                ? "bg-muted text-foreground rounded-tl-md"
                : "bg-primary text-primary-foreground rounded-tr-md"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="glass-card p-3 flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your response..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground px-3"
          disabled={isLoading}
        />
        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
          <Mic className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          className="rounded-xl bg-primary text-primary-foreground" 
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

const MockInterview = () => {
  const [globalPhase, setGlobalPhase] = useState<"mcq" | "ai">("mcq");

  return (
    <DashboardLayout>
      {globalPhase === "mcq" ? (
        <McqModule onProceed={() => setGlobalPhase("ai")} />
      ) : (
        <AiModule />
      )}
    </DashboardLayout>
  );
};

export default MockInterview;
