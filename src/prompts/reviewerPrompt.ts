import type { ProjectAnalysis, QualityScore, ReviewOutput } from "../types/projectAnalysis";
import { buildStructuredPrompt } from "./promptUtils";

interface QualityReviewerDraft {
  review: ReviewOutput;
  qualityScore: QualityScore;
}

export function createReviewerPrompt(
  analysis: ProjectAnalysis,
  draft: QualityReviewerDraft,
): string {
  return buildStructuredPrompt({
    role: "Quality Reviewer Agent",
    objective:
      "Audit the cross-section consistency of BRD, flowcharts, UX, UI, user stories, and traceability outputs, then score the quality of each layer.",
    context: [
      `Idea: ${analysis.idea}`,
      `Functional requirements count: ${analysis.brd.functionalRequirements.length}`,
      `User stories count: ${analysis.userStories.length}`,
      `Screen count: ${analysis.ui.screens.length}`,
      `Exception flow count: ${analysis.flowcharts.exceptionFlows.length}`,
    ],
    rules: [
      "Flag any business requirement that lacks a supporting flow or screen.",
      "Call out ambiguous assumptions, weak UX coverage, and missing edge-case handling.",
      "Produce quality scores from 0 to 100 for BRD, flows, UX, UI, and the overall package.",
      "Keep recommendations practical for product, design, and engineering handoff.",
    ],
    mockPayload: draft,
  });
}
