import express from 'express';
import cors from 'cors';
import { AccessToken, RoomAgentDispatch, RoomConfiguration } from 'livekit-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/getToken', async (req, res) => {
  try {
    const { roomName, participantName, metadata } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'roomName and participantName are required' });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

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

    // Set metadata for the agent to read
    if (metadata) {
      at.metadata = JSON.stringify(metadata);
    }

    // Explicitly dispatch the named agent to this room when the participant connects.
    // This is required because the agent uses `agentName: 'interview-agent'`
    // which disables automatic dispatch.
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: 'interview-agent',
          metadata: metadata ? JSON.stringify(metadata) : '',
        }),
      ],
    });

    const token = await at.toJwt();

    console.log(`Token generated for room: ${roomName}, participant: ${participantName}`);
    console.log(`  → Agent 'interview-agent' will be dispatched on connection`);

    res.json({ token, url: livekitUrl });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Token server running on http://localhost:${PORT}`);
});
