import type {
  AnalysisTab,
  BRDOutput,
  FunctionalRequirement,
  MermaidFlowchart,
  NonFunctionalRequirement,
  ProjectAnalysis,
  TraceabilityMatrixEntry,
  UIScreen,
  UserStory,
} from "../types/projectAnalysis";

function bulletList(values: string[]): string {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : "- None";
}

function tableCell(values: string[] | string): string {
  const content = Array.isArray(values) ? values.join(", ") : values;

  return content.replace(/\|/g, "\\|") || "-";
}

function functionalRequirementToMarkdown(requirement: FunctionalRequirement): string {
  return [
    `### ${requirement.id} ${requirement.title}`,
    "",
    `**Priority**: ${requirement.priority}`,
    `**Related User Role**: ${requirement.relatedUserRole}`,
    "",
    requirement.description,
    "",
    `**Acceptance Criteria**\n${bulletList(requirement.acceptanceCriteria)}`,
  ].join("\n");
}

function nonFunctionalRequirementToMarkdown(requirement: NonFunctionalRequirement): string {
  return [
    `### ${requirement.id} ${requirement.category}`,
    "",
    `**Priority**: ${requirement.priority}`,
    "",
    requirement.description,
  ].join("\n");
}

function flowToMarkdown(flow: MermaidFlowchart): string {
  return [
    `### ${flow.id} ${flow.name}`,
    "",
    flow.description,
    "",
    `**Related Requirements**\n${bulletList(flow.relatedRequirements)}`,
    "",
    "```mermaid",
    flow.mermaid,
    "```",
  ].join("\n");
}

function userStoryToMarkdown(story: UserStory): string {
  return [
    `### ${story.id}`,
    "",
    story.statement,
    "",
    `**Related Requirements**\n${bulletList(story.relatedRequirements)}`,
    "",
    `**Acceptance Criteria (Gherkin)**\n${bulletList(story.acceptanceCriteria)}`,
  ].join("\n");
}

function screenToMarkdown(screen: UIScreen): string {
  return [
    `### ${screen.id} ${screen.name}`,
    "",
    `**Purpose**: ${screen.purpose}`,
    "",
    `**Related Requirements**\n${bulletList(screen.relatedRequirements)}`,
    "",
    `**Related User Stories**\n${bulletList(screen.relatedUserStories)}`,
    "",
    `**Data Displayed**\n${bulletList(screen.dataDisplayed)}`,
    "",
    `**Main Components**\n${bulletList(screen.mainComponents)}`,
    "",
    `**Actions**\n${bulletList(screen.actions)}`,
    "",
    `**Validation Rules**\n${bulletList(screen.validationRules)}`,
    "",
    `**Empty State**: ${screen.emptyState}`,
    "",
    `**Error State**: ${screen.errorState}`,
    "",
    `**Success State**: ${screen.successState}`,
    "",
    `**Responsive Behavior**: ${screen.responsiveBehavior}`,
  ].join("\n");
}

function traceabilityToMarkdown(entries: TraceabilityMatrixEntry[]): string {
  if (entries.length === 0) {
    return "No traceability entries available.";
  }

  const header =
    "| Requirement ID | Requirement | Flowcharts | Screens | User Stories | Acceptance Criteria |\n| --- | --- | --- | --- | --- | --- |";
  const rows = entries.map(
    (entry) =>
      `| ${tableCell(entry.requirementId)} | ${tableCell(entry.requirementTitle)} | ${tableCell(entry.relatedFlowcharts)} | ${tableCell(entry.relatedScreens)} | ${tableCell(entry.relatedUserStories)} | ${tableCell(entry.relatedAcceptanceCriteria)} |`,
  );

  return [header, ...rows].join("\n");
}

function buildClarificationMarkdown(analysis: ProjectAnalysis): string {
  const { clarification } = analysis;

  return [
    "# Clarification",
    "",
    `**Detected Project Type**: ${analysis.projectType}`,
    `**Detected Domain**: ${clarification.detectedDomain}`,
    `**Detected System Type**: ${clarification.detectedSystemType}`,
    "",
    `## Missing Information\n${bulletList(clarification.missingInformation)}`,
    "",
    `## Smart Questions\n${bulletList(clarification.questions)}`,
    "",
    `## Assumptions\n${bulletList(clarification.assumptions)}`,
    "",
    `## Completeness Summary\n${clarification.completenessSummary}`,
  ].join("\n");
}

