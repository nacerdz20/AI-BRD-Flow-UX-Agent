import type { ProjectContext } from "../services/projectContext";
import type { ProjectAnalysis } from "../types/projectAnalysis";
import { buildStructuredPrompt } from "./promptUtils";

export function createOrchestratorPrompt(
  context: ProjectContext,
  draft: ProjectAnalysis,
): string {
  return buildStructuredPrompt({
    role: "Orchestrator Agent",
    objective:
      "Review the full analysis chain, confirm the clarification output, preserve traceability across artifacts, and prepare the final structured report with exports and version metadata.",
    context: [
      `Project idea: ${context.normalizedIdea}`,
      `Project type: ${context.projectType}`,
      `Domain: ${context.domain}`,
      `System type: ${context.systemType}`,
      `Primary users:\n${context.primaryUsers.map((item) => `- ${item}`).join("\n")}`,
      `Missing details:\n${context.missingDetails.map((item) => `- ${item}`).join("\n")}`,
      `Assumptions:\n${draft.assumptions.map((item) => `- ${item}`).join("\n")}`,
    ],
    rules: [
      "Confirm that the inferred domain, users, and workflow type remain consistent with the original idea.",
      "Keep every section traceable to a prior requirement, flow, or UX decision.",
      "When information is missing, keep the assumption explicit instead of silently inventing details.",
      "Preserve the structured JSON shape for clarification, user stories, traceability, scoring, exports, and versioning.",
      "Do not introduce implementation code or technical stack for the analyzed product.",
    ],
    mockPayload: draft,
  });
}
