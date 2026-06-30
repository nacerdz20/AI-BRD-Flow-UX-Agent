import type {
  BRDOutput,
  ClarificationOutput,
  ExportBundle,
  FlowchartOutput,
  PrioritizedRequirements,
  ProjectAnalysis,
  ProjectType,
  QualityScore,
  ReviewOutput,
  UIOutput,
  UXOutput,
  VersionInfo,
} from "../types/projectAnalysis";

export function normalizeIdea(idea: string): string {
  return idea.replace(/\s+/g, " ").trim();
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function slugify(value: string): string {
  return normalizeIdea(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function formatSequence(prefix: string, index: number, width = 3): string {
  return `${prefix}-${String(index).padStart(width, "0")}`;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function averageScores(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function createEmptyClarification(): ClarificationOutput {
  return {
    missingInformation: [],
    questions: [],
    assumptions: [],
    detectedDomain: "",
    detectedSystemType: "",
    detectedPrimaryUsers: [],
    completenessSummary: "",
  };
}

export function createEmptyPrioritizedRequirements(): PrioritizedRequirements {
  return {
    mustHave: [],
    shouldHave: [],
    couldHave: [],
    wontHaveNow: [],
  };
}

export function createEmptyBRD(): BRDOutput {
  return {
    projectOverview: "",
    problemStatement: "",
    businessGoals: [],
    stakeholders: [],
    targetUsers: [],
    scope: [],
    outOfScope: [],
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    businessRules: [],
    userRoles: [],
    useCases: [],
    assumptions: [],
    risks: [],
    successCriteria: [],
    kpis: [],
    acceptanceCriteria: [],
  };
}

export function createEmptyFlowcharts(): FlowchartOutput {
  return {
    mainFlow: {
      id: "FLOW-001",
      name: "Main Process Flow",
      description: "",
      mermaid: "flowchart TD\n    A(Start)\n    A --> B(End)",
      relatedRequirements: [],
    },
    registrationFlow: {
      id: "FLOW-002",
      name: "Registration Flow",
      description: "",
      mermaid: "flowchart TD\n    A(Start)\n    A --> B(End)",
      relatedRequirements: [],
    },
    loginFlow: {
      id: "FLOW-003",
      name: "Login Flow",
      description: "",
      mermaid: "flowchart TD\n    A(Start)\n    A --> B(End)",
      relatedRequirements: [],
    },
    coreBusinessFlow: {
      id: "FLOW-004",
      name: "Core Business Flow",
      description: "",
      mermaid: "flowchart TD\n    A(Start)\n    A --> B(End)",
      relatedRequirements: [],
    },
    adminFlow: {
      id: "FLOW-005",
      name: "Admin Flow",
      description: "",
      mermaid: "flowchart TD\n    A(Start)\n    A --> B(End)",
      relatedRequirements: [],
    },
    projectTypeFlows: [],
    exceptionFlows: [],
    decisionPoints: [],
    validationNotes: [],
  };
}

export function createEmptyUX(): UXOutput {
  return {
    personas: [],
    userJourney: [],
    informationArchitecture: [],
    navigationFlow: [],
    uxNotes: [],
    painPoints: [],
    accessibilityNotes: [],
  };
}

export function createEmptyUI(): UIOutput {
  return {
    screens: [],
    designNotes: [],
  };
}

export function createEmptyReview(): ReviewOutput {
  return {
    consistencyCheck: [],
    strengths: [],
    weaknesses: [],
    missingItems: [],
    recommendations: [],
  };
}

export function createEmptyQualityScore(): QualityScore {
  return {
    brd: 0,
    flowcharts: 0,
    ux: 0,
    ui: 0,
    overall: 0,
  };
}

export function createEmptyExports(): ExportBundle {
  return {
    markdown: "",
    json: "",
    mermaid: "",
    brd: "",
    uiux: "",
    flowcharts: "",
  };
}

export function createEmptyVersion(): VersionInfo {
  return {
    number: "v001",
    originalIdea: "",
    date: "",
    changesSummary: "",
    generatedOutput: "",
  };
}

export function createEmptyAnalysis(idea: string): ProjectAnalysis {
  return {
    idea,
    projectType: "General Digital Product" satisfies ProjectType,
    clarification: createEmptyClarification(),
    assumptions: [],
    prioritizedRequirements: createEmptyPrioritizedRequirements(),
    brd: createEmptyBRD(),
    flowcharts: createEmptyFlowcharts(),
    ux: createEmptyUX(),
    userStories: [],
    ui: createEmptyUI(),
    traceabilityMatrix: [],
    qualityScore: createEmptyQualityScore(),
    review: createEmptyReview(),
    exports: createEmptyExports(),
    version: createEmptyVersion(),
    versionHistory: [],
    finalMarkdownReport: "",
  };
}
