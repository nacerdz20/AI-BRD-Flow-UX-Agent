import type { ProjectContext } from "../services/projectContext";
import type { BRDOutput } from "../types/projectAnalysis";
import { buildStructuredPrompt } from "./promptUtils";

export function createBRDPrompt(
  context: ProjectContext,
  draft: BRDOutput,
): string {
  return buildStructuredPrompt({
    role: "Business Analyst Agent",
    objective:
      "Transform the project idea into a professional BRD with structured functional and non-functional requirements, MoSCoW prioritization, and handoff-ready detail.",
    context: [
      `Project idea: ${context.normalizedIdea}`,
      `Project type: ${context.projectType}`,
      `Domain: ${context.domain}`,
      `System type: ${context.systemType}`,
      `Key entities:\n${context.keyEntities.map((item) => `- ${item}`).join("\n")}`,
      `Assumptions:\n${context.assumptions.map((item) => `- ${item}`).join("\n")}`,
    ],
    rules: [
      "Produce concise, decision-ready statements with no filler or marketing language.",
      "Keep requirements phrased as observable product behavior with IDs, priorities, roles, and acceptance criteria.",
      "Make scope boundaries and out-of-scope items explicit.",
      "Ensure acceptance criteria are testable.",
    ],
    mockPayload: draft,
  });
}
