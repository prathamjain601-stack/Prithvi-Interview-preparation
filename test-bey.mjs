const { BeyondPresence } = require('@bey-dev/sdk');

async function test() {
  const apiKey = "sk-VLFlKnuKDx-HHFv8t9w9KSzVWVFYWeInGMzcPcb-Kzw";
  try {
    const client = new BeyondPresence({ apiKey });
    
    console.log("Fetching agents...");
    const agents = await client.agent.list();
    console.log("Agents:", agents);
    
    console.log("Fetching avatars...");
    const avatars = await client.avatar.list();
    console.log("Avatars:", avatars);

  } catch (error) {
    console.error("Error connecting to Beyond Presence SDK:", error);
  }
}

test();
