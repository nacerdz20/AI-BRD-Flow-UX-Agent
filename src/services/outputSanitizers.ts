import type {
  BRDOutput,
  ClarificationOutput,
  ExportBundle,
  FlowchartOutput,
  FunctionalRequirement,
  MermaidFlowchart,
  NonFunctionalRequirement,
  PrioritizedRequirements,
  ProjectAnalysis,
  ProjectType,
  QualityScore,
  ReviewOutput,
  TraceabilityMatrixEntry,
  UIOutput,
  UIScreen,
  UserStory,
  UXOutput,
  VersionInfo,
} from "../types/projectAnalysis";
import { normalizeIdea, uniqueStrings } from "./analysisUtils";
import { validateFlowchartArtifact } from "./mermaidValidator";

function ensureString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? normalizeIdea(value) : fallback;
}

function ensureStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return uniqueStrings(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()));
}

function ensureNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function ensureProjectType(value: unknown, fallback: ProjectType): ProjectType {
  const allowed: ProjectType[] = [
    "SaaS",
    "E-commerce",
    "Booking Platform",
    "Marketplace",
    "CRM",
    "ERP",
    "Education Platform",
    "Admin Dashboard",
    "Mobile App",
    "General Digital Product",
  ];

  return typeof value === "string" && allowed.includes(value as ProjectType)
    ? (value as ProjectType)
    : fallback;
}

export function normalizeClarificationOutput(value: unknown, fallback: ClarificationOutput): ClarificationOutput {
  const candidate = (value ?? {}) as Partial<ClarificationOutput>;

  return {
    missingInformation: ensureStringArray(candidate.missingInformation, fallback.missingInformation),
    questions: ensureStringArray(candidate.questions, fallback.questions),
    assumptions: ensureStringArray(candidate.assumptions, fallback.assumptions),
    detectedDomain: ensureString(candidate.detectedDomain, fallback.detectedDomain),
    detectedSystemType: ensureString(candidate.detectedSystemType, fallback.detectedSystemType),
    detectedPrimaryUsers: ensureStringArray(candidate.detectedPrimaryUsers, fallback.detectedPrimaryUsers),
    completenessSummary: ensureString(candidate.completenessSummary, fallback.completenessSummary),
  };
}

function normalizeFunctionalRequirement(
  value: unknown,
  fallback?: FunctionalRequirement,
): FunctionalRequirement {
  const candidate = (value ?? {}) as Partial<FunctionalRequirement>;

  return {
    id: ensureString(candidate.id, fallback?.id ?? "FR-001"),
    title: ensureString(candidate.title, fallback?.title ?? "Unnamed Requirement"),
    description: ensureString(candidate.description, fallback?.description ?? "No description provided."),
    priority: ensureString(candidate.priority, fallback?.priority ?? "Must Have") as FunctionalRequirement["priority"],
    relatedUserRole: ensureString(candidate.relatedUserRole, fallback?.relatedUserRole ?? "Registered User"),
    acceptanceCriteria: ensureStringArray(candidate.acceptanceCriteria, fallback?.acceptanceCriteria ?? []),
  };
}

function normalizeNonFunctionalRequirement(
  value: unknown,
  fallback?: NonFunctionalRequirement,
): NonFunctionalRequirement {
  const candidate = (value ?? {}) as Partial<NonFunctionalRequirement>;

  return {
    id: ensureString(candidate.id, fallback?.id ?? "NFR-001"),
    category: ensureString(candidate.category, fallback?.category ?? "General"),
    description: ensureString(candidate.description, fallback?.description ?? "No description provided."),
    priority: ensureString(candidate.priority, fallback?.priority ?? "Should Have") as NonFunctionalRequirement["priority"],
  };
}

