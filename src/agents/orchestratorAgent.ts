import {
  createEmptyAnalysis,
  uniqueStrings,
} from "../services/analysisUtils";
import {
  buildExportBundle,
  buildFinalMarkdownReport,
} from "../services/exportMarkdown";
import {
  buildProjectContext,
  validateProjectIdeaInput,
} from "../services/projectContext";
import { groupRequirementsByPriority } from "../services/requirements";
import { buildTraceabilityMatrix } from "../services/traceability";
import { applyVersioning } from "../services/versioning";
import type { ProjectAnalysis } from "../types/projectAnalysis";
import { runBusinessAnalystAgent } from "./businessAnalystAgent";
import { runClarificationAgent } from "./clarificationAgent";
import { runProcessFlowAgent } from "./processFlowAgent";
import { runQualityReviewerAgent } from "./qualityReviewerAgent";
import { runUIDesignerAgent } from "./uiDesignerAgent";
import { runUXArchitectAgent } from "./uxArchitectAgent";

type OrchestratorProgress = (stage: string) => void;

async function runStage<T>(
  label: string,
  onProgress: OrchestratorProgress | undefined,
  task: () => Promise<T>,
): Promise<T> {
  onProgress?.(label);

  try {
    return await task();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown stage failure.";
    throw new Error(`${label} failed. ${message}`);
  }
}

export async function runOrchestrator(
  projectIdea: string,
  onProgress?: OrchestratorProgress,
  previousAnalysis?: ProjectAnalysis,
): Promise<ProjectAnalysis> {
  const validation = validateProjectIdeaInput(projectIdea);

  if (!validation.isValid) {
    throw new Error(validation.errors[0] ?? "The project idea is not valid.");
  }

  const context = buildProjectContext(validation.normalizedIdea);

  const clarification = await runStage("Clarification Agent", onProgress, () =>
    runClarificationAgent(validation.normalizedIdea, context),
  );

  const brd = await runStage("Business Analyst Agent", onProgress, () =>
    runBusinessAnalystAgent(validation.normalizedIdea, context, clarification),
  );

  const flowcharts = await runStage("Process Flow Agent", onProgress, () =>
    runProcessFlowAgent(brd, context),
  );

  const uxResult = await runStage("UX Architect Agent", onProgress, () =>
    runUXArchitectAgent(brd, flowcharts, context),
  );
  const { ux, userStories } = uxResult;

  const ui = await runStage("UI Designer Agent", onProgress, () =>
    runUIDesignerAgent(brd, ux, userStories, context),
  );

  const prioritizedRequirements = groupRequirementsByPriority(brd.functionalRequirements);
  const traceabilityMatrix = buildTraceabilityMatrix(brd, flowcharts, userStories, ui);

  let draft = createEmptyAnalysis(validation.normalizedIdea);

  draft = {
    ...draft,
    idea: validation.normalizedIdea,
    projectType: context.projectType,
    clarification,
    assumptions: uniqueStrings([
      ...clarification.assumptions,
      ...brd.assumptions,
    ]),
    prioritizedRequirements,
    brd: {
      ...brd,
      assumptions: uniqueStrings([...clarification.assumptions, ...brd.assumptions]),
    },
    flowcharts,
    ux,
    userStories,
    ui,
    traceabilityMatrix,
  };

  const qualityResult = await runStage("Quality Reviewer Agent", onProgress, () =>
    runQualityReviewerAgent(draft),
  );

  draft = {
    ...draft,
    qualityScore: qualityResult.qualityScore,
    review: qualityResult.review,
  };

  draft.finalMarkdownReport = buildFinalMarkdownReport(draft);
  draft.exports = buildExportBundle(draft);

  const preVersionAnalysis = {
    ...draft,
    finalMarkdownReport: buildFinalMarkdownReport(draft),
  };
  preVersionAnalysis.exports = buildExportBundle(preVersionAnalysis);

  const versionedAnalysis = applyVersioning(preVersionAnalysis, previousAnalysis);

  versionedAnalysis.finalMarkdownReport = buildFinalMarkdownReport(versionedAnalysis);
  versionedAnalysis.exports = buildExportBundle(versionedAnalysis);

  return versionedAnalysis;
}
