import type { TranscriptMessage, InterviewScores } from './interviewSessionStore';

// ---------------------------------------------------------------------------
// Evaluate an interview transcript using Gemini
// ---------------------------------------------------------------------------

export interface EvaluationResult {
  scores: InterviewScores;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/**
 * Calls Gemini to evaluate the AI interview transcript.
 * Returns structured scores, feedback, strengths, and improvement areas.
 */
export async function evaluateInterview(
  transcript: TranscriptMessage[],
  jobRole: string,
  jdText: string
): Promise<EvaluationResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
  }

  // Build a readable transcript string
  const transcriptText = transcript
    .map((m) => `${m.role === 'agent' ? 'Interviewer' : 'Candidate'}: ${m.text}`)
    .join('\n');

  const prompt = `You are an expert interview evaluator. Analyze the following mock interview transcript for a "${jobRole}" role.

Job Description:
${jdText.substring(0, 2000)}

Interview Transcript:
${transcriptText.substring(0, 8000)}

Evaluate the candidate's performance and return a JSON object with EXACTLY these keys:
{
  "technical": <number 0-10>,
  "communication": <number 0-10>,
  "problemSolving": <number 0-10>,
  "confidence": <number 0-10>,
  "feedback": "<2-3 paragraph overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"]
}

Scoring guidelines:
- technical: How well did the candidate demonstrate technical knowledge relevant to the role?
- communication: How clearly and articulately did they express their ideas?
- problemSolving: How well did they approach problems, think through scenarios, and structure answers?
- confidence: How confident and composed did they appear? Did they handle pressure well?

Be fair but rigorous. Return ONLY the JSON object, no markdown formatting.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are an expert interview performance evaluator. Always respond with valid JSON only.' }],
          },
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(aiText);

    // Validate and clamp scores to 0-10
    const clamp = (v: unknown) => Math.max(0, Math.min(10, Number(v) || 0));

    return {
      scores: {
        technical: clamp(parsed.technical),
        communication: clamp(parsed.communication),
        problemSolving: clamp(parsed.problemSolving),
        confidence: clamp(parsed.confidence),
      },
      feedback: String(parsed.feedback || 'No feedback available.'),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [],
    };
  } catch (err) {
    console.error('[evaluateInterview] Failed:', err);

    // Return a safe fallback so the session still saves
    return {
      scores: { technical: 5, communication: 5, problemSolving: 5, confidence: 5 },
      feedback: 'Interview evaluation could not be completed. Please try again.',
      strengths: [],
      improvements: [],
    };
  }
}

/**
 * Compute the weighted overall score (0-100).
 * MCQ weight: 40%, Interview weight: 60%
 */
export function computeOverallScore(
  mcqScorePercent: number,
  interviewScores: InterviewScores
): number {
  const interviewAvg =
    (interviewScores.technical +
      interviewScores.communication +
      interviewScores.problemSolving +
      interviewScores.confidence) /
    4;
  const interviewPercent = interviewAvg * 10; // scale 0-10 → 0-100
  const overall = mcqScorePercent * 0.4 + interviewPercent * 0.6;
  return Math.round(overall * 10) / 10; // one decimal place
}