export function normalizeBRDOutput(value: unknown, fallback: BRDOutput): BRDOutput {
  const candidate = (value ?? {}) as Partial<BRDOutput>;

  return {
    projectOverview: ensureString(candidate.projectOverview, fallback.projectOverview),
    problemStatement: ensureString(candidate.problemStatement, fallback.problemStatement),
    businessGoals: ensureStringArray(candidate.businessGoals, fallback.businessGoals),
    stakeholders: ensureStringArray(candidate.stakeholders, fallback.stakeholders),
    targetUsers: ensureStringArray(candidate.targetUsers, fallback.targetUsers),
    scope: ensureStringArray(candidate.scope, fallback.scope),
    outOfScope: ensureStringArray(candidate.outOfScope, fallback.outOfScope),
    functionalRequirements: Array.isArray(candidate.functionalRequirements)
      ? candidate.functionalRequirements.map((requirement, index) =>
          normalizeFunctionalRequirement(requirement, fallback.functionalRequirements[index]),
        )
      : fallback.functionalRequirements,
    nonFunctionalRequirements: Array.isArray(candidate.nonFunctionalRequirements)
      ? candidate.nonFunctionalRequirements.map((requirement, index) =>
          normalizeNonFunctionalRequirement(requirement, fallback.nonFunctionalRequirements[index]),
        )
      : fallback.nonFunctionalRequirements,
    businessRules: ensureStringArray(candidate.businessRules, fallback.businessRules),
    userRoles: ensureStringArray(candidate.userRoles, fallback.userRoles),
    useCases: ensureStringArray(candidate.useCases, fallback.useCases),
    assumptions: ensureStringArray(candidate.assumptions, fallback.assumptions),
    risks: ensureStringArray(candidate.risks, fallback.risks),
    successCriteria: ensureStringArray(candidate.successCriteria, fallback.successCriteria),
    kpis: ensureStringArray(candidate.kpis, fallback.kpis),
    acceptanceCriteria: ensureStringArray(candidate.acceptanceCriteria, fallback.acceptanceCriteria),
  };
}

function normalizeFlow(value: unknown, fallback: MermaidFlowchart): MermaidFlowchart {
  const candidate = (value ?? {}) as Partial<MermaidFlowchart>;

  return validateFlowchartArtifact({
    id: ensureString(candidate.id, fallback.id),
    name: ensureString(candidate.name, fallback.name),
    description: ensureString(candidate.description, fallback.description),
    mermaid: ensureString(candidate.mermaid, fallback.mermaid),
    relatedRequirements: ensureStringArray(candidate.relatedRequirements, fallback.relatedRequirements),
  });
}

export function normalizeFlowchartOutput(value: unknown, fallback: FlowchartOutput): FlowchartOutput {
  const candidate = (value ?? {}) as Partial<FlowchartOutput>;

  return {
    mainFlow: normalizeFlow(candidate.mainFlow, fallback.mainFlow),
    registrationFlow: normalizeFlow(candidate.registrationFlow, fallback.registrationFlow),
    loginFlow: normalizeFlow(candidate.loginFlow, fallback.loginFlow),
    coreBusinessFlow: normalizeFlow(candidate.coreBusinessFlow, fallback.coreBusinessFlow),
    adminFlow: normalizeFlow(candidate.adminFlow, fallback.adminFlow),
    projectTypeFlows: Array.isArray(candidate.projectTypeFlows)
      ? candidate.projectTypeFlows.map((flow, index) => normalizeFlow(flow, fallback.projectTypeFlows[index] ?? fallback.mainFlow))
      : fallback.projectTypeFlows,
    exceptionFlows: Array.isArray(candidate.exceptionFlows)
      ? candidate.exceptionFlows.map((flow, index) => normalizeFlow(flow, fallback.exceptionFlows[index] ?? fallback.mainFlow))
      : fallback.exceptionFlows,
    decisionPoints: ensureStringArray(candidate.decisionPoints, fallback.decisionPoints),
    validationNotes: ensureStringArray(candidate.validationNotes, fallback.validationNotes),
  };
}

export function normalizeUXOutput(value: unknown, fallback: UXOutput): UXOutput {
  const candidate = (value ?? {}) as Partial<UXOutput>;

  return {
    personas: ensureStringArray(candidate.personas, fallback.personas),
    userJourney: ensureStringArray(candidate.userJourney, fallback.userJourney),
    informationArchitecture: ensureStringArray(candidate.informationArchitecture, fallback.informationArchitecture),
    navigationFlow: ensureStringArray(candidate.navigationFlow, fallback.navigationFlow),
    uxNotes: ensureStringArray(candidate.uxNotes, fallback.uxNotes),
    painPoints: ensureStringArray(candidate.painPoints, fallback.painPoints),
    accessibilityNotes: ensureStringArray(candidate.accessibilityNotes, fallback.accessibilityNotes),
  };
}

