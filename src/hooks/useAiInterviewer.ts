import { useState, useEffect, useCallback } from 'react';
import { getLivekitToken } from '@/lib/getToken';

interface RoomSession {
  token: string;
  url: string;
  roomName: string;
}

/**
 * Hook to manage the AI interview session lifecycle.
 *
 * The actual interview logic (STT, LLM, TTS, avatar) is handled entirely
 * by the backend LiveKit agent. This hook only:
 *   1. Creates a LiveKit room and obtains a user token
 *   2. Tracks connection status
 *   3. Provides the session data for <LiveKitRoom> to connect
 */
export function useAiInterviewer(context: { jobRole: string; jdText: string; resumeText: string }) {
  const [session, setSession] = useState<RoomSession | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    try {
      const roomName = `interview-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const participantName = 'Candidate';

      const { token, url } = await getLivekitToken({
        roomName,
        participantName,
        metadata: {
          jobRole: context.jobRole,
          jdText: context.jdText,
          resumeText: context.resumeText,
        },
      });

      setSession({ token, url, roomName });
      setStatus('connected');
    } catch (err) {
      console.error('Failed to start interview session:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setStatus('error');
    }
  }, [context.jobRole, context.jdText, context.resumeText]);

  // Auto-start session on mount
  useEffect(() => {
    startSession();
  }, [startSession]);

  return {
    session,
    status,
    error,
    retry: startSession,
  };
}
