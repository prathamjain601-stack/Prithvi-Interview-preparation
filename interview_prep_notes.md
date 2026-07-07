# 🛠️ Tech Stack & Tools Explained (The "What" & "Why")

Think of this project as a house. The different technologies are the bricks, plumbing, and electricity that make it work.

### 1. The Core UI (The Bricks & Mortar)
*   **React (v18):** The main library used to build the user interface. It lets you create reusable blocks of code (components) like buttons, forms, and video players.
*   **Vite:** The engine that runs your code locally and builds it for production. It is incredibly fast compared to older tools (like Webpack), making development smooth.
*   **TypeScript:** It's like JavaScript but with "rules." It checks for errors *before* you run the code, preventing silly mistakes and making the codebase very stable.

### 2. Styling & Design (The Paint & Decor)
*   **Tailwind CSS:** A tool that lets you style your website by adding simple class names directly to your HTML/React elements (e.g., `text-center`, `bg-blue-500`). It removes the need to write messy CSS files.
*   **Shadcn UI & Radix UI:** A collection of pre-built, accessible, and beautiful components (like Dropdowns, Progress bars, Modals). It saves hundreds of hours because you don't have to build complex UI elements from scratch.

### 3. Authentication & Database (The Security & Vault)
*   **Clerk:** This manages user logins, sign-ups, and security. Instead of building a complex login system from scratch (and worrying about getting hacked), Clerk handles it securely out-of-the-box.
*   **Supabase:** This is your backend database (built on PostgreSQL). It acts as the "memory" of your app, storing user data, past interview transcripts, MCQ scores, and overall performance history. 

### 4. The AI & Real-Time Video (The "Magic" Brain)
*   **LiveKit:** This handles the real-time audio and video connection. When a user talks, LiveKit streams their voice instantly to the AI, and streams the AI's video back to the user with extremely low lag (latency).
*   **Beyond Presence Plugin:** This is the specific tool that generates the realistic, real-time visual Avatar of the AI interviewer.
*   **Google Gemini 2.5 Flash:** The core "Brain" of the application. It is used in three main ways:
    1.  To read the Job Description and generate custom Multiple Choice Questions (MCQs).
    2.  To act as the intelligence behind the real-time Voice AI.
    3.  To read the final transcript of the interview and grade the candidate.
*   **PDF.js:** A tool running in the browser that reads the user's uploaded Resume PDF and extracts the text so the AI can understand the candidate's background.

---

# 💻 Key Features & Pseudo-Code (For Your Interview)

Here are the three biggest features of your app, explained with simple "Pseudo-code" (code that reads like plain English) so you can explain the logic perfectly to an interviewer.

### Feature 1: Dynamic MCQ Generation
**Interview Explanation:** *"Before the video interview, we test the user's basic knowledge. We ask them to upload a Resume and paste a Job Description. We extract text from the PDF locally, send it to Google Gemini, and ask it to generate exactly 12 multiple-choice questions in a strict JSON format."*

**Pseudo-Code:**
```text
FUNCTION startAssessment():
    // 1. Get user inputs
    resumeText = extractTextFromUploadedPDF(resumeFile)
    jobDescription = getTextInputFromUser()

    // 2. Create a prompt for the AI
    prompt = "You are an interviewer. Based on this Job Description, 
              generate 12 technical multiple-choice questions. 
              Return the output as a JSON list."

    // 3. Call Gemini AI
    aiResponse = callGeminiAPI(prompt, jobDescription)
    
    // 4. Show to user
    questionsList = parseJSON(aiResponse)
    displayQuestionsOnScreen(questionsList)
    
    startTimer(6_minutes)
END FUNCTION
```

### Feature 2: The Real-Time Live AI Interview
**Interview Explanation:** *"For the actual interview, we use LiveKit to create a real-time web-RTC room. The frontend connects to this room using a token. On the backend, a Node.js agent connects to the same room. The agent uses Beyond Presence to render an Avatar and uses Speech-to-Text and Text-to-Speech to hold a natural, low-latency conversation with the candidate."*

**Pseudo-Code:**
```text
// FRONTEND LOGIC
FUNCTION joinLiveInterviewRoom():
    // 1. Get permission to enter the room
    connectionToken = fetchTokenFromBackend()
    
    // 2. Connect to the LiveKit Room (turns on microphone)
    connectToRoom(serverUrl, connectionToken, microphone = ON)
    
    // 3. Listen for the Avatar's video track and show it
    avatarVideo = findAvatarTrackInRoom()
    displayVideoOnScreen(avatarVideo)
    
    // 4. Save what is being spoken
    ON "TranscriptionReceived" EVENT:
        addSpokenWordsToTranscript(text, speaker)
END FUNCTION
```

### Feature 3: AI Interview Evaluation & Grading
**Interview Explanation:** *"When the candidate ends the call, we don't just say goodbye. We take the entire transcript of the conversation and send it back to Gemini. We ask the AI to act as a strict hiring manager and grade the candidate out of 10 on technical skills, communication, problem-solving, and confidence, and save those results to our Supabase database."*

**Pseudo-Code:**
```text
FUNCTION evaluateAndSaveInterview(transcript, jobRole):
    // 1. Prepare the data
    prompt = "Evaluate this interview transcript for a " + jobRole + ". 
              Give scores out of 10 for Technical, Communication, 
              Problem Solving, and Confidence. Include strengths and weaknesses."
              
    // 2. Call AI for evaluation
    evaluationResult = callGeminiAPI(prompt, transcript)
    
    // 3. Calculate Final Score
    mcqWeight = 40%
    interviewWeight = 60%
    finalScore = (mcqScore * mcqWeight) + (evaluationResult.average * interviewWeight)
    
    // 4. Save to Database
    saveToSupabaseDatabase(
        userId, 
        transcript, 
        evaluationResult, 
        finalScore
    )
    
    // 5. Show results page
    redirectToPerformanceDashboard()
END FUNCTION
```

### 💡 Interview Tip for You:
If the interviewer asks **"What was the hardest part of building this?"**
A great answer based on this tech stack is: 
> *"Managing the real-time state between the LiveKit room, the AI Agent, and the React frontend. Ensuring the Live transcription matched up perfectly with the Avatar's speech, and making sure we gracefully handled scenarios where the user's internet dropped before we could send the final transcript to Gemini for evaluation."*