export function normalizeUserStory(value: unknown, fallback?: UserStory): UserStory {
  const candidate = (value ?? {}) as Partial<UserStory>;

  return {
    id: ensureString(candidate.id, fallback?.id ?? "US-001"),
    role: ensureString(candidate.role, fallback?.role ?? "Registered User"),
    action: ensureString(candidate.action, fallback?.action ?? "complete the workflow"),
    benefit: ensureString(candidate.benefit, fallback?.benefit ?? "achieve the business outcome"),
    statement: ensureString(candidate.statement, fallback?.statement ?? "As a user, I want to complete the workflow so that I can achieve the outcome."),
    relatedRequirements: ensureStringArray(candidate.relatedRequirements, fallback?.relatedRequirements ?? []),
    acceptanceCriteria: ensureStringArray(candidate.acceptanceCriteria, fallback?.acceptanceCriteria ?? []),
  };
}

function normalizeScreen(value: unknown, fallback?: UIScreen): UIScreen {
  const candidate = (value ?? {}) as Partial<UIScreen>;

  return {
    id: ensureString(candidate.id, fallback?.id ?? "SCR-001"),
    name: ensureString(candidate.name, fallback?.name ?? "Unnamed Screen"),
    purpose: ensureString(candidate.purpose, fallback?.purpose ?? "No purpose provided."),
    relatedRequirements: ensureStringArray(candidate.relatedRequirements, fallback?.relatedRequirements ?? []),
    relatedUserStories: ensureStringArray(candidate.relatedUserStories, fallback?.relatedUserStories ?? []),
    dataDisplayed: ensureStringArray(candidate.dataDisplayed, fallback?.dataDisplayed ?? []),
    mainComponents: ensureStringArray(candidate.mainComponents, fallback?.mainComponents ?? []),
    actions: ensureStringArray(candidate.actions, fallback?.actions ?? []),
    validationRules: ensureStringArray(candidate.validationRules, fallback?.validationRules ?? []),
    emptyState: ensureString(candidate.emptyState, fallback?.emptyState ?? ""),
    errorState: ensureString(candidate.errorState, fallback?.errorState ?? ""),
    successState: ensureString(candidate.successState, fallback?.successState ?? ""),
    responsiveBehavior: ensureString(candidate.responsiveBehavior, fallback?.responsiveBehavior ?? ""),
  };
}

export function normalizeUserStories(value: unknown, fallback: UserStory[]): UserStory[] {
  return Array.isArray(value)
    ? value.map((story, index) => normalizeUserStory(story, fallback[index]))
    : fallback;
}

export function normalizeUIOutput(value: unknown, fallback: UIOutput): UIOutput {
  const candidate = (value ?? {}) as Partial<UIOutput>;

  return {
    screens: Array.isArray(candidate.screens)
      ? candidate.screens.map((screen, index) => normalizeScreen(screen, fallback.screens[index]))
      : fallback.screens,
    designNotes: ensureStringArray(candidate.designNotes, fallback.designNotes),
  };
}

export function normalizePrioritizedRequirements(
  value: unknown,
  fallback: PrioritizedRequirements,
): PrioritizedRequirements {
  const candidate = (value ?? {}) as Partial<PrioritizedRequirements>;

  return {
    mustHave: Array.isArray(candidate.mustHave)
      ? candidate.mustHave.map((requirement, index) => normalizeFunctionalRequirement(requirement, fallback.mustHave[index]))
      : fallback.mustHave,
    shouldHave: Array.isArray(candidate.shouldHave)
      ? candidate.shouldHave.map((requirement, index) => normalizeFunctionalRequirement(requirement, fallback.shouldHave[index]))
      : fallback.shouldHave,
    couldHave: Array.isArray(candidate.couldHave)
      ? candidate.couldHave.map((requirement, index) => normalizeFunctionalRequirement(requirement, fallback.couldHave[index]))
      : fallback.couldHave,
    wontHaveNow: Array.isArray(candidate.wontHaveNow)
      ? candidate.wontHaveNow.map((requirement, index) => normalizeFunctionalRequirement(requirement, fallback.wontHaveNow[index]))
      : fallback.wontHaveNow,
  };
}

function normalizeTraceabilityEntry(
  value: unknown,
  fallback?: TraceabilityMatrixEntry,
): TraceabilityMatrixEntry {
  const candidate = (value ?? {}) as Partial<TraceabilityMatrixEntry>;

  return {
    requirementId: ensureString(candidate.requirementId, fallback?.requirementId ?? "FR-001"),
    requirementTitle: ensureString(candidate.requirementTitle, fallback?.requirementTitle ?? "Unnamed Requirement"),
    relatedFlowcharts: ensureStringArray(candidate.relatedFlowcharts, fallback?.relatedFlowcharts ?? []),
    relatedScreens: ensureStringArray(candidate.relatedScreens, fallback?.relatedScreens ?? []),
    relatedUserStories: ensureStringArray(candidate.relatedUserStories, fallback?.relatedUserStories ?? []),
    relatedAcceptanceCriteria: ensureStringArray(candidate.relatedAcceptanceCriteria, fallback?.relatedAcceptanceCriteria ?? []),
  };
}

