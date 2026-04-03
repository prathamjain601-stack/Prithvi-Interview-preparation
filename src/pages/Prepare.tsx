import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, FileText, Briefcase, Upload, ChevronDown, ChevronUp, Loader2, Download, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Point PDF.js to the locally bundled worker (served from localhost, no CDN needed)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type PrepMode = null | "theory" | "resume";

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

export const JOB_ROLES = [
  "Accessibility Engineer", "Ads Optimization Specialist", "Agile Coach", "AgriTech Engineer", "AI Engineer", "AI Ethics Specialist", "AI Product Manager", "AI Research Scientist", "AI Solutions Architect", "Algorithm Engineer", "Android Developer", "API Developer", "Application Security Engineer", "Application Support Engineer", "AR/VR Developer", "Artificial Intelligence Engineer", "Audio Engineer", "Augmented Reality Designer", "Automation Engineer", "Backend Developer", "Big Data Engineer", "Bioinformatics Data Scientist", "Bioinformatics Engineer", "Blockchain Developer", "Build Engineer", "Build and Release Engineer", "Business Analyst", "Business Intelligence Analyst", "Business Process Analyst", "Business Systems Analyst", "CAD Engineer", "Chatbot Developer", "Chief Information Officer (CIO)", "Chief Information Security Officer (CISO)", "Chief Technology Officer (CTO)", "Climate Tech Analyst", "Cloud Architect", "Cloud Automation Engineer", "Cloud Consultant", "Cloud Engineer", "Cloud Network Engineer", "Cloud Security Engineer", "Cloud Solutions Engineer", "Cognitive Systems Engineer", "Compliance Analyst", "Computer Graphics Developer", "Computer Vision Engineer", "Configuration Manager", "Content Engineer", "Content Strategist (Tech)", "CRM Administrator", "CRM Developer", "Customer Data Analyst", "Customer Success Engineer", "Cyber Security Analyst", "Cyber Security Engineer", "Cyber Threat Hunter", "Data Analyst", "Data Annotator", "Data Architect", "Data Collection Engineer", "Data Engineer", "Data Governance Analyst", "Data Labeling Specialist", "Data Migration Engineer", "Data Operations Analyst", "Data Platform Engineer", "Data Privacy Analyst", "Data Product Manager", "Data Quality Analyst", "Data Scientist", "Data Steward", "Data Visualization Engineer", "Data Warehouse Engineer", "Database Administrator (DBA)", "Database Developer", "Deep Learning Engineer", "Detection Engineer", "DevOps Engineer", "DevSecOps Engineer", "Digital Marketing Analyst", "Digital Signal Processing Engineer", "Digital Transformation Consultant", "Distributed Systems Engineer", "eCommerce Developer", "Edge AI Engineer", "Edge Computing Engineer", "EdTech Specialist", "Embedded Systems Engineer", "Enterprise Architect", "Enterprise Systems Engineer", "Ethical Hacker", "ETL Developer", "Financial Systems Analyst", "Firmware Engineer", "Firmware Security Engineer", "Frontend Developer", "Full Stack AI Engineer", "Full Stack Developer", "Game AI Developer", "Game Designer", "Game Developer", "Geospatial Engineer", "GIS Analyst", "Graphics Engineer", "Growth Engineer", "Hardware Design Engineer", "Hardware Engineer", "Healthcare IT Specialist", "Help Desk Engineer", "HPC Engineer", "Human-Computer Interaction (HCI) Specialist", "Identity and Access Management Engineer", "Identity Engineer", "Incident Responder", "Information Assurance Analyst", "Information Retrieval Engineer", "Information Security Analyst", "Infrastructure Automation Engineer", "Infrastructure Engineer", "Integration Architect", "Integration Engineer", "IoT Engineer", "IoT Solutions Architect", "IT Asset Manager", "IT Auditor", "IT Consultant", "IT Governance Analyst", "IT Operations Engineer", "IT Risk Manager", "IT Support Specialist", "IT Trainer", "Java Developer", "JavaScript Developer", "Kernel Developer", "Knowledge Engineer", "Knowledge Graph Engineer", "Kubernetes Engineer", "Lead Software Engineer", "Legal Tech Consultant", "Linux Administrator", "Localization Engineer", "Low-Code/No-Code Developer", "Machine Learning Engineer", "Machine Learning Ops Engineer", "Machine Learning Researcher", "Machine Vision Engineer", "Mainframe Developer", "MarTech Specialist", "Marketing Data Analyst", "Metaverse Developer", "Middleware Engineer", "Mobile App Developer", "Mobile DevOps Engineer", "Mobile Security Engineer", "Network Administrator", "Network Architect", "Network Engineer", "Network Operations Center (NOC) Engineer", "Network Security Engineer", "NLP Engineer", "NoSQL Database Engineer", "Observability Engineer", "Operating Systems Engineer", "Open Source Contributor (Professional)", "Operations Analyst", "Penetration Tester", "Penetration Testing Consultant", "Penetration Testing Engineer", "Performance Engineer", "Platform Engineer", "Platform Security Engineer", "Pre-Sales Engineer", "Privacy Engineer", "Process Engineer", "Product Analyst", "Product Manager", "Product Security Engineer", "Program Manager", "Project Manager", "QA Automation Engineer", "QA Engineer", "QA Lead", "Quantitative Analyst", "Quantum Computing Engineer", "Release Engineer", "Release Manager", "Reliability Engineer", "Requirements Engineer", "Research Scientist", "Revenue Operations Analyst", "Reverse Engineer", "Risk Analyst", "Robotics Engineer", "Robotics Process Automation (RPA) Developer", "SaaS Operations Engineer", "Sales Engineer", "Salesforce Developer", "SAP Consultant", "Scala Developer", "Search Engineer", "Search Quality Engineer", "Security Analyst", "Security Consultant", "Security Engineer", "Security Operations Engineer", "Security Researcher", "Semantic Web Engineer", "Service Delivery Manager", "Simulation Engineer", "Site Reliability Architect", "Site Reliability Engineer (SRE)", "Smart Contract Developer", "Social Media Tech Analyst", "SOC Analyst", "Software Architect", "Software Developer", "Software Engineer", "Software Engineering Manager", "Software Tester", "Solutions Architect", "Solutions Consultant", "Solutions Engineer", "Spatial Data Engineer", "Speech AI Engineer", "Speech Recognition Engineer", "SQL Developer", "Staff Software Engineer", "Storage Engineer", "Supply Chain Analyst", "Systems Analyst", "Systems Engineer", "Systems Integration Engineer", "Systems Programmer", "Technical Account Manager", "Technical Architect", "Technical Evangelist", "Technical Program Manager", "Technical Recruiter (IT)", "Technical Support Engineer", "Technical Writer", "Telecom Engineer", "Test Architect", "Test Automation Engineer", "Test Engineer", "Threat Detection Engineer", "Threat Intelligence Analyst", "UI Developer", "UI Engineer", "UI/UX Designer", "Usability Analyst", "UX Researcher", "Video Game Tester", "Video Streaming Engineer", "Virtualization Engineer", "VLSI Engineer", "Voice Engineer", "Vulnerability Analyst", "Web Designer", "Web Developer", "Web Performance Engineer", "Web Security Engineer", "Wireless Network Engineer", "WordPress Developer", "Workflow Automation Engineer", "XR Developer", "Yield Engineer"
].sort();

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
  const [roleInput, setRoleInput] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx");

    if (!isPdf && !isDocx) {
      toast.error("Unsupported file type. Please upload PDF or DOCX.");
      return;
    }

    setResumeFile(file);
    setIsLoading(true);

    try {
      let extractedText = "";
      if (isPdf) {
        extractedText = await parsePDF(file);
      } else {
        extractedText = await parseDOCX(file);
      }

      if (!extractedText || !extractedText.trim()) {
        throw new Error("No readable text found. The file may be scanned or image-based.");
      }

      setResumeText(extractedText);
      toast.success("Resume parsed successfully!");
    } catch (err: any) {
      console.error("Resume parsing failed:", err);
      toast.error(`Failed to parse: ${err.message || "Unknown error. Try a different file."}`);
      setResumeFile(null);
      setResumeText("");
    } finally {
      setIsLoading(false);
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

  const parsePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const textParts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      textParts.push(pageText);
    }
    return textParts.join("\n");
  };

  const parseDOCX = async (file: File): Promise<string> => {
    // Vite resolves mammoth's 'browser' field in package.json automatically
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default || mammothModule;
    const arrayBuffer = await file.arrayBuffer();
    const result = await (mammoth as any).extractRawText({ arrayBuffer });
    return result.value;
  };

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
        margin:      0, // Zero margin for the tool, we handle padding in CSS
        filename:    'Interview_Preparation_Slides.pdf',
        image:       { type: 'png', quality: 1 },
        html2canvas: {
          scale: 3, // Very high resolution for crisp text
          useCORS: true,
          letterRendering: true,
          logging: false,
          windowWidth: 1123, // A4 landscape width in px at 96dpi
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { mode: ['css', 'legacy'] }
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

  const handleGenerateResumeQuestions = async (append = false) => {
    if (!resumeText) {
      toast.error("Please upload a resume first.");
      return;
    }
    if (!roleInput.trim()) {
      toast.error("Please select or type a job role.");
      return;
    }
    
    setIsLoading(true);
    if (!append) setQuestions([]);
    
    try {
      const jdSection = jdText.trim()
        ? `\n\nJob Description:\n${jdText.substring(0, 3000)}\n\nUse the job description above to further tailor the questions to the specific role requirements, desired skills, and responsibilities mentioned.`
        : "";

      const prompt = `You are an expert technical interviewer. I will provide you with a candidate's resume text and a target role.${jdSection}
      Generate 10 highly realistic, practical interview questions tailored specifically to the candidate's experience, projects, and skills mentioned in their resume, focusing on the role of "${roleInput}".
      
      Resume Content:
      ${resumeText.substring(0, 4000)} 
      
      Difficulty level: ${difficulty}. 
      
      IMPORTANT: Write each answer in FIRST PERSON perspective, as if the candidate is answering the question themselves in an interview (e.g., "I implemented...", "In my project, I used..."). Do NOT write in third person (e.g., "The candidate should...", "They should...").
      
      Return the output STRICTLY as a JSON array of objects with the exact keys: "q" (the question), "a" (the concise answer formatted with markdown), "difficulty" ("easy", "medium", or "hard"), and "topics" (an array of strings). Do not include any markdown formatting like \`\`\`json, just the pure JSON array.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
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
      setQuestions(prev => append ? [...prev, ...parsedQuestions] : parsedQuestions);
      toast.success(`Successfully generated ${parsedQuestions.length} questions!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestions = (append = false) => {
    if (mode === "theory") {
      handleGenerateTheoryQuestions(append);
    } else if (mode === "resume") {
      handleGenerateResumeQuestions(append);
    }
  };

  const modes = [
    { key: "theory" as const, icon: BookOpen, title: "Theory-Based", desc: "Practice core CS concepts and fundamentals", color: "bg-primary/10 text-primary" },
    { key: "resume" as const, icon: FileText, title: "Resume & JD Based", desc: "Get questions tailored to your resume, role & job description", color: "bg-accent/10 text-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preparation</h1>
          <p className="text-muted-foreground mt-1">Choose how you want to prepare for your interviews.</p>
        </div>

        {/* Mode selection */}
        <div className="grid md:grid-cols-2 gap-4">
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
                {mode === "theory" ? "Select Topics" : "Upload Resume & Details"}
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
                <div className="space-y-5">
                  {/* Resume upload */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      Upload Resume <span className="text-destructive">*</span>
                    </label>
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      } ${resumeFile ? "bg-muted/30" : ""}`}
                    >
                      <input {...getInputProps()} />
                      {!resumeFile ? (
                        <>
                          <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
                          <p className="text-sm text-muted-foreground">
                            {isDragActive ? "Drop the file here..." : "Drag & drop your resume here, or click to browse"}
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
                                setResumeText("");
                              }}
                              className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Successfully parsed</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optional JD textarea */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> Paste Job Description <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                    </label>
                    <textarea
                      className="w-full h-32 rounded-xl border border-border bg-background p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Paste the job description here for more personalized questions..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0"></span>
                      For more personalization, you can also add a JD — but feeding your <strong>resume</strong> and <strong>job role</strong> are mandatory.
                    </p>
                  </div>
                </div>
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
                {mode === "resume" && (
                  <div className="relative" ref={dropdownRef}>
                    <Input 
                      placeholder="Select job role *" 
                      className="w-[280px] h-10 rounded-xl" 
                      value={roleInput}
                      onChange={(e) => {
                        setRoleInput(e.target.value);
                        setShowRoleDropdown(true);
                      }}
                      onFocus={() => setShowRoleDropdown(true)}
                    />
                    {showRoleDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {JOB_ROLES.filter(r => roleInput ? r.toLowerCase().startsWith(roleInput.toLowerCase()) : true).length > 0 ? (
                          <ul className="py-1">
                            {JOB_ROLES.filter(r => roleInput ? r.toLowerCase().startsWith(roleInput.toLowerCase()) : true).map(role => (
                              <li 
                                key={role}
                                className="px-4 py-2.5 text-sm hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => {
                                  setRoleInput(role);
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
                )}
                <Button 
                  className="btn-gradient text-sm px-6 py-2 h-auto"
                  onClick={() => handleGenerateQuestions(false)}
                  disabled={isLoading || (mode === "resume" && (!resumeFile || !roleInput.trim()))}
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
                    onClick={() => handleGenerateQuestions(true)}
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

      {/* Hidden container for PDF rendering — fully expanded, clean typography */}
      <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -9999, pointerEvents: 'none' }}>
      {/* Hidden container for PDF rendering — optimized for high-quality Landscape Slides */}
      <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -9999, pointerEvents: 'none' }}>
        <div
          id="pdf-content"
          style={{
            width: '1123px', // A4 Landscape width
            backgroundColor: '#ffffff',
            color: '#1a1a2e',
            fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
            boxSizing: 'border-box',
          }}
        >
          {questions.map((q, i) => (
            <div
              key={`pdf-slide-${i}`}
              className="pdf-slide"
              style={{
                width: '1123px',
                height: '794px', // A4 Landscape height
                padding: '60px 80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                pageBreakAfter: 'always',
                breakAfter: 'page',
                position: 'relative',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                border: '1px solid #f1f5f9'
              }}
            >
              {/* Slide Header / Branding */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #6366f1', paddingBottom: '15px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  AI Interview Preparation
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                  Slide {i + 1} of {questions.length}
                </span>
              </div>

              {/* Main Content Area (Vertically Centered) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '25px', padding: '20px 0' }}>
                {/* Question */}
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#6366f1', lineHeight: '1.2' }}>Q.</span>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {q.q}
                  </h2>
                </div>

                {/* Difficulty & Topics */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginLeft: '45px' }}>
                  <span style={{
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backgroundColor: q.difficulty === 'easy' ? '#dcfce7' : q.difficulty === 'medium' ? '#fef9c3' : '#fee2e2',
                    color: q.difficulty === 'easy' ? '#16a34a' : q.difficulty === 'medium' ? '#d97706' : '#dc2626',
                  }}>
                    {q.difficulty}
                  </span>
                  {q.topics?.map(topic => (
                    <span key={topic} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Answer Box */}
                <div style={{
                  marginLeft: '45px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '5px solid #6366f1',
                  borderRadius: '10px',
                  padding: '24px 30px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#334155',
                  wordBreak: 'break-word'
                }}>
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{q.a}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Slide Footer */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>
                Professional Interview Q&A Report • Generated by AI Preparation Platform
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
