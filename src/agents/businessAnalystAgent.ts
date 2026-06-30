import { createBRDPrompt } from "../prompts/brdPrompt";
import {
  formatSequence,
  normalizeIdea,
  safeParseJson,
  uniqueStrings,
} from "../services/analysisUtils";
import { generateWithLLM } from "../services/llmProvider";
import { normalizeBRDOutput } from "../services/outputSanitizers";
import { type ProjectContext } from "../services/projectContext";
import type {
  BRDOutput,
  ClarificationOutput,
  FunctionalRequirement,
  NonFunctionalRequirement,
  RequirementPriority,
} from "../types/projectAnalysis";

function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function roleForFeature(feature: string, context: ProjectContext): string {
  const lowered = feature.toLowerCase();

  if (/(admin|manage|approve|review|permission|report|dashboard)/.test(lowered)) {
    return context.userRoles.find((role) => role.toLowerCase().includes("admin")) ?? "Administrator";
  }

  return context.primaryUsers[0] ?? "Registered User";
}

function buildRequirementDescription(
  feature: string,
  priority: RequirementPriority,
  context: ProjectContext,
): string {
  const entity = context.keyEntities[0]?.toLowerCase() ?? "record";
  const user = roleForFeature(feature, context);

  return `${sentenceCase(feature)} in a way that gives ${user.toLowerCase()} visible status, controlled transitions, and audit-friendly handling of each ${entity}. Priority: ${priority}.`;
}

function buildRequirementAcceptanceCriteria(
  feature: string,
  context: ProjectContext,
): string[] {
  const entity = context.keyEntities[0]?.toLowerCase() ?? "record";

  return [
    `${sentenceCase(feature)} is available from the correct role-based workspace.`,
    `The user receives validation or confirmation feedback before the ${entity} changes state.`,
    `Any resulting update appears in the status history or dashboard summary.`,
  ];
}

function createRequirement(
  id: string,
  title: string,
  description: string,
  priority: RequirementPriority,
  relatedUserRole: string,
  acceptanceCriteria: string[],
): FunctionalRequirement {
  return {
    id,
    title,
    description,
    priority,
    relatedUserRole,
    acceptanceCriteria,
  };
}

function buildFunctionalRequirements(
  context: ProjectContext,
  clarification: ClarificationOutput,
): FunctionalRequirement[] {
  const requirements: FunctionalRequirement[] = [];
  const seenTitles = new Set<string>();

  const pushFeature = (feature: string, priority: RequirementPriority) => {
    const title = sentenceCase(feature.replace(/^support teams to /, "").replace(/^manage /, "Manage "));

    if (seenTitles.has(title.toLowerCase())) {
      return;
    }

    seenTitles.add(title.toLowerCase());
    requirements.push(
      createRequirement(
        formatSequence("FR", requirements.length + 1),
        title,
        buildRequirementDescription(feature, priority, context),
        priority,
        roleForFeature(feature, context),
        buildRequirementAcceptanceCriteria(feature, context),
      ),
    );
  };

  context.template.mustHaveFeatures.forEach((feature) => pushFeature(feature, "Must Have"));
  pushFeature("allow users to register and authenticate into role-based workspaces", "Must Have");
  pushFeature("track status changes, approvals, and correction loops", "Must Have");
  pushFeature("maintain an operational dashboard with search and filters", "Must Have");

  context.template.shouldHaveFeatures.forEach((feature) => pushFeature(feature, "Should Have"));
  context.template.couldHaveFeatures.forEach((feature) => pushFeature(feature, "Could Have"));

  clarification.missingInformation.slice(0, 2).forEach((item) =>
    pushFeature(`surface assumptions related to ${item.toLowerCase().replace(/\.$/, "")}`, "Could Have"),
  );

  context.template.wontHaveNow.forEach((feature) => pushFeature(feature, "Won't Have Now"));

  return requirements;
}

