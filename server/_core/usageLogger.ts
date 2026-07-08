import { getDb } from "../db";
import { tokenUsage } from "../../drizzle/schema";

// Cost per 1M tokens in USD by model prefix
const COST_PER_M: Record<string, { input: number; output: number }> = {
  "gemini-2.0-flash":   { input: 0.10,  output: 0.40  },
  "gemini-1.5-flash":   { input: 0.075, output: 0.30  },
  "gemini-1.5-pro":     { input: 1.25,  output: 5.00  },
  "gemini-2.5-flash":   { input: 0.15,  output: 0.60  },
  "gemini-2.5-pro":     { input: 1.25,  output: 10.00 },
  "gpt-4o-mini":        { input: 0.15,  output: 0.60  },
  "gpt-4o":             { input: 2.50,  output: 10.00 },
  "gpt-4":              { input: 30.00, output: 60.00 },
};

function resolveCost(model: string, promptTokens: number, completionTokens: number): string {
  const key = Object.keys(COST_PER_M).find(k => model.toLowerCase().startsWith(k));
  if (!key) return "0";
  const { input, output } = COST_PER_M[key];
  const cost = (promptTokens / 1_000_000) * input + (completionTokens / 1_000_000) * output;
  return cost.toFixed(6);
}

export async function logTokenUsage(params: {
  userId?: number;
  endpoint?: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const { userId, endpoint, model, promptTokens, completionTokens } = params;
  const totalTokens = promptTokens + completionTokens;
  const costUsd = resolveCost(model, promptTokens, completionTokens);

  await db.insert(tokenUsage).values({
    userId: userId ?? null,
    endpoint: endpoint ?? null,
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd,
  });
}
