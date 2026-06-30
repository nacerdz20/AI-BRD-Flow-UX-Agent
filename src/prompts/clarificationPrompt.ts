import type { ProjectContext } from "../services/projectContext";
import type { ClarificationOutput } from "../types/projectAnalysis";
import { buildStructuredPrompt } from "./promptUtils";

export function createClarificationPrompt(
  context: ProjectContext,
  draft: ClarificationOutput,
): string {
  return buildStructuredPrompt({
    role: "Clarification Agent",
    objective:
      "Analyze the user's brief, detect the project type and domain, expose missing information, and continue with explicit assumptions instead of blocking the workflow.",
    context: [
      `Original idea: ${context.normalizedIdea}`,
      `Detected project type: ${context.projectType}`,
      `Detected domain: ${context.domain}`,
      `System type: ${context.systemType}`,
      `Primary users:\n${context.primaryUsers.map((item) => `- ${item}`).join("\n")}`,
    ],
    rules: [
      "Do not stop the process if details are missing.",
      "Return smart clarification questions and explicit assumptions.",
      "Keep the completeness summary concise and professional.",
    ],
    mockPayload: draft,
  });
}
