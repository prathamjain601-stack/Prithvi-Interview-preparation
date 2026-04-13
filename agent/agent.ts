import 'dotenv/config';
import {
  type JobContext,
  type JobProcess,
  ServerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { AvatarSession } from '@livekit/agents-plugin-bey';
import * as silero from '@livekit/agents-plugin-silero';
import { fileURLToPath } from 'node:url';

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
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    console.log('[agent] Job received, connecting to room...');

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
      model: 'gemini-2.5-flash',
      apiKey: GOOGLE_API_KEY,
    });

    // 5. Configure STT using LiveKit Inference (Deepgram Nova 3)
    console.log('[agent] Configuring STT...');
    const sttInstance = new inference.STT({
      model: 'deepgram/nova-3',
    });

    // 6. Configure TTS using LiveKit Inference (Cartesia Sonic 2)
    console.log('[agent] Configuring TTS...');
    const ttsInstance = new inference.TTS({
      model: 'cartesia/sonic-2',
    });

    // 7. Create the agent session with voice pipeline
    console.log('[agent] Creating AgentSession...');
    const session = new voice.AgentSession({
      llm: llmInstance,
      tts: ttsInstance,
      stt: sttInstance,
      vad: ctx.proc.userData.vad! as silero.VAD,
    });

    // 8. Create Beyond Presence avatar
    //    BEY_API_KEY is read automatically from env vars
    console.log('[agent] Creating Beyond Presence avatar session...');
    const avatar = new AvatarSession({
      avatarId: BEY_AVATAR_ID,
    });

    try {
      console.log('[agent] Starting avatar...');
      await avatar.start(session, ctx.room);
      console.log('[agent] Avatar started successfully!');
    } catch (err) {
      console.error('[agent] Failed to start avatar:', err);
      // Continue without avatar — the agent can still speak
    }

    // 9. Start the agent session
    console.log('[agent] Starting agent session...');
    await session.start({
      agent: new voice.Agent({
        instructions: systemPrompt,
      }),
      room: ctx.room,
    });
    console.log('[agent] Agent session started!');

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
  }),
);
