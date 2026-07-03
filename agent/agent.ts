import 'dotenv/config';
import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { AvatarSession } from '@livekit/agents-plugin-bey';
// Silero VAD is now bundled in @livekit/agents v1.5+ — no separate import needed.
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Global safety net — prevent the process from crashing on unhandled errors.
// Without this, a single Gemini API 429 or network blip kills the agent.
// ---------------------------------------------------------------------------
process.on('unhandledRejection', (reason, promise) => {
  console.error('[agent] ⚠️ Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[agent] ⚠️ Uncaught exception:', err);
});

// ---------------------------------------------------------------------------
// Beyond Presence AI Interview Agent
// ---------------------------------------------------------------------------
// Uses:
//   - Google Gemini as the LLM (native plugin, reads GOOGLE_API_KEY)
//   - LiveKit Inference for STT (Deepgram) and TTS (Cartesia)
//   - Beyond Presence for the realistic avatar video
// ---------------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY!;
const BEY_AVATAR_ID = process.env.BEY_AVATAR_ID || '2ed7477f-3961-4ce1-b331-5e4530c55a57';

const DEFAULT_SYSTEM_PROMPT = `You are Arjun Verma, a senior technical interviewer at a top tech company.
You are conducting a live mock interview. Be professional, friendly, and encouraging.
Ask one question at a time. Wait for the candidate to respond before asking the next question.
Keep your responses concise and natural — you are speaking aloud, not writing an essay.
Evaluate answers for correctness, clarity, and depth. Provide brief feedback after each answer.
After 4-5 questions, wrap up with a summary of strengths and areas for improvement.`;

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log('[agent] Job received...');
    // VAD is now bundled in @livekit/agents v1.5+ — no explicit load needed.

    // 1. Connect to the room
    await ctx.connect();
    console.log('[agent] Connected to room:', ctx.room.name);

    // 2. Wait for a participant to join
    console.log('[agent] Waiting for participant...');
    await ctx.waitForParticipant();
    console.log('[agent] Participant joined!');

    // 3. Read interview context from DISPATCH metadata (ctx.job.metadata)
    //    This is where the frontend sends jobRole, jdText, and resumeText
    //    via RoomAgentDispatch in the token function.
    let systemPrompt = DEFAULT_SYSTEM_PROMPT;
    try {
      // The dispatch metadata is on ctx.job.metadata, NOT ctx.room.metadata
      const rawMetadata = ctx.job?.metadata || '';
      console.log('[agent] Job metadata:', rawMetadata ? rawMetadata.substring(0, 200) + '...' : '(empty)');

      // Also check participant metadata as fallback
      let metadataStr = rawMetadata;
      if (!metadataStr) {
        // Try to read from the first remote participant's metadata
        for (const [, p] of ctx.room.remoteParticipants) {
          if (p.metadata) {
            metadataStr = p.metadata;
            console.log('[agent] Using participant metadata instead');
            break;
          }
        }
      }

      if (metadataStr) {
        const parsed = JSON.parse(metadataStr);
        console.log('[agent] Parsed context - Role:', parsed.jobRole, '| Resume length:', parsed.resumeText?.length || 0);

        if (parsed.jobRole || parsed.jdText || parsed.resumeText) {
          systemPrompt = `You are Arjun Verma, a senior technical interviewer conducting a live mock interview.

Role being interviewed for: ${parsed.jobRole || 'Software Engineer'}

Job Description:
${(parsed.jdText || '').substring(0, 2000)}

${parsed.resumeText ? `Candidate's Resume (use this to personalize questions — address the candidate by name, reference their projects, skills, and experience):
${parsed.resumeText.substring(0, 3000)}` : ''}

CRITICAL Instructions:
- You MUST use the candidate's actual name from the resume. Never say "[Candidate's Name]".
- Reference specific projects, skills, companies, and experiences from the resume when asking questions.
- Ask one technical question at a time based on the job role, JD, and the candidate's resume above.
- Tailor your questions to the candidate's experience and skills mentioned in their resume.
- Wait for the candidate to respond before continuing.
- Keep your responses concise and natural — you are speaking aloud.
- Provide brief feedback after each answer.
- After 4-5 questions, wrap up with a summary of strengths and areas for improvement.
- Be professional, friendly, and encouraging.`;
          console.log('[agent] ✅ Customized prompt for role:', parsed.jobRole);
        }
      } else {
        console.log('[agent] ⚠️ No metadata found from any source, using default prompt');
      }
    } catch (e) {
      console.error('[agent] Failed to parse metadata:', e);
      console.log('[agent] Using default prompt');
    }

    // 4. Configure the LLM (Native Google Gemini plugin)
    //    The plugin reads GOOGLE_API_KEY from env automatically,
    //    but we also pass it explicitly for safety.
    console.log('[agent] Configuring LLM...');
    const llmInstance = new google.LLM({
      model: 'gemini-3.5-flash',
      apiKey: GOOGLE_API_KEY,
      // Disable deep reasoning for real-time voice — "minimal" gives fastest
      // time-to-first-token so the avatar responds without a multi-second pause.
      // includeThoughts: false prevents internal reasoning text from being
      // sent to TTS (which would cause letter-by-letter spelling).
      thinkingConfig: {
        thinkingLevel: 'minimal',
        includeThoughts: false,
      },
    });

    // 5. Configure STT using LiveKit Inference (Deepgram Nova 3)
    console.log('[agent] Configuring STT...');
    const sttInstance = new inference.STT({
      model: 'deepgram/nova-3',
    });

    // 6. Configure TTS using LiveKit Inference (Cartesia Sonic Turbo)
    //    sonic-turbo has ~2x lower latency than sonic-2, producing audio chunks
    //    faster so the Beyond Presence avatar's lip movements stay in sync.
    //    NOTE: add_timestamps was removed because it fragments transcription
    //    into word-level segments (causing no-space text). max_buffer_delay_ms
    //    was removed because 50ms caused the TTS to receive tiny text chunks
    //    and spell out words letter-by-letter.
    console.log('[agent] Configuring TTS...');
    const ttsInstance = new inference.TTS({
      model: 'cartesia/sonic-turbo',
      sampleRate: 24000,
    });

    // 7. Create the agent session with voice pipeline
    console.log('[agent] Creating AgentSession...');
    const session = new voice.AgentSession({
      llm: llmInstance,
      tts: ttsInstance,
      stt: sttInstance,
      // VAD uses the built-in bundled Silero by default in v1.5+
    });

    // ----- Error listeners — log instead of silently crashing -----
    session.on('error', (err: any) => {
      console.error('[agent] ⚠️ AgentSession error (will attempt to continue):', err?.message || err);
    });
    session.on('close', () => {
      console.log('[agent] AgentSession closed.');
    });

    // 8. Start the agent session FIRST
    //    This creates RoomIO which sets up default audio I/O (ParticipantAudioOutput).
    //    We must start the session before the avatar so that avatar.start() can
    //    overwrite session.output.audio with DataStreamAudioOutput — which routes
    //    TTS audio to the Beyond Presence avatar for lip-synced video rendering.
    console.log('[agent] Starting agent session...');
    await session.start({
      agent: new voice.Agent({
        instructions: systemPrompt,
      }),
      room: ctx.room,
      // Disable transcription-audio sync because the avatar replaces audio output
      // with DataStreamAudioOutput. The default TranscriptionSynchronizer would
      // wait forever for playback events from the old ParticipantAudioOutput.
      outputOptions: {
        syncTranscription: false,
      },
    });
    console.log('[agent] Agent session started!');

    // 9. Create and start the Beyond Presence avatar AFTER the session
    //    avatar.start() sets session.output.audio = DataStreamAudioOutput,
    //    which streams TTS audio to the avatar participant via data channels.
    //    The avatar uses this audio to generate lip-synced video in real time.
    //    BEY_API_KEY is read automatically from env vars.
    console.log('[agent] Creating Beyond Presence avatar session...');
    const avatar = new AvatarSession({
      avatarId: BEY_AVATAR_ID,
    });

    try {
      console.log('[agent] Starting avatar...');
      await avatar.start(session, ctx.room);
      console.log('[agent] Avatar started successfully!');
      console.log('[agent] Audio output type:', session.output.audio?.constructor.name);
    } catch (err) {
      console.error('[agent] Failed to start avatar:', err);
      // Continue without avatar — the agent can still speak
    }

    // 10. Generate initial greeting
    session.generateReply({
      instructions:
        "Greet the candidate. Introduce yourself as Arjun Verma, a senior technical interviewer. Ask them to tell you about themselves and their experience.",
    });
    console.log('[agent] Initial greeting generated.');
  },
});

// Run the agent server
cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'interview-agent',
    // Default is 10s which is too short on Windows — loading onnxruntime +
    // bundled Silero VAD in the child process can take 15–20s on cold start.
    initializeProcessTimeout: 30_000,
  }),
);
