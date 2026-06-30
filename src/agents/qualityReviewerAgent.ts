import { createReviewerPrompt } from "../prompts/reviewerPrompt";
import { averageScores, clampScore, safeParseJson } from "../services/analysisUtils";
import { generateWithLLM } from "../services/llmProvider";
import {
  normalizeQualityScore,
  normalizeReviewOutput,
} from "../services/outputSanitizers";
import type {
  ProjectAnalysis,
  QualityScore,
  ReviewOutput,
} from "../types/projectAnalysis";

interface QualityReviewResult {
  review: ReviewOutput;
  qualityScore: QualityScore;
}

function ratioScore(covered: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return clampScore((covered / total) * 100);
}

function computeQualityScore(analysis: ProjectAnalysis): QualityScore {
  const requirementCount = analysis.brd.functionalRequirements.length;
  const traceabilityCoverage = analysis.traceabilityMatrix.filter(
    (entry) =>
      entry.relatedFlowcharts.length > 0 &&
      entry.relatedScreens.length > 0 &&
      entry.relatedUserStories.length > 0,
  ).length;

  const brdScore = averageScores([
    ratioScore(requirementCount, Math.max(requirementCount, 1)),
    ratioScore(analysis.brd.nonFunctionalRequirements.length, 4),
    ratioScore(analysis.brd.acceptanceCriteria.length, 4),
  ]);

  const flowScore = averageScores([
    ratioScore(analysis.flowcharts.exceptionFlows.length, 2),
    ratioScore(analysis.flowcharts.projectTypeFlows.length + 4, 6),
    ratioScore(analysis.flowcharts.validationNotes.length > 0 ? 1 : 0, 1),
  ]);

  const uxScore = averageScores([
    ratioScore(analysis.ux.personas.length, 3),
    ratioScore(analysis.ux.navigationFlow.length, 3),
    ratioScore(analysis.userStories.length, 4),
  ]);

  const uiScore = averageScores([
    ratioScore(analysis.ui.screens.length, 6),
    ratioScore(
      analysis.ui.screens.filter((screen) => screen.relatedRequirements.length > 0).length,
      Math.max(analysis.ui.screens.length, 1),
    ),
    ratioScore(
      analysis.ui.screens.filter((screen) => screen.validationRules.length > 0).length,
      Math.max(analysis.ui.screens.length, 1),
    ),
  ]);

  const overall = averageScores([
    brdScore,
    flowScore,
    uxScore,
    uiScore,
    ratioScore(traceabilityCoverage, Math.max(requirementCount, 1)),
  ]);

  return {
    brd: brdScore,
    flowcharts: flowScore,
    ux: uxScore,
    ui: uiScore,
    overall,
  };
}

export async function runQualityReviewerAgent(
  analysis: ProjectAnalysis,
): Promise<QualityReviewResult> {
  const missingItems = analysis.traceabilityMatrix
    .filter(
      (entry) =>
        entry.relatedFlowcharts.length === 0 ||
        entry.relatedScreens.length === 0 ||
        entry.relatedUserStories.length === 0,
    )
    .map(
      (entry) =>
        `${entry.requirementId} ${entry.requirementTitle} is missing full traceability coverage.`,
    );

  if (analysis.flowcharts.exceptionFlows.length === 0) {
    missingItems.push("No exception flows were generated.");
  }

  const qualityScore = computeQualityScore(analysis);

  const draft: QualityReviewResult = {
    qualityScore,
    review: {
      consistencyCheck: analysis.traceabilityMatrix.map((entry) =>
        `${entry.requirementId} -> Flows: ${entry.relatedFlowcharts.join(", ") || "None"} | Screens: ${entry.relatedScreens.join(", ") || "None"} | Stories: ${entry.relatedUserStories.join(", ") || "None"}`,
      ),
      strengths: [
        "The analysis keeps requirements, screens, and flows in a single structured model.",
        "Project-type templates add domain-relevant flows and interface expectations.",
        "Clarification assumptions remain explicit instead of blocking the analysis.",
      ],
      weaknesses: [
        ...(missingItems.length > 0
          ? ["Some requirements still need stronger traceability coverage across flows, screens, and stories."]
          : []),
        ...(qualityScore.ux < 80
          ? ["UX artifacts need deeper coverage or role differentiation."]
          : []),
        ...(qualityScore.ui < 80
          ? ["UI specifications could still benefit from more detailed validation or state handling."]
          : []),
      ],
      missingItems,
      recommendations: [
        "Review the traceability matrix before stakeholder sign-off to close any uncovered requirement IDs.",
        "Confirm assumptions with business stakeholders so inferred scope can be promoted to explicit scope where appropriate.",
        "Use the quality scores as a pre-handoff checklist rather than a substitute for stakeholder review.",
      ],
    },
  };

  const prompt = createReviewerPrompt(analysis, draft);
  const response = await generateWithLLM(prompt);
  const parsed = safeParseJson<QualityReviewResult>(response, draft);

  return {
    review: normalizeReviewOutput(parsed.review, draft.review),
    qualityScore: normalizeQualityScore(parsed.qualityScore, draft.qualityScore),
  };
}
