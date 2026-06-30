export type AnalysisTab =
  | "brd"
  | "flowcharts"
  | "ux"
  | "ui"
  | "traceabilityMatrix"
  | "qualityReview"
  | "finalReport";

export type ProjectType =
  | "SaaS"
  | "E-commerce"
  | "Booking Platform"
  | "Marketplace"
  | "CRM"
  | "ERP"
  | "Education Platform"
  | "Admin Dashboard"
  | "Mobile App"
  | "General Digital Product";

export type RequirementPriority =
  | "Must Have"
  | "Should Have"
  | "Could Have"
  | "Won't Have Now";

export interface ClarificationOutput {
  missingInformation: string[];
  questions: string[];
  assumptions: string[];
  detectedDomain: string;
  detectedSystemType: string;
  detectedPrimaryUsers: string[];
  completenessSummary: string;
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: RequirementPriority;
  relatedUserRole: string;
  acceptanceCriteria: string[];
}

export interface NonFunctionalRequirement {
  id: string;
  category: string;
  description: string;
  priority: RequirementPriority;
}

export interface PrioritizedRequirements {
  mustHave: FunctionalRequirement[];
  shouldHave: FunctionalRequirement[];
  couldHave: FunctionalRequirement[];
  wontHaveNow: FunctionalRequirement[];
}

export interface BRDOutput {
  projectOverview: string;
  problemStatement: string;
  businessGoals: string[];
  stakeholders: string[];
  targetUsers: string[];
  scope: string[];
  outOfScope: string[];
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirement[];
  businessRules: string[];
  userRoles: string[];
  useCases: string[];
  assumptions: string[];
  risks: string[];
  successCriteria: string[];
  kpis: string[];
  acceptanceCriteria: string[];
}

export interface MermaidFlowchart {
  id: string;
  name: string;
  description: string;
  mermaid: string;
  relatedRequirements: string[];
}

export interface FlowchartOutput {
  mainFlow: MermaidFlowchart;
  registrationFlow: MermaidFlowchart;
  loginFlow: MermaidFlowchart;
  coreBusinessFlow: MermaidFlowchart;
  adminFlow: MermaidFlowchart;
  projectTypeFlows: MermaidFlowchart[];
  exceptionFlows: MermaidFlowchart[];
  decisionPoints: string[];
  validationNotes: string[];
}

export interface UXOutput {
  personas: string[];
  userJourney: string[];
  informationArchitecture: string[];
  navigationFlow: string[];
  uxNotes: string[];
  painPoints: string[];
  accessibilityNotes: string[];
}

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
  statement: string;
  relatedRequirements: string[];
  acceptanceCriteria: string[];
}

export interface UIScreen {
  id: string;
  name: string;
  purpose: string;
  relatedRequirements: string[];
  relatedUserStories: string[];
  dataDisplayed: string[];
  mainComponents: string[];
  actions: string[];
  validationRules: string[];
  emptyState: string;
  errorState: string;
  successState: string;
  responsiveBehavior: string;
}

export interface UIOutput {
  screens: UIScreen[];
  designNotes: string[];
}

export interface TraceabilityMatrixEntry {
  requirementId: string;
  requirementTitle: string;
  relatedFlowcharts: string[];
  relatedScreens: string[];
  relatedUserStories: string[];
  relatedAcceptanceCriteria: string[];
}

export interface QualityScore {
  brd: number;
  flowcharts: number;
  ux: number;
  ui: number;
  overall: number;
}

export interface ReviewOutput {
  consistencyCheck: string[];
  strengths: string[];
  weaknesses: string[];
  missingItems: string[];
  recommendations: string[];
}

export interface ExportBundle {
  markdown: string;
  json: string;
  mermaid: string;
  brd: string;
  uiux: string;
  flowcharts: string;
}

export interface VersionInfo {
  number: string;
  originalIdea: string;
  date: string;
  changesSummary: string;
  generatedOutput: string;
}

export interface ProjectAnalysis {
  idea: string;
  projectType: ProjectType;
  clarification: ClarificationOutput;
  assumptions: string[];
  prioritizedRequirements: PrioritizedRequirements;
  brd: BRDOutput;
  flowcharts: FlowchartOutput;
  ux: UXOutput;
  userStories: UserStory[];
  ui: UIOutput;
  traceabilityMatrix: TraceabilityMatrixEntry[];
  qualityScore: QualityScore;
  review: ReviewOutput;
  exports: ExportBundle;
  version: VersionInfo;
  versionHistory: VersionInfo[];
  finalMarkdownReport: string;
}