function buildPrioritizedRequirementsMarkdown(analysis: ProjectAnalysis): string {
  const { prioritizedRequirements } = analysis;

  return [
    "# Requirement Prioritization",
    "",
    `## Must Have\n${prioritizedRequirements.mustHave.map(functionalRequirementToMarkdown).join("\n\n") || "- None"}`,
    "",
    `## Should Have\n${prioritizedRequirements.shouldHave.map(functionalRequirementToMarkdown).join("\n\n") || "- None"}`,
    "",
    `## Could Have\n${prioritizedRequirements.couldHave.map(functionalRequirementToMarkdown).join("\n\n") || "- None"}`,
    "",
    `## Won't Have Now\n${prioritizedRequirements.wontHaveNow.map(functionalRequirementToMarkdown).join("\n\n") || "- None"}`,
  ].join("\n");
}

export function buildBRDMarkdown(analysis: ProjectAnalysis): string {
  const { brd } = analysis;

  return [
    "# BRD",
    "",
    `## Project Overview\n${brd.projectOverview}`,
    "",
    `## Problem Statement\n${brd.problemStatement}`,
    "",
    `## Business Goals\n${bulletList(brd.businessGoals)}`,
    "",
    `## Stakeholders\n${bulletList(brd.stakeholders)}`,
    "",
    `## Target Users\n${bulletList(brd.targetUsers)}`,
    "",
    `## Scope\n${bulletList(brd.scope)}`,
    "",
    `## Out of Scope\n${bulletList(brd.outOfScope)}`,
    "",
    `## Business Rules\n${bulletList(brd.businessRules)}`,
    "",
    `## User Roles\n${bulletList(brd.userRoles)}`,
    "",
    `## Use Cases\n${bulletList(brd.useCases)}`,
    "",
    `## Risks\n${bulletList(brd.risks)}`,
    "",
    `## Success Criteria\n${bulletList(brd.successCriteria)}`,
    "",
    `## KPIs\n${bulletList(brd.kpis)}`,
    "",
    `## BRD Acceptance Criteria\n${bulletList(brd.acceptanceCriteria)}`,
    "",
    "## Functional Requirements",
    brd.functionalRequirements.map(functionalRequirementToMarkdown).join("\n\n"),
    "",
    "## Non-Functional Requirements",
    brd.nonFunctionalRequirements.map(nonFunctionalRequirementToMarkdown).join("\n\n"),
  ].join("\n");
}

export function buildFlowchartsMarkdown(analysis: ProjectAnalysis): string {
  const { flowcharts } = analysis;

  return [
    "# Flowcharts",
    "",
    flowToMarkdown(flowcharts.mainFlow),
    "",
    flowToMarkdown(flowcharts.registrationFlow),
    "",
    flowToMarkdown(flowcharts.loginFlow),
    "",
    flowToMarkdown(flowcharts.coreBusinessFlow),
    "",
    flowToMarkdown(flowcharts.adminFlow),
    "",
    "## Project Type Specific Flows",
    ...(flowcharts.projectTypeFlows.length > 0
      ? flowcharts.projectTypeFlows.flatMap((flow) => [flowToMarkdown(flow), ""])
      : ["- None", ""]),
    "## Exception Flows",
    ...(flowcharts.exceptionFlows.length > 0
      ? flowcharts.exceptionFlows.flatMap((flow) => [flowToMarkdown(flow), ""])
      : ["- None", ""]),
    `## Decision Points\n${bulletList(flowcharts.decisionPoints)}`,
    "",
    `## Mermaid Validation Notes\n${bulletList(flowcharts.validationNotes)}`,
  ].join("\n");
}

export function buildUXMarkdown(analysis: ProjectAnalysis): string {
  const { ux } = analysis;

  return [
    "# UX Specification",
    "",
    `## Personas\n${bulletList(ux.personas)}`,
    "",
    `## User Journey\n${bulletList(ux.userJourney)}`,
    "",
    `## Information Architecture\n${bulletList(ux.informationArchitecture)}`,
    "",
    `## Navigation Flow\n${bulletList(ux.navigationFlow)}`,
    "",
    `## UX Notes\n${bulletList(ux.uxNotes)}`,
    "",
    `## Pain Points\n${bulletList(ux.painPoints)}`,
    "",
    `## Accessibility Notes\n${bulletList(ux.accessibilityNotes)}`,
    "",
    "## User Stories",
    analysis.userStories.map(userStoryToMarkdown).join("\n\n"),
  ].join("\n");
}

export function buildUIMarkdown(analysis: ProjectAnalysis): string {
  return [
    "# UI Specification",
    "",
    "## Screens",
    analysis.ui.screens.map(screenToMarkdown).join("\n\n"),
    "",
    `## Design Notes\n${bulletList(analysis.ui.designNotes)}`,
  ].join("\n");
}

export function buildTraceabilityMarkdown(analysis: ProjectAnalysis): string {
  return [
    "# Requirements Traceability Matrix",
    "",
    traceabilityToMarkdown(analysis.traceabilityMatrix),
  ].join("\n");
}