function buildNonFunctionalRequirements(context: ProjectContext): NonFunctionalRequirement[] {
  const definitions: Array<{ category: string; description: string; priority: RequirementPriority }> = [
    {
      category: "Usability",
      description: "The product must remain usable on desktop, tablet, and mobile breakpoints with clear visual hierarchy.",
      priority: "Must Have",
    },
    {
      category: "Accessibility",
      description: "The product must support semantic labels, keyboard navigation, color contrast, and accessible status messaging.",
      priority: "Must Have",
    },
    {
      category: "Reliability",
      description: "The system should preserve workflow progress and avoid data loss during validation, review, or correction loops.",
      priority: "Should Have",
    },
    {
      category: "Scalability",
      description: `The solution should allow future extension for ${context.projectType.toLowerCase()} features without rewriting the core analysis logic.`,
      priority: "Should Have",
    },
  ];

  return definitions.map((definition, index) => ({
    id: formatSequence("NFR", index + 1),
    category: definition.category,
    description: definition.description,
    priority: definition.priority,
  }));
}

export async function runBusinessAnalystAgent(
  projectIdea: string,
  context: ProjectContext,
  clarification: ClarificationOutput,
): Promise<BRDOutput> {
  const normalizedIdea = normalizeIdea(projectIdea);
  const entity = context.keyEntities[0]?.toLowerCase() ?? "workflow item";
  const functionalRequirements = buildFunctionalRequirements(context, clarification);

  const draft: BRDOutput = {
    projectOverview: `${normalizedIdea}. The product is treated as a ${context.systemType.toLowerCase()} for the ${context.projectType.toLowerCase()} use case.`,
    problemStatement: `The organization needs a reliable way to manage ${entity} records, enforce consistent business decisions, and expose clear next steps to both end users and administrators.`,
    businessGoals: uniqueStrings([
      `Standardize how ${entity} records move through the business process.`,
      "Reduce ambiguity before product design and delivery planning start.",
      "Give stakeholders measurable visibility into throughput, quality, and bottlenecks.",
      "Produce a reusable analysis package for product, design, engineering, and QA handoff.",
    ]),
    stakeholders: context.stakeholders,
    targetUsers: context.targetUsers,
    scope: uniqueStrings([
      ...context.template.mustHaveFeatures.map(sentenceCase),
      "Role-based access, operational visibility, and exception handling.",
      "Exportable analysis outputs for stakeholder review and delivery alignment.",
    ]),
    outOfScope: uniqueStrings([
      ...context.template.wontHaveNow.map(sentenceCase),
      "Production-grade external integrations unless explicitly confirmed later.",
      "Native mobile delivery unless the project type requires it from day one.",
    ]),
    functionalRequirements,
    nonFunctionalRequirements: buildNonFunctionalRequirements(context),
    businessRules: uniqueStrings([
      "Protected workflow data is accessible only to authenticated users with the right role.",
      `A ${entity} cannot advance to the next stage unless mandatory data is complete.`,
      "Approvals, rejections, corrections, and overrides must remain visible in the audit trail.",
      "Only authorized roles can resolve exception cases or reopen closed records.",
    ]),
    userRoles: context.userRoles,
    useCases: uniqueStrings([
      `${context.primaryUsers[0] ?? "Primary user"} creates and tracks a ${entity}.`,
      "Administrator reviews pending items, exceptions, or approvals.",
      "Business stakeholder reviews KPI summaries and workflow health.",
      `The product supports ${context.projectType.toLowerCase()}-specific flows without leaving the governed process.`,
    ]),
    assumptions: clarification.assumptions,
    risks: [
      "The original idea may still hide business policies, compliance needs, or integration dependencies.",
      "Stakeholders may interpret workflow stages differently unless terminology is aligned early.",
      "Project-type-specific features can expand scope quickly if prioritization is not enforced.",
    ],
    successCriteria: [
      "Each primary role has a visible, coherent path through the product.",
      "Each must-have requirement is represented in the flowcharts and screen specifications.",
      "Stakeholders can distinguish first-release scope from deferred scope without ambiguity.",
      "The BRD is detailed enough to guide UX, UI, QA, and engineering estimation.",
    ],
    kpis: context.successMetrics,
    acceptanceCriteria: [
      `A user can create, submit, and track a ${entity} through its major lifecycle states.`,
      "Role-based access, review decisions, and correction loops are defined explicitly.",
      "The product exposes dashboards, status history, and next-step guidance clearly.",
      "Assumptions and deferred scope are documented instead of being hidden.",
    ],
  };

  const prompt = createBRDPrompt(context, draft);
  const response = await generateWithLLM(prompt);

  return normalizeBRDOutput(safeParseJson<BRDOutput>(response, draft), draft);
}
