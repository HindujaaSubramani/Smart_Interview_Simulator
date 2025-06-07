// backend/llm/llm.js
import express from 'express';
import dotenv from 'dotenv';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

dotenv.config();
const router = express.Router();

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1"; // Confirm this model is accessible with your token

const systemPrompt = `
You are a senior HR interviewer conducting a live, real-time job interview for a Software Development Engineer (SDE) position.

You must ask only one clear and specific question at a time. Do not include multiple parts in a single question. Do not combine follow-up queries.

Maintain a formal, professional, and strictly interview-focused tone. Your questions should be either technical or behavioral.

Wait for the candidate’s response before asking the next question.

Never answer casual, irrelevant, or off-topic inputs. Do not joke, give opinions, or speak outside the interview scope.
`;

router.post('/interview', async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");

  const { userText } = req.body;

  if (!userText || typeof userText !== "string") {
    return res.status(400).json({ error: '❌ No valid input text provided' });
  }

  if (!token) {
    console.error("❌ GITHUB_TOKEN is missing in environment variables.");
    return res.status(500).json({ error: 'GitHub token missing in backend config.' });
  }

  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(token), {
      requestOptions: { timeout: 10000 } // 10 seconds timeout
    });

    const response = await client.path("/chat/completions").post({
      body: {
        model,
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userText.trim() }
        ],
        temperature: 0.7,
        top_p: 1
      }
    });

    if (isUnexpected(response)) {
      const errMsg = response.body?.error?.message || "Unexpected API error";
      console.error("🚨 GitHub AI API Error:", errMsg);
      return res.status(502).json({ error: errMsg });
    }

    const reply = response.body.choices?.[0]?.message?.content;
    if (!reply) {
      console.error("⚠️ No content in response.");
      return res.status(500).json({ error: "Empty response from GitHub model" });
    }

    return res.status(200).json({ response: reply });

  } catch (err) {
    console.error("🔥 Request failed:", err.message || err);
    if (err.code === "ETIMEDOUT") {
      return res.status(504).json({ error: 'GitHub model timed out. Try again.' });
    }
    return res.status(500).json({ error: 'Failed to get AI response from GitHub model' });
  }
});

export default router;
