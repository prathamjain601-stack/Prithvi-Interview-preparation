import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, FileText, Briefcase, Upload, ChevronDown, ChevronUp, Loader2, Download, Star } from "lucide-react";
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
  isImportant?: boolean;
}

const TOPIC_DATA = [
  {
    id: "Web Dev",
    subtopics: [
      "HTML5", "CSS3", "Flexbox", "Grid", "JavaScript (ES6+)", "React", "Angular", "Vue.js", "Next.js", "Svelte", "Tailwind CSS", "Bootstrap", "Sass", "SCSS", "Redux", "Zustand", "Recoil", "Node.js", "Express.js", "NestJS", "Django", "Flask", "Spring Boot", "Ruby on Rails", "ASP.NET Core", "MySQL", "PostgreSQL", "MongoDB", "Redis", "REST APIs", "GraphQL", "WebSockets", "Amazon Web Services", "Google Cloud Platform", "Microsoft Azure", "Docker", "Kubernetes", "GitHub Actions", "Jenkins", "Git", "GitHub", "GitLab", "JWT", "OAuth", "Firebase Authentication", "Webpack", "Vite", "npm", "yarn", "pnpm", "JAMstack", "Serverless", "Microservices", "Progressive Web Apps (PWA)", "Web3", "MERN Stack", "PERN Stack"
    ]
  },
  { id: "DSA", subtopics: [
    "Arrays", "Strings", "Linked List", "Doubly Linked List", "Circular Linked List", "Stack", "Queue", "Deque", "Priority Queue", "Heap", "Hashing", "Hash Map", "Hash Set", "Recursion", "Backtracking", "Divide and Conquer", "Greedy Algorithms", "Bit Manipulation", "Sliding Window", "Two Pointers", "Prefix Sum", "Binary Search", "Sorting Algorithms (Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort)", "Searching Algorithms", "Matrix/Grid Problems", "Trees", "Binary Tree", "Binary Search Tree (BST)", "AVL Tree", "Segment Tree", "Fenwick Tree (Binary Indexed Tree)", "Trie", "Graphs", "Graph Traversal (BFS, DFS)", "Shortest Path Algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall)", "Minimum Spanning Tree (Kruskal, Prim)", "Topological Sort", "Union Find (Disjoint Set Union)", "Dynamic Programming (DP)", "Memoization", "Tabulation", "Knapsack Problem", "Longest Common Subsequence (LCS)", "Longest Increasing Subsequence (LIS)", "Matrix Chain Multiplication", "Game Theory", "String Algorithms (KMP, Rabin-Karp, Z Algorithm)", "Computational Geometry"
  ] },
  { id: "ML", subtopics: [
    "Linear Algebra", "Probability", "Statistics", "Calculus", "Data Preprocessing", "Data Cleaning", "Feature Engineering", "Exploratory Data Analysis (EDA)", "Data Visualization", "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Classification", "Regression", "Clustering", "Dimensionality Reduction", "Model Evaluation", "Cross Validation", "Bias-Variance Tradeoff", "Overfitting", "Underfitting", "Regularization (L1, L2)", "Gradient Descent", "Stochastic Gradient Descent", "Loss Functions", "Optimization Algorithms (Adam, RMSProp)", "Decision Trees", "Random Forest", "Support Vector Machines (SVM)", "K-Nearest Neighbors (KNN)", "Naive Bayes", "Ensemble Learning", "Boosting (AdaBoost, Gradient Boosting, XGBoost)", "Neural Networks", "Deep Learning", "Artificial Neural Networks (ANN)", "Convolutional Neural Networks (CNN)", "Recurrent Neural Networks (RNN)", "LSTM", "GRU", "Transfer Learning", "Natural Language Processing (NLP)", "Tokenization", "Word Embeddings (Word2Vec, GloVe)", "Transformers", "Attention Mechanism", "Computer Vision", "Image Processing", "Object Detection", "Image Segmentation", "Generative AI", "GANs (Generative Adversarial Networks)", "Autoencoders", "Large Language Models (LLMs)", "Prompt Engineering", "Model Deployment", "MLOps", "Model Monitoring", "Hyperparameter Tuning", "Grid Search", "Random Search", "Bayesian Optimization"
  ] },
  { id: "AI", subtopics: [
    "Artificial Intelligence Fundamentals", "Intelligent Agents", "Rationality", "Problem Solving", "State Space Search", "Uninformed Search (BFS, DFS, Uniform Cost Search)", "Informed Search (Greedy Best-First Search, A* Search)", "Heuristics", "Constraint Satisfaction Problems (CSP)", "Knowledge Representation", "Logical Reasoning", "Propositional Logic", "First Order Logic", "Inference", "Planning", "Game Playing", "Adversarial Search (Minimax, Alpha-Beta Pruning)", "Markov Decision Processes (MDP)", "Decision Theory", "Utility Theory", "Probabilistic Reasoning", "Bayesian Networks", "Hidden Markov Models (HMM)", "Fuzzy Logic", "Expert Systems", "Machine Learning Basics", "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Deep Learning", "Neural Networks", "Natural Language Processing (NLP)", "Computer Vision", "Robotics", "Perception", "Localization", "Path Planning", "Multi-Agent Systems", "Evolutionary Algorithms", "Genetic Algorithms", "Swarm Intelligence", "Ethics in AI"
  ] },
  { id: "Cyber Security", subtopics: [
    "Network Security", "Information Security", "Cyber Security Fundamentals", "Cryptography", "Encryption", "Decryption", "Symmetric Key Cryptography", "Asymmetric Key Cryptography", "Public Key Infrastructure (PKI)", "Hashing", "Digital Signatures", "Authentication", "Authorization", "Access Control", "Identity and Access Management (IAM)", "Multi-Factor Authentication (MFA)", "Firewalls", "Intrusion Detection System (IDS)", "Intrusion Prevention System (IPS)", "Virtual Private Network (VPN)", "Secure Communication (SSL/TLS)", "Wireshark", "Nmap", "Metasploit", "Penetration Testing", "Vulnerability Assessment", "Ethical Hacking", "Social Engineering", "Phishing", "Malware", "Viruses", "Worms", "Trojans", "Ransomware", "Spyware", "Rootkits", "Keyloggers", "Web Security", "OWASP Top 10", "SQL Injection", "Cross-Site Scripting (XSS)", "Cross-Site Request Forgery (CSRF)", "Secure Coding Practices", "Application Security", "Cloud Security", "Endpoint Security", "Mobile Security", "IoT Security", "Digital Forensics", "Incident Response", "Threat Intelligence", "Security Operations Center (SOC)", "Risk Management", "Compliance (ISO 27001, GDPR)", "Security Auditing", "Zero Trust Architecture"
  ] },
  { id: "IoT", subtopics: [
    "Embedded Systems", "Microcontrollers", "Sensors", "Actuators", "GPIO", "Analog & Digital Signals", "Firmware Development", "Real-Time Operating Systems (RTOS)", "Edge Computing", "Fog Computing", "IoT Architecture", "Device Connectivity", "Networking Protocols (TCP/IP, UDP)", "Communication Protocols (MQTT, CoAP, HTTP, Bluetooth, Zigbee, LoRaWAN)", "Wireless Communication", "Wi-Fi", "RFID", "Near Field Communication (NFC)", "Data Acquisition", "Data Transmission", "Cloud Integration", "Amazon Web Services IoT", "Microsoft Azure IoT", "Google Cloud Platform IoT", "IoT Platforms", "Device Management", "Remote Monitoring", "Data Analytics", "Stream Processing", "Big Data", "Machine Learning in IoT", "AIoT (AI + IoT)", "Digital Twins", "Security in IoT", "Device Authentication", "Encryption", "Firmware Updates (OTA)", "Power Management", "Low Power Design", "Battery Optimization", "Industrial IoT (IIoT)", "Smart Homes", "Smart Cities", "Wearable Devices", "Autonomous Systems"
  ] },
  { id: "DBMS", subtopics: [
    "Database Systems", "Data Models", "Entity Relationship Model (ER Model)", "Relational Model", "Schema", "Instance", "Keys (Primary Key, Foreign Key, Candidate Key, Super Key)", "Normalization (1NF, 2NF, 3NF, BCNF)", "Functional Dependency", "SQL (Structured Query Language)", "DDL (Data Definition Language)", "DML (Data Manipulation Language)", "DCL (Data Control Language)", "TCL (Transaction Control Language)", "Joins (Inner Join, Left Join, Right Join, Full Join)", "Subqueries", "Views", "Indexing", "B+ Trees", "Hashing", "Transactions", "ACID Properties", "Concurrency Control", "Locking", "Deadlocks", "Serializability", "Recovery Techniques", "Log-Based Recovery", "Database Security", "Authorization", "Data Integrity", "Constraints", "Triggers", "Stored Procedures", "Query Processing", "Query Optimization", "Distributed Databases", "NoSQL Databases", "CAP Theorem", "Data Warehousing", "OLAP", "Data Mining"
  ] },
  { id: "CN", subtopics: [
    "Computer Networks Fundamentals", "Network Topologies", "OSI Model", "TCP/IP Model", "Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer", "Session Layer", "Presentation Layer", "Application Layer", "IP Addressing (IPv4, IPv6)", "Subnetting", "Supernetting", "Routing", "Switching", "ARP (Address Resolution Protocol)", "RARP", "ICMP", "DHCP", "DNS", "NAT (Network Address Translation)", "TCP (Transmission Control Protocol)", "UDP (User Datagram Protocol)", "HTTP", "HTTPS", "FTP", "SMTP", "POP3", "IMAP", "Telnet", "SSH", "Network Security Basics", "Firewalls", "Congestion Control", "Flow Control", "Error Detection (CRC, Checksum)", "Error Correction", "Multiplexing", "Demultiplexing", "Quality of Service (QoS)", "Wireless Networks", "Wi-Fi", "Bluetooth", "Mobile Networks", "4G", "5G"
  ] },
  { id: "CNS", subtopics: [
    "Cryptography", "Encryption", "Decryption", "Symmetric Key Cryptography", "Asymmetric Key Cryptography", "Public Key Infrastructure (PKI)", "Hash Functions", "Digital Signatures", "Message Authentication Codes (MAC)", "Authentication", "Authorization", "Access Control", "Identity and Access Management (IAM)", "Multi-Factor Authentication (MFA)", "Network Security", "Information Security", "Firewalls", "Intrusion Detection System (IDS)", "Intrusion Prevention System (IPS)", "Virtual Private Network (VPN)", "Secure Communication (SSL/TLS)", "Wireshark", "Nmap", "Metasploit", "Penetration Testing", "Vulnerability Assessment", "Ethical Hacking", "Malware", "Viruses", "Worms", "Trojans", "Ransomware", "Spyware", "Rootkits", "Keyloggers", "Web Security", "OWASP Top 10", "SQL Injection", "Cross-Site Scripting (XSS)", "Cross-Site Request Forgery (CSRF)", "Security Policies", "Risk Management", "Threat Modeling", "Incident Response", "Digital Forensics", "Security Auditing", "Compliance (ISO 27001, GDPR)", "Zero Trust Architecture"
  ] },
  { id: "DevOps", subtopics: [
    "Version Control", "Git", "Branching", "Merging", "CI/CD (Continuous Integration & Continuous Deployment)", "Continuous Delivery", "Build Automation", "Jenkins", "GitHub Actions", "GitLab CI/CD", "Containerization", "Docker", "Container Orchestration", "Kubernetes", "Infrastructure as Code (IaC)", "Terraform", "Ansible", "Configuration Management", "Deployment Automation", "Monitoring", "Logging", "Prometheus", "Grafana", "Cloud Computing", "Amazon Web Services", "Microsoft Azure", "Google Cloud Platform", "Serverless Architecture", "Microservices Architecture", "Load Balancing", "Reverse Proxy", "Nginx", "Apache HTTP Server", "Security in DevOps (DevSecOps)", "Secrets Management", "Scaling", "High Availability", "Blue-Green Deployment", "Canary Deployment"
  ] },
  { id: "MLOps", subtopics: [
    "Machine Learning Lifecycle", "Data Collection", "Data Preprocessing", "Data Validation", "Data Versioning", "Feature Engineering", "Feature Store", "Model Training", "Model Evaluation", "Model Validation", "Experiment Tracking", "Hyperparameter Tuning", "Model Versioning", "Model Registry", "Model Deployment", "Batch Inference", "Real-Time Inference", "CI/CD for ML", "Continuous Training (CT)", "Continuous Monitoring", "Model Monitoring", "Data Drift", "Concept Drift", "Model Retraining", "Pipeline Orchestration", "Workflow Automation", "MLflow", "Kubeflow", "Apache Airflow", "Docker", "Kubernetes", "TensorFlow Serving", "TorchServe", "Amazon Web Services SageMaker", "Google Cloud Platform AI Platform", "Microsoft Azure ML", "Monitoring Tools", "Logging", "Security", "Governance"
  ] },
  { id: "Programming Languages", subtopics: [
    "C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "Dart", "R", "MATLAB", "Scala", "Objective-C", "Bash/Shell", "PowerShell", "Assembly Language"
  ] },
  { id: "System Design", subtopics: [
    "System Design Fundamentals", "Scalability", "High Availability", "Reliability", "Fault Tolerance", "Load Balancing", "Horizontal Scaling", "Vertical Scaling", "Latency", "Throughput", "CAP Theorem", "Consistency Models (Strong, Eventual)", "Caching", "Cache Invalidation", "Content Delivery Network (CDN)", "Database Design", "SQL vs NoSQL", "Sharding", "Replication", "Indexing", "Microservices Architecture", "Monolithic Architecture", "Service-Oriented Architecture (SOA)", "API Design", "REST", "GraphQL", "Message Queues", "Event-Driven Architecture", "Publish-Subscribe Model", "Stream Processing", "Distributed Systems", "Consensus Algorithms (Raft, Paxos)", "Rate Limiting", "Throttling", "Circuit Breaker Pattern", "Backpressure", "Security", "Authentication", "Authorization", "Observability", "Logging", "Monitoring", "Alerting", "Distributed Tracing", "Data Partitioning", "Data Consistency", "Leader Election", "Idempotency"
  ] },
  { id: "OOPS", subtopics: [
    "Object-Oriented Programming (OOP)", "Class", "Object", "Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "Method Overloading", "Method Overriding", "Constructors", "Destructors", "Access Specifiers (Public, Private, Protected)", "Interfaces", "Abstract Classes", "Dynamic Binding", "Static Binding", "Message Passing", "Association", "Aggregation", "Composition", "SOLID Principles (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion)", "Design Patterns (Creational, Structural, Behavioral)", "Singleton Pattern", "Factory Pattern", "Observer Pattern", "Strategy Pattern"
  ] },
];