export function normalizeQualityScore(value: unknown, fallback: QualityScore): QualityScore {
  const candidate = (value ?? {}) as Partial<QualityScore>;

  return {
    brd: ensureNumber(candidate.brd, fallback.brd),
    flowcharts: ensureNumber(candidate.flowcharts, fallback.flowcharts),
    ux: ensureNumber(candidate.ux, fallback.ux),
    ui: ensureNumber(candidate.ui, fallback.ui),
    overall: ensureNumber(candidate.overall, fallback.overall),
  };
}

export function normalizeReviewOutput(value: unknown, fallback: ReviewOutput): ReviewOutput {
  const candidate = (value ?? {}) as Partial<ReviewOutput>;

  return {
    consistencyCheck: ensureStringArray(candidate.consistencyCheck, fallback.consistencyCheck),
    strengths: ensureStringArray(candidate.strengths, fallback.strengths),
    weaknesses: ensureStringArray(candidate.weaknesses, fallback.weaknesses),
    missingItems: ensureStringArray(candidate.missingItems, fallback.missingItems),
    recommendations: ensureStringArray(candidate.recommendations, fallback.recommendations),
  };
}

function normalizeExports(value: unknown, fallback: ExportBundle): ExportBundle {
  const candidate = (value ?? {}) as Partial<ExportBundle>;

  return {
    markdown: ensureString(candidate.markdown, fallback.markdown),
    json: ensureString(candidate.json, fallback.json),
    mermaid: ensureString(candidate.mermaid, fallback.mermaid),
    brd: ensureString(candidate.brd, fallback.brd),
    uiux: ensureString(candidate.uiux, fallback.uiux),
    flowcharts: ensureString(candidate.flowcharts, fallback.flowcharts),
  };
}

function normalizeVersion(value: unknown, fallback: VersionInfo): VersionInfo {
  const candidate = (value ?? {}) as Partial<VersionInfo>;

  return {
    number: ensureString(candidate.number, fallback.number),
    originalIdea: ensureString(candidate.originalIdea, fallback.originalIdea),
    date: ensureString(candidate.date, fallback.date),
    changesSummary: ensureString(candidate.changesSummary, fallback.changesSummary),
    generatedOutput: ensureString(candidate.generatedOutput, fallback.generatedOutput),
  };
}

export function normalizeProjectAnalysis(value: unknown, fallback: ProjectAnalysis): ProjectAnalysis {
  const candidate = (value ?? {}) as Partial<ProjectAnalysis>;

  return {
    idea: ensureString(candidate.idea, fallback.idea),
    projectType: ensureProjectType(candidate.projectType, fallback.projectType),
    clarification: normalizeClarificationOutput(candidate.clarification, fallback.clarification),
    assumptions: ensureStringArray(candidate.assumptions, fallback.assumptions),
    prioritizedRequirements: normalizePrioritizedRequirements(candidate.prioritizedRequirements, fallback.prioritizedRequirements),
    brd: normalizeBRDOutput(candidate.brd, fallback.brd),
    flowcharts: normalizeFlowchartOutput(candidate.flowcharts, fallback.flowcharts),
    ux: normalizeUXOutput(candidate.ux, fallback.ux),
    userStories: normalizeUserStories(candidate.userStories, fallback.userStories),
    ui: normalizeUIOutput(candidate.ui, fallback.ui),
    traceabilityMatrix: Array.isArray(candidate.traceabilityMatrix)
      ? candidate.traceabilityMatrix.map((entry, index) => normalizeTraceabilityEntry(entry, fallback.traceabilityMatrix[index]))
      : fallback.traceabilityMatrix,
    qualityScore: normalizeQualityScore(candidate.qualityScore, fallback.qualityScore),
    review: normalizeReviewOutput(candidate.review, fallback.review),
    exports: normalizeExports(candidate.exports, fallback.exports),
    version: normalizeVersion(candidate.version, fallback.version),
    versionHistory: Array.isArray(candidate.versionHistory)
      ? candidate.versionHistory.map((entry, index) => normalizeVersion(entry, fallback.versionHistory[index] ?? fallback.version))
      : fallback.versionHistory,
    finalMarkdownReport: ensureString(candidate.finalMarkdownReport, fallback.finalMarkdownReport),
  };
}
