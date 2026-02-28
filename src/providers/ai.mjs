import { config } from "../config.mjs";
import { fetchWithTimeout } from "../http.mjs";

export async function generateHostedIdeas({ prompt, primaryProvider, fallbackProvider }) {
  const orderedProviders = resolveProviderOrder(primaryProvider, fallbackProvider);
  const failures = [];

  for (const provider of orderedProviders) {
    try {
      if (provider === "gemini" && config.geminiApiKey) {
        return await callGemini(prompt);
      }
      if (provider === "groq" && config.groqApiKey) {
        return await callGroq(prompt);
      }
    } catch (error) {
      failures.push(`${provider}: ${error.message}`);
    }
  }

  throw new Error(failures[0] ?? "No hosted AI provider is configured.");
}

export function hostedAiProviderStatus() {
  return {
    gemini: Boolean(config.geminiApiKey),
    groq: Boolean(config.groqApiKey),
    primary: resolveAiProvider(config.aiPrimaryProvider),
    fallback: resolveAiProvider(config.aiFallbackProvider),
  };
}

async function callGemini(prompt) {
  const model = config.aiGeminiModel;
  const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`);
  url.searchParams.set("key", config.geminiApiKey);

  const response = await fetchWithTimeout(url, {
    method: "POST",
    timeoutMs: config.aiTimeoutMs,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        responseMimeType: "application/json",
      },
    }),
  });

  const payload = await response.text();
  if (!response.ok) {
    throw new Error(`Gemini ${response.status}: ${payload.slice(0, 240)}`);
  }

  const parsed = JSON.parse(payload);
  const text = parsed?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text ?? "")
    .join("")
    .trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return {
    provider: "gemini",
    model,
    text,
    parsed: parseJsonLoose(text),
  };
}

async function callGroq(prompt) {
  const model = config.aiGroqModel;
  const response = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    timeoutMs: config.aiTimeoutMs,
    headers: {
      Authorization: `Bearer ${config.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an equity research assistant. Use only the provided data. Return strict JSON with no markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const payload = await response.text();
  if (!response.ok) {
    throw new Error(`Groq ${response.status}: ${payload.slice(0, 240)}`);
  }

  const parsed = JSON.parse(payload);
  const text = parsed?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return {
    provider: "groq",
    model,
    text,
    parsed: parseJsonLoose(text),
  };
}

function parseJsonLoose(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("Hosted AI output was not valid JSON.");
  }
}

function resolveProviderOrder(primaryProvider, fallbackProvider) {
  const ordered = [
    resolveAiProvider(primaryProvider ?? config.aiPrimaryProvider),
    resolveAiProvider(fallbackProvider ?? config.aiFallbackProvider),
  ].filter(Boolean);

  return [...new Set(ordered)];
}

function resolveAiProvider(value) {
  const clean = String(value ?? "")
    .trim()
    .toLowerCase();
  return ["gemini", "groq"].includes(clean) ? clean : null;
}
