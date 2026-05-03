// ─────────────────────────────────────────────────────────────────────────────
// aiService.js
// Thin wrapper around Vercel AI SDK + Groq provider.
// Exposes streamChat() for SSE streaming and generateText() for one-shot calls.
// ─────────────────────────────────────────────────────────────────────────────

import { createGroq } from "@ai-sdk/groq";
import { streamText, generateText as aiGenerateText } from "ai";

// ── Groq client (uses GROQ_API_KEY from env) ─────────────────────────────────
const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

// Default model – llama-3.3-70b is fast, free-tier friendly, and very capable
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Stream a chat response back to the client using Server-Sent Events.
 * Call this from an Express route handler.
 *
 * @param {Object} params
 * @param {string} params.systemPrompt  - Pre-built system prompt (from buildFinancialPrompt)
 * @param {Array}  params.messages      - OpenAI-style message array [{role, content}, ...]
 * @param {import("express").Response} params.res - Express response object
 * @param {string} [params.model]       - Override the default Groq model
 */
export const streamChat = async ({ systemPrompt, messages, res, model = DEFAULT_MODEL }) => {
    // Set SSE headers before streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Nginx: disable proxy buffering

    try {
        const result = streamText({
            model: groq(model),
            system: systemPrompt,
            messages,
            maxTokens: 1024,
            temperature: 0.5,
        });

        // Pipe the Vercel AI SDK stream → Express response as SSE
        for await (const delta of result.textStream) {
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }

        // Signal completion
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

    } catch (error) {
        console.error("[aiService] streamChat error:", error);
        res.write(`data: ${JSON.stringify({ error: "AI service error. Please try again." })}\n\n`);
        res.end();
    }
};

/**
 * Non-streaming one-shot text generation.
 * Used internally by summaryService for cache generation.
 *
 * @param {Object} params
 * @param {string} params.systemPrompt
 * @param {string} params.userMessage
 * @param {string} [params.model]
 * @returns {Promise<string>} The generated text
 */
export const generateCompletion = async ({ systemPrompt, userMessage, model = DEFAULT_MODEL }) => {
    const { text } = await aiGenerateText({
        model: groq(model),
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        maxTokens: 512,
        temperature: 0.4,
    });
    return text;
};
