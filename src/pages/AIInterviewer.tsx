import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bot, User, Send, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

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
    </DashboardLayout>
  );
};

export default AIInterviewer;
