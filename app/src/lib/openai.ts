import OpenAI from "openai";
import {
  ClassificationResult,
  ExtractionResult,
  BeatCategory,
} from "@/types";

function getClient(): OpenAI {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-mini";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-03-01-preview";

  if (!apiKey || !endpoint) {
    throw new Error(
      "Missing AZURE_OPENAI_API_KEY or AZURE_OPENAI_ENDPOINT environment variables"
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: `${endpoint}/openai/deployments/${deployment}`,
    defaultQuery: { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey },
  });
}

async function chatWithRetry(
  messages: OpenAI.ChatCompletionMessageParam[],
  maxRetries = 3
): Promise<string> {
  const client = getClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-mini",
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export async function classifyIsekai(
  title: string
): Promise<ClassificationResult> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an anime expert. Determine whether the given anime is an isekai (a story where the protagonist is transported to, reincarnated in, or trapped in a different world from their original one).

Return a JSON object with:
- "isIsekai": boolean - true if the anime is isekai, false if not
- "confidence": number between 0 and 1 - how confident you are that this anime IS isekai. 1.0 means "definitely isekai", 0.0 means "definitely NOT isekai". For non-isekai anime, this value should be LOW (close to 0).
- "explanation": string - a brief explanation of why it is or is not isekai

IMPORTANT: The confidence score represents the LIKELIHOOD of being isekai, NOT your confidence in your determination. A non-isekai anime should have a LOW confidence score.`,
    },
    {
      role: "user",
      content: `Is "${title}" an isekai anime?`,
    },
  ];

  const content = await chatWithRetry(messages);
  const result = JSON.parse(content) as ClassificationResult;

  // Defense-in-depth: if isIsekai is false but confidence > 0.5, invert it
  if (!result.isIsekai && result.confidence > 0.5) {
    result.confidence = 1 - result.confidence;
  }

  return result;
}

export async function extractBeats(
  title: string,
  categories: BeatCategory[]
): Promise<ExtractionResult> {
  const categoryList = categories
    .filter((c) => c.stage !== "arrival")
    .map((c) => `  - [${c.stage}] ${c.name}`)
    .join("\n");

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an anime expert analyzing isekai story beats. Extract the key story beats from the anime's inciting incident through the first major milestone (5-10 beats).

Cover these stages:
1. **Departure**: How the protagonist leaves the original world
2. **Transition**: Any encounters or process between worlds (meeting a deity, reincarnation process, etc.)
3. **Arrival**: How they arrive in the new world - describe their form, age (if humanoid), and location
4. **Powers**: What abilities or circumstances they receive

EXISTING CATEGORIES (use these when they match):
${categoryList}

For the Arrival stage, provide EXACTLY ONE beat with structured sub-fields:
- "form": what the protagonist becomes (e.g., "human", "slime", "spider", "skeleton")
- "age": life stage if humanoid (e.g., "baby", "child", "adult"), or null if non-humanoid
- "location": where they first appear (e.g., "city", "wilderness", "dungeon", "forest", "cave")

Return a JSON object with:
- "beats": array of objects with:
  - "stage": one of "departure", "transition", "arrival", "powers"
  - "categoryName": matching category name from the list above, or a new descriptive name
  - "rawText": brief description of what happens in this beat
  - "arrivalDetail": (only for arrival beats) object with "form", "age" (string|null), "location"
- "proposedCategories": array of objects with "stage" and "name" for any new categories not in the existing list (excluding arrival categories)

Each stage can have multiple beats EXCEPT arrival (exactly one arrival beat).`,
    },
    {
      role: "user",
      content: `Extract the isekai story beats for "${title}".`,
    },
  ];

  const content = await chatWithRetry(messages);
  const result = JSON.parse(content) as ExtractionResult;

  // Enforce single arrival beat
  const arrivalBeats = result.beats.filter((b) => b.stage === "arrival");
  if (arrivalBeats.length > 1) {
    const firstArrival = arrivalBeats[0];
    result.beats = result.beats.filter(
      (b) => b.stage !== "arrival" || b === firstArrival
    );
  }

  return result;
}
