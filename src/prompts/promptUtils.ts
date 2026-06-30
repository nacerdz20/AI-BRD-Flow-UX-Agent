interface StructuredPromptOptions {
  role: string;
  objective: string;
  context: string[];
  rules: string[];
  mockPayload: unknown;
}

export function buildStructuredPrompt({
  role,
  objective,
  context,
  rules,
  mockPayload,
}: StructuredPromptOptions): string {
  return [
    `You are the ${role}.`,
    objective,
    "",
    "Context:",
    ...context,
    "",
    "Rules:",
    ...rules.map((rule) => `- ${rule}`),
    "",
    "Return valid JSON only.",
    "<<<MOCK_JSON>>>",
    JSON.stringify(mockPayload, null, 2),
    "<<<END_MOCK_JSON>>>",
  ].join("\n");
}
