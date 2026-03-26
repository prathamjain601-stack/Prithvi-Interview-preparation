import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bot, User, Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Message {
  role: "ai" | "user";
  text: string;
}

const initialMessages: Message[] = [
  { role: "ai", text: "Hello! I'm your AI interviewer. Let's start with a warm-up. Can you tell me about yourself and your most recent project?" },
];

const AIInterviewer = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const questionNum = Math.min(Math.ceil(messages.filter(m => m.role === "ai").length), 10);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    const aiResponse: Message = {
      role: "ai",
      text: questionNum >= 10
        ? "Great job! That concludes our interview session. You demonstrated strong knowledge across multiple areas. I'd recommend focusing more on system design patterns for future interviews."
        : [
            "That's a solid answer. Now, can you explain the difference between REST and GraphQL APIs?",
            "Good explanation. How would you design a caching strategy for a high-traffic application?",
            "Interesting approach. What design patterns have you used in production?",
            "Nice. Can you walk me through how you'd handle database scaling?",
            "Great insight. Tell me about a challenging bug you've debugged recently.",
            "Well articulated. How do you approach code reviews in your team?",
            "Good point. What's your experience with CI/CD pipelines?",
            "Excellent. How would you ensure security in a microservices architecture?",
          ][Math.min(questionNum - 1, 7)]
    };
    setMessages([...messages, userMsg, aiResponse]);
    setInput("");
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Interviewer</h1>
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
          />
          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
            <Mic className="w-4 h-4" />
          </Button>
          <Button size="icon" className="rounded-xl bg-primary text-primary-foreground" onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIInterviewer;
