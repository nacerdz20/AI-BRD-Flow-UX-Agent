export type LLMProviderName = "mock" | "openai" | "ollama" | "custom";

export interface LLMProviderConfig {
  provider: LLMProviderName;
  mode: "mock" | "live";
  model: string;
  baseUrl?: string;
}

const MOCK_START = "<<<MOCK_JSON>>>";
const MOCK_END = "<<<END_MOCK_JSON>>>";

export const llmProviderConfig: LLMProviderConfig = {
  provider: (import.meta.env.VITE_LLM_PROVIDER as LLMProviderName | undefined) ?? "mock",
  mode: import.meta.env.VITE_LLM_MODE === "live" ? "live" : "mock",
  model: import.meta.env.VITE_LLM_MODEL ?? "mock-structured-agent",
  baseUrl: import.meta.env.VITE_LLM_BASE_URL,
};

function extractMockResponse(prompt: string): string | null {
  const start = prompt.indexOf(MOCK_START);
  const end = prompt.indexOf(MOCK_END);

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return prompt.slice(start + MOCK_START.length, end).trim();
}

async function generateMockResponse(prompt: string): Promise<string> {
  const extracted = extractMockResponse(prompt);

  if (extracted) {
    return extracted;
  }

  return JSON.stringify(
    {
      message: "Mock provider did not find a structured payload in the prompt.",
    },
    null,
    2,
  );
}

async function generateLiveResponse(prompt: string): Promise<string> {
  void prompt;

  throw new Error(
    `Live provider mode is selected, but "${llmProviderConfig.provider}" is not wired yet. Replace generateWithLLM() with the target provider client when ready.`,
  );
}

export async function generateWithLLM(prompt: string): Promise<string> {
  if (
    llmProviderConfig.mode === "mock" ||
    llmProviderConfig.provider === "mock"
  ) {
    return generateMockResponse(prompt);
  }

  return generateLiveResponse(prompt);
}
