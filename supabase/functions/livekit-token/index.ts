// Supabase Edge Function: Generate LiveKit participant tokens
// Deploy with: supabase functions deploy livekit-token
// Set secrets: supabase secrets set LIVEKIT_API_KEY=... LIVEKIT_API_SECRET=... LIVEKIT_URL=...

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  AccessToken,
  RoomConfiguration,
  RoomAgentDispatch,
} from 'npm:livekit-server-sdk@^2.15.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { roomName, participantName, metadata } = await req.json();

    if (!roomName || !participantName) {
      return new Response(
        JSON.stringify({ error: 'roomName and participantName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    const livekitUrl = Deno.env.get('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !livekitUrl) {
      throw new Error('Missing LiveKit environment variables');
    }

    // Create an access token for the participant
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
      ttl: '2h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // If metadata is provided (job role, JD), set it as participant metadata
    if (metadata) {
      at.metadata = JSON.stringify(metadata);
    }

    // Explicitly dispatch the interview agent to this room
    // This is required because the agent has agentName set,
    // which disables automatic dispatch
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: 'interview-agent',
          metadata: metadata ? JSON.stringify(metadata) : '',
        }),
      ],
    });

    const token = await at.toJwt();

    return new Response(
      JSON.stringify({ token, url: livekitUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate token' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