const Prepare = () => {
  const [mode, setMode] = useState<PrepMode>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [selectedSubtopics, setSelectedSubtopics] = useState<Record<string, string[]>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [difficulty, setDifficulty] = useState("All Difficulties");

  const toggleImportant = (index: number) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, isImportant: !q.isImportant } : q));
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;
    
    setIsDownloading(true);
    try {
      // @ts-ignore
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default ? html2pdfModule.default : html2pdfModule;
      
      const opt = {
        margin:       0.5,
        filename:     'Interview_QA.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await (html2pdf as any)().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.");
    } finally {
        setIsDownloading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      if (activeTopic === topicId) {
        setActiveTopic(null);
        setSelectedTopics(prev => prev.filter(t => t !== topicId));
        const newSubtopics = { ...selectedSubtopics };
        delete newSubtopics[topicId];
        setSelectedSubtopics(newSubtopics);
      } else {
        setActiveTopic(topicId);
      }
    } else {
      setSelectedTopics(prev => [...prev, topicId]);
      setActiveTopic(topicId);
    }
  };

  const toggleSubtopic = (topicId: string, sub: string) => {
    setSelectedSubtopics(prev => {
      const current = prev[topicId] || [];
      const updated = current.includes(sub)
        ? current.filter(s => s !== sub)
        : [...current, sub];
      return { ...prev, [topicId]: updated };
    });
  };

  const handleGenerateTheoryQuestions = async (append = false) => {
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic.");
      return;
    }
    
    setIsLoading(true);
    if (!append) {
      setQuestions([]);
    }
    
    try {
      let topicStringParts = [];
      for (const t of selectedTopics) {
        const subs = selectedSubtopics[t] || [];
        if (subs.length > 0) {
          topicStringParts.push(`${t} (specifically focusing on: ${subs.join(", ")})`);
        } else {
          topicStringParts.push(t);
        }
      }
      const topicsForPrompt = topicStringParts.join("; ");

      const prompt = `You are an expert technical interviewer at a top tech company (e.g., FAANG). Generate 10 highly realistic, practical interview questions based on the following topics: ${topicsForPrompt}. Difficulty level: ${difficulty}. 
      
Make sure these are the EXACT types of questions asked in real industry interviews right now. Keep the detailed answers extremely concise and straight to the point to save time. 

Return the output STRICTLY as a JSON array of objects with the exact keys: "q" (the question), "a" (the concise answer formatted with markdown - use \\n\\n for line breaks and standard markdown lists, NEVER use HTML tags like <br>), "difficulty" ("easy", "medium", or "hard"), and "topics" (an array of strings indicating which topics the question is based on, e.g. ["Web Dev", "ML"]). Do not include any markdown formatting like \`\`\`json, just the pure JSON array.`;

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
      aiText = aiText.replace(/```json/g, "").replace(/```/g, "").replace(/<br\s*\/?>/gi, "\\n\\n").trim();
      
      const parsedQuestions: Question[] = JSON.parse(aiText);
      setQuestions(prev => append ? [...prev, ...parsedQuestions] : parsedQuestions);
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
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_DATA.map(topicObj => (
                      <button 
                        key={topicObj.id} 
                        onClick={() => toggleTopic(topicObj.id)}
                        className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                          selectedTopics.includes(topicObj.id)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary hover:bg-primary/5 text-foreground bg-background"
                        }`}
                      >
                        {topicObj.id}
                      </button>
                    ))}
                  </div>

                  {/* Render Subtopics for active topic */}
                  {activeTopic && selectedTopics.includes(activeTopic) && [activeTopic].map(tId => {
                    const tData = TOPIC_DATA.find(d => d.id === tId);
                    if (!tData || tData.subtopics.length === 0) return null;
                    return (
                      <div key={tId} className="p-4 rounded-xl bg-muted/30 border border-border mt-2 animate-fade-in">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tId} Subtopics</h4>
                          <button
                            onClick={() => {
                              setSelectedSubtopics(prev => {
                                const current = prev[tId] || [];
                                if (current.length === tData.subtopics.length) {
                                  return { ...prev, [tId]: [] };
                                } else {
                                  return { ...prev, [tId]: [...tData.subtopics] };
                                }
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border transition-colors ${
                              selectedSubtopics[tId]?.length === tData.subtopics.length
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-background"
                            }`}
                          >
                            All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                          {tData.subtopics.map(sub => (
                            <button 
                              key={sub}
                              onClick={() => toggleSubtopic(tId, sub)}
                              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                                (selectedSubtopics[tId] || []).includes(sub)
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-background"
                              }`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
                  onClick={mode === "theory" ? () => handleGenerateTheoryQuestions(false) : undefined}
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
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleImportant(i); }}
                          className={`p-1.5 rounded-full transition-colors ${q.isImportant ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500" : "hover:bg-muted text-muted-foreground hover:text-yellow-500"}`}
                          title={q.isImportant ? "Remove from Important" : "Mark as Important"}
                        >
                          <Star className={`w-4 h-4 ${q.isImportant ? "fill-current" : ""}`} />
                        </button>
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
                <div className="pt-4 pb-2 flex justify-center gap-4">
                  <Button 
                    variant="default"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || questions.length === 0}
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Download as PDF
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 flex items-center"
                    onClick={() => handleGenerateTheoryQuestions(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Generate More Questions
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden container strictly for PDF rendering containing ALL questions fully expanded */}
      <div className="absolute overflow-hidden pointer-events-none opacity-0" style={{ left: '-9999px', top: '-9999px' }}>
        <div id="pdf-content" className="p-8 bg-white text-black min-h-screen" style={{ width: '800px' }}>
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8 pb-4 border-b border-gray-200">Interview Preparation Q&A</h1>
          <div className="space-y-12">
            {questions.map((q, i) => (
              <div key={`pdf-q-${i}`} className="pb-8 border-b border-gray-200" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-2">
                  {q.isImportant && <span className="text-yellow-500 mt-0.5">★</span>}
                  <span>Q{i + 1}: {q.q}</span>
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs font-bold rounded bg-indigo-100 text-indigo-800 uppercase tracking-wider">{q.difficulty}</span>
                  {q.topics?.map(topic => (
                    <span key={`pdf-t-${topic}`} className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">{topic}</span>
                  ))}
                </div>
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  <ReactMarkdown>{q.a}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Prepare;
