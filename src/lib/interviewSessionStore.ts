import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface McqQuestionRecord {
  q: string;
  options: string[];
  correct: number;
  userAnswer: number | null;
}

export interface InterviewScores {
  technical: number;       // 0-10
  communication: number;   // 0-10
  problemSolving: number;  // 0-10
  confidence: number;      // 0-10
}

export interface TranscriptMessage {
  role: 'agent' | 'user';
  text: string;
  timestamp: number;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  job_role: string;
  created_at: string;
  mcq_total: number;
  mcq_correct: number;
  mcq_score: number;
  mcq_time_taken_seconds: number | null;
  mcq_questions: McqQuestionRecord[] | null;
  interview_transcript: TranscriptMessage[] | null;
  interview_duration_seconds: number | null;
  interview_scores: InterviewScores | null;
  interview_feedback: string | null;
  interview_strengths: string[] | null;
  interview_improvements: string[] | null;
  overall_score: number | null;
}

// ---------------------------------------------------------------------------
// Create a session (called after MCQ, before AI interview)
// ---------------------------------------------------------------------------

export async function createSession(
  userId: string,
  jobRole: string,
  mcqData: {
    questions: McqQuestionRecord[];
    correct: number;
    total: number;
    timeTakenSeconds: number;
  }
): Promise<string> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: userId,
      job_role: jobRole,
      mcq_total: mcqData.total,
      mcq_correct: mcqData.correct,
      mcq_time_taken_seconds: mcqData.timeTakenSeconds,
      mcq_questions: mcqData.questions,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[sessionStore] Failed to create session:', error);
    throw new Error('Failed to save MCQ results: ' + error.message);
  }

  console.log('[sessionStore] Session created:', data.id);
  return data.id;
}

// ---------------------------------------------------------------------------
// Update session with AI interview results (called when interview ends)
// ---------------------------------------------------------------------------

export async function updateInterviewResults(
  sessionId: string,
  data: {
    transcript: TranscriptMessage[];
    durationSeconds: number;
    scores: InterviewScores;
    feedback: string;
    strengths: string[];
    improvements: string[];
    overallScore: number;
  }
): Promise<void> {
  const { error } = await supabase
    .from('interview_sessions')
    .update({
      interview_transcript: data.transcript,
      interview_duration_seconds: data.durationSeconds,
      interview_scores: data.scores,
      interview_feedback: data.feedback,
      interview_strengths: data.strengths,
      interview_improvements: data.improvements,
      overall_score: data.overallScore,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('[sessionStore] Failed to update interview results:', error);
    throw new Error('Failed to save interview results: ' + error.message);
  }

  console.log('[sessionStore] Interview results saved for session:', sessionId);
}

// ---------------------------------------------------------------------------
// Fetch all sessions for a user (Performance page)
// ---------------------------------------------------------------------------

export async function getUserSessions(userId: string): Promise<InterviewSession[]> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[sessionStore] Failed to fetch sessions:', error);
    throw new Error('Failed to load sessions');
  }

  return (data ?? []) as InterviewSession[];
}

// ---------------------------------------------------------------------------
// Fetch a single session by ID (Session Report page)
// ---------------------------------------------------------------------------

export async function getSessionById(sessionId: string): Promise<InterviewSession | null> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('[sessionStore] Failed to fetch session:', error);
    return null;
  }

  return data as InterviewSession;
}
