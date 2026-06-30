import type {
  ProjectAnalysis,
  VersionInfo,
} from "../types/projectAnalysis";
import { createEmptyVersion } from "./analysisUtils";

function buildSnapshot(analysis: ProjectAnalysis): string {
  return JSON.stringify(
    {
      projectType: analysis.projectType,
      clarification: analysis.clarification,
      prioritizedRequirements: analysis.prioritizedRequirements,
      brd: analysis.brd,
      flowcharts: analysis.flowcharts,
      ux: analysis.ux,
      userStories: analysis.userStories,
      ui: analysis.ui,
      traceabilityMatrix: analysis.traceabilityMatrix,
      qualityScore: analysis.qualityScore,
      review: analysis.review,
    },
    null,
    2,
  );
}

function buildChangesSummary(current: ProjectAnalysis, previous?: ProjectAnalysis): string {
  if (!previous) {
    return "Initial analysis generated from the original idea.";
  }

  const changes: string[] = [];

  if (previous.projectType !== current.projectType) {
    changes.push(`Project type changed from ${previous.projectType} to ${current.projectType}.`);
  }

  if (previous.idea !== current.idea) {
    changes.push("Original idea text was updated before regeneration.");
  }

  if (previous.brd.functionalRequirements.length !== current.brd.functionalRequirements.length) {
    changes.push(
      `Functional requirements changed from ${previous.brd.functionalRequirements.length} to ${current.brd.functionalRequirements.length}.`,
    );
  }

  if (previous.ui.screens.length !== current.ui.screens.length) {
    changes.push(`Screen count changed from ${previous.ui.screens.length} to ${current.ui.screens.length}.`);
  }

  if (changes.length === 0) {
    changes.push("The analysis was regenerated with the same high-level scope but refined output artifacts.");
  }

  return changes.join(" ");
}

export function buildVersionInfo(
  analysis: ProjectAnalysis,
  previous?: ProjectAnalysis,
): VersionInfo {
  const nextIndex = previous ? previous.versionHistory.length + 1 : 1;

  return {
    ...createEmptyVersion(),
    number: `v${String(nextIndex).padStart(3, "0")}`,
    originalIdea: analysis.idea,
    date: new Date().toISOString(),
    changesSummary: buildChangesSummary(analysis, previous),
    generatedOutput: buildSnapshot(analysis),
  };
}

export function applyVersioning(
  analysis: ProjectAnalysis,
  previous?: ProjectAnalysis,
): ProjectAnalysis {
  const version = buildVersionInfo(analysis, previous);
  const previousHistory = previous?.versionHistory ?? [];

  return {
    ...analysis,
    version,
    versionHistory: [...previousHistory, version],
  };
}
