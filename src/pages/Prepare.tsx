import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, FileText, Briefcase, Upload, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type PrepMode = null | "theory" | "resume" | "jd";

interface Question {
  q: string;
  a: string;
  difficulty: "easy" | "medium" | "hard";
  topics: string[];
}

const ALL_TOPICS = [
  "Web Dev", "DSA", "ML", "AI", "Cyber Security", "IoT", 
  "DBMS", "CN", "CNS", "DevOps", "MLOps", 
  "Programming Languages", "System Design", "OOP"
];

const Prepare = () => {
  const [mode, setMode] = useState<PrepMode>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("All Difficulties");

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleGenerateTheoryQuestions = async () => {
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic.");
      return;
    }
    
    setIsLoading(true);
    setQuestions([]);
    
    try {
      const prompt = `You are an expert technical interviewer at a top tech company (e.g., FAANG). Generate 10 highly realistic, practical interview questions based on the following topics: ${selectedTopics.join(", ")}. Difficulty level: ${difficulty}. 
      
Make sure these are the EXACT types of questions asked in real industry interviews right now. Keep the detailed answers extremely concise and straight to the point to save time. 

Return the output STRICTLY as a JSON array of objects with the exact keys: "q" (the question), "a" (the concise answer formatting with markdown), "difficulty" ("easy", "medium", or "hard"), and "topics" (an array of strings indicating which topics the question is based on, e.g. ["Web Dev", "ML"]). Do not include any markdown formatting like \`\`\`json, just the pure JSON array.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "You are an expert technical interviewer. Produce strictly JSON arrays." }]
          },
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from Gemini API");
      }

      const data = await response.json();
      let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
      // Attempt to clean the text in case DeepSeek includes markdown
      aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsedQuestions: Question[] = JSON.parse(aiText);
      setQuestions(parsedQuestions);
      toast.success(`Successfully generated ${parsedQuestions.length} questions!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const modes = [
    { key: "theory" as const, icon: BookOpen, title: "Theory-Based", desc: "Practice core CS concepts and fundamentals", color: "bg-primary/10 text-primary" },
    { key: "resume" as const, icon: FileText, title: "Resume-Based", desc: "Get questions tailored to your experience", color: "bg-accent/10 text-accent" },
    { key: "jd" as const, icon: Briefcase, title: "JD-Based", desc: "Prepare for a specific job description", color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preparation</h1>
          <p className="text-muted-foreground mt-1">Choose how you want to prepare for your interviews.</p>
        </div>

        {/* Mode selection */}
        <div className="grid md:grid-cols-3 gap-4">
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`glass-card p-6 text-left transition-all duration-300 hover:-translate-y-1 ${mode === m.key ? "ring-2 ring-primary" : ""}`}
            >
              <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center mb-4`}>
                <m.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Dynamic content based on mode */}
        {mode && (
          <div className="space-y-6 animate-fade-up">
            {/* Filters / Upload */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground">
                {mode === "theory" ? "Select Topics" : mode === "resume" ? "Upload Resume" : "Paste Job Description"}
              </h3>

              {mode === "theory" && (
                <div className="flex flex-wrap gap-2">
                  {ALL_TOPICS.map(topic => (
                    <button 
                      key={topic} 
                      onClick={() => toggleTopic(topic)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                        selectedTopics.includes(topic)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary hover:bg-primary/5 text-foreground"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}

              {mode === "resume" && (
                <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Drag & drop your resume here, or click to browse</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX up to 5MB</p>
                </div>
              )}

              {mode === "jd" && (
                <textarea
                  className="w-full h-32 rounded-xl border border-border bg-background p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Paste the job description here..."
                />
              )}

              <div className="flex flex-wrap gap-3 items-center">
                <select 
                  className="px-4 py-2 rounded-xl border border-border bg-background text-sm"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option>All Difficulties</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                {mode !== "theory" && (
                  <Input placeholder="Filter by role..." className="max-w-xs h-10 rounded-xl" />
                )}
                <Button 
                  className="btn-gradient text-sm px-6 py-2 h-auto"
                  onClick={mode === "theory" ? handleGenerateTheoryQuestions : undefined}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Generate Questions
                </Button>
              </div>
            </div>

            {/* Questions */}
            {/* Questions */}
            {questions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Generated Questions</h3>
                {questions.map((q, i) => (
                  <div key={i} className="glass-card overflow-hidden">
                    <button
                      onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-6">Q{i + 1}</span>
                        <span className="text-sm font-medium text-foreground">{q.q}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className={q.difficulty === "easy" ? "tag-easy" : q.difficulty === "medium" ? "tag-medium" : "tag-hard"}>
                          {q.difficulty}
                        </span>
                        {expandedQ === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {expandedQ === i && (
                      <div className="px-5 pb-5 pt-0 border-t border-border">
                        <div className="flex flex-wrap gap-2 mt-4 mb-3">
                          {q.topics?.map(topic => (
                            <span key={topic} className="px-2 py-1 text-xs rounded-md bg-secondary/50 text-secondary-foreground border border-border">
                              {topic}
                            </span>
                          ))}
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed mt-4">
                          <ReactMarkdown>{q.a}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Prepare;