export function buildQualityOverviewMarkdown(analysis: ProjectAnalysis): string {
  const { qualityScore } = analysis;

  return [
    "# Quality Score",
    "",
    `- BRD Completeness Score: ${qualityScore.brd}/100`,
    `- Flowchart Clarity Score: ${qualityScore.flowcharts}/100`,
    `- UX Quality Score: ${qualityScore.ux}/100`,
    `- UI Specification Score: ${qualityScore.ui}/100`,
    `- Overall Project Analysis Score: ${qualityScore.overall}/100`,
  ].join("\n");
}

export function buildReviewMarkdown(analysis: ProjectAnalysis): string {
  const { review } = analysis;

  return [
    "# Quality Review",
    "",
    `## Consistency Check\n${bulletList(review.consistencyCheck)}`,
    "",
    `## Strengths\n${bulletList(review.strengths)}`,
    "",
    `## Weaknesses\n${bulletList(review.weaknesses)}`,
    "",
    `## Missing Items\n${bulletList(review.missingItems)}`,
    "",
    `## Recommendations\n${bulletList(review.recommendations)}`,
  ].join("\n");
}

function buildVersionMarkdown(analysis: ProjectAnalysis): string {
  return [
    "# Versioning",
    "",
    `**Version Number**: ${analysis.version.number}`,
    `**Original Idea**: ${analysis.version.originalIdea}`,
    `**Date**: ${analysis.version.date}`,
    "",
    `## Changes Summary\n${analysis.version.changesSummary}`,
    "",
    `## Saved Versions\n${bulletList(analysis.versionHistory.map((version) => `${version.number} - ${version.date}`))}`,
  ].join("\n");
}

export function buildFinalMarkdownReport(analysis: ProjectAnalysis): string {
  return [
    "# AI Analysis Report",
    "",
    `## Original Idea\n${analysis.idea}`,
    "",
    buildClarificationMarkdown(analysis),
    "",
    buildBRDMarkdown(analysis),
    "",
    buildPrioritizedRequirementsMarkdown(analysis),
    "",
    buildFlowchartsMarkdown(analysis),
    "",
    buildUXMarkdown(analysis),
    "",
    buildUIMarkdown(analysis),
    "",
    buildTraceabilityMarkdown(analysis),
    "",
    buildQualityOverviewMarkdown(analysis),
    "",
    buildReviewMarkdown(analysis),
    "",
    buildVersionMarkdown(analysis),
  ].join("\n");
}

function buildMermaidExport(analysis: ProjectAnalysis): string {
  const allFlows = [
    analysis.flowcharts.mainFlow,
    analysis.flowcharts.registrationFlow,
    analysis.flowcharts.loginFlow,
    analysis.flowcharts.coreBusinessFlow,
    analysis.flowcharts.adminFlow,
    ...analysis.flowcharts.projectTypeFlows,
    ...analysis.flowcharts.exceptionFlows,
  ];

  return allFlows
    .map((flow) => [`## ${flow.id} ${flow.name}`, "```mermaid", flow.mermaid, "```"].join("\n"))
    .join("\n\n");
}

function buildUiUxSpecification(analysis: ProjectAnalysis): string {
  return [buildUXMarkdown(analysis), "", buildUIMarkdown(analysis)].join("\n");
}

export function buildExportBundle(analysis: ProjectAnalysis) {
  const markdown = buildFinalMarkdownReport(analysis);
  const brd = [buildClarificationMarkdown(analysis), "", buildBRDMarkdown(analysis), "", buildPrioritizedRequirementsMarkdown(analysis)].join("\n");
  const flowcharts = buildFlowchartsMarkdown(analysis);
  const uiux = buildUiUxSpecification(analysis);
  const mermaid = buildMermaidExport(analysis);
  const json = JSON.stringify(
    {
      ...analysis,
      exports: {
        ...analysis.exports,
        json: "",
      },
      finalMarkdownReport: markdown,
    },
    null,
    2,
  );

  return {
    markdown,
    json,
    mermaid,
    brd,
    uiux,
    flowcharts,
  };
}

export function buildTabMarkdownMap(
  analysis: ProjectAnalysis,
): Record<AnalysisTab, string> {
  return {
    brd: analysis.exports.brd || buildBRDMarkdown(analysis),
    flowcharts: analysis.exports.flowcharts || buildFlowchartsMarkdown(analysis),
    ux: buildUXMarkdown(analysis),
    ui: buildUIMarkdown(analysis),
    traceabilityMatrix: buildTraceabilityMarkdown(analysis),
    qualityReview: [buildQualityOverviewMarkdown(analysis), "", buildReviewMarkdown(analysis)].join("\n"),
    finalReport: analysis.exports.markdown || analysis.finalMarkdownReport || buildFinalMarkdownReport(analysis),
  };
}

export function exportTextFile(filename: string, content: string, mimeType = "text/plain;charset=utf-8"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function exportMarkdownFile(filename: string, content: string): void {
  exportTextFile(filename, content, "text/markdown;charset=utf-8");
}
