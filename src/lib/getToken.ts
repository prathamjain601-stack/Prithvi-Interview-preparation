interface TokenRequest {
  roomName: string;
  participantName: string;
  metadata?: {
    jobRole: string;
    jdText: string;
  };
}

interface TokenResponse {
  token: string;
  url: string;
}

/**
 * Fetches a LiveKit participant token from the local development server.
 * The token allows the user to join a LiveKit room where the agent + avatar will auto-join.
 */
export async function getLivekitToken(request: TokenRequest): Promise<TokenResponse> {
  const response = await fetch('https://lvjeodfkjfonkfvluieg.supabase.co/functions/v1/livekit-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Token request failed: ${response.status}`);
  }

  return response.json();
}
