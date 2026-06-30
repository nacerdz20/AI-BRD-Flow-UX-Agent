import { normalizeIdea, uniqueStrings } from "./analysisUtils";
import {
  getProjectTemplate,
  PROJECT_TYPE_TEMPLATES,
  type ProjectTemplate,
} from "./projectTemplates";
import type { ProjectType } from "../types/projectAnalysis";

export interface IdeaValidationResult {
  normalizedIdea: string;
  wordCount: number;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface ProjectContext {
  normalizedIdea: string;
  keywords: string[];
  domain: string;
  projectType: ProjectType;
  systemType: string;
  userRoles: string[];
  primaryUsers: string[];
  targetUsers: string[];
  coreCapabilities: string[];
  keyEntities: string[];
  stakeholders: string[];
  missingDetails: string[];
  clarificationQuestions: string[];
  assumptions: string[];
  successMetrics: string[];
  template: ProjectTemplate;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "app",
  "application",
  "build",
  "for",
  "from",
  "idea",
  "into",
  "of",
  "platform",
  "project",
  "simple",
  "system",
  "that",
  "the",
  "to",
  "with",
  "this",
  "من",
  "في",
  "على",
  "إلى",
  "عن",
  "مع",
  "هذا",
  "هذه",
  "ذلك",
  "تطبيق",
  "منصة",
  "مشروع",
  "نظام",
  "فكرة",
]);

const ADDITIONAL_ROLE_TRIGGERS: Array<{ trigger: RegExp; role: string }> = [
  { trigger: /(parent|guardian|ولي|أولياء)/i, role: "Parent / Guardian" },
  { trigger: /(teacher|coach|trainer|معلم|مدرب)/i, role: "Teacher / Coach" },
  { trigger: /(manager|operator|operations|مشرف|مدير)/i, role: "Operations Manager" },
  { trigger: /(seller|vendor|partner|merchant|بائع|شريك)/i, role: "Seller / Partner" },
  { trigger: /(buyer|customer|client|مشتري|عميل)/i, role: "Customer" },
  { trigger: /(student|learner|طالب|متعلم)/i, role: "Student" },
];

function tokenizeIdea(idea: string): string[] {
  const matches = normalizeIdea(idea).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

  return matches.filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreTemplate(tokens: string[], template: ProjectTemplate): number {
  return template.triggers.reduce((score, trigger) => score + Number(tokens.includes(trigger)), 0);
}

function detectProjectType(tokens: string[]): ProjectType {
  const ranked = PROJECT_TYPE_TEMPLATES
    .map((template) => ({ template, score: scoreTemplate(tokens, template) }))
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.score ? ranked[0].template.projectType : "General Digital Product";
}

function deriveRoles(normalizedIdea: string, template: ProjectTemplate): string[] {
  const roles = [...template.defaultRoles];

  ADDITIONAL_ROLE_TRIGGERS.forEach(({ trigger, role }) => {
    if (trigger.test(normalizedIdea)) {
      roles.push(role);
    }
  });

  return uniqueStrings(roles);
}

function derivePrimaryUsers(roles: string[]): string[] {
  const excluded = new Set(["Guest", "Administrator", "Platform Administrator", "Marketplace Operator"]);

  const primary = roles.filter((role) => !excluded.has(role) && !role.toLowerCase().includes("admin"));

  return primary.length > 0 ? primary : ["Registered User"];
}

function deriveTargetUsers(template: ProjectTemplate, roles: string[]): string[] {
  return uniqueStrings([
    ...derivePrimaryUsers(roles).map((role) => `${role} who directly complete the core workflow.`),
    "Administrators or operators who monitor quality, permissions, and exceptions.",
    "Business stakeholders who need reporting, throughput visibility, and delivery confidence.",
  ]);
}

function deriveStakeholders(roles: string[]): string[] {
  return uniqueStrings([
    "Business sponsor / product owner",
    "Operations lead",
    "UX / UI design lead",
    "Engineering lead",
    "Quality assurance representative",
    ...roles.filter((role) => role !== "Guest").map((role) => `${role} representative`),
  ]);
}

function deriveMissingDetails(tokens: string[], template: ProjectTemplate, normalizedIdea: string): string[] {
  const missing: string[] = [];

  if (!/(user|customer|student|teacher|admin|team|client|طالب|عميل|فريق|مستخدم)/i.test(normalizedIdea)) {
    missing.push("Primary user groups are not explicitly described.");
  }

  if (!/(approval|review|exception|موافقة|مراجعة|استثناء)/i.test(normalizedIdea)) {
    missing.push("Approval, review, or exception ownership is not explicitly described.");
  }

  if (!/(dashboard|report|analytics|إحصائيات|تقارير|لوحة)/i.test(normalizedIdea)) {
    missing.push("Reporting expectations and success metrics are not clearly stated.");
  }

  if (!/(notification|message|email|sms|إشعار|رسالة)/i.test(normalizedIdea)) {
    missing.push("Notification channels and follow-up rules are not specified.");
  }

  if (!/(mobile|ios|android|responsive|جوال|موبايل)/i.test(normalizedIdea) && template.projectType !== "Mobile App") {
    missing.push("Device priorities are not stated beyond a reasonable web-first assumption.");
  }

  if (tokens.length < 10) {
    missing.push("The brief is concise enough that some business rules will need to be assumed.");
  }

  return uniqueStrings(missing);
}

function deriveAssumptions(
  template: ProjectTemplate,
  normalizedIdea: string,
  roles: string[],
  missingDetails: string[],
): string[] {
  const assumptions = [
    `The first release is treated as a ${template.systemType.toLowerCase()} with responsive browser support.`,
    "Protected workflows require authentication and role-based access control.",
    "Every record change must leave an audit-friendly status history.",
  ];

  if (!/(payment|billing|invoice|دفع|فاتورة)/i.test(normalizedIdea)) {
    assumptions.push("Payments or billing are outside the first release unless they are explicitly central to the business flow.");
  }

  if (roles.some((role) => role.toLowerCase().includes("admin")) || roles.includes("Operations Manager")) {
    assumptions.push("An administrative or operational role owns approvals, escalations, and exceptions.");
  }

  missingDetails.forEach((detail) => {
    if (detail.includes("Primary user groups")) {
      assumptions.push("The system supports one primary execution role and at least one administrative oversight role.");
    }

    if (detail.includes("Approval")) {
      assumptions.push("Material status changes can be approved, rejected, or returned for correction by an authorized role.");
    }

    if (detail.includes("Reporting")) {
      assumptions.push("The MVP includes summaries for throughput, status distribution, and turnaround time.");
    }

    if (detail.includes("Notification")) {
      assumptions.push("The initial release relies on in-app status updates, with external channels deferred unless required later.");
    }
  });

  return uniqueStrings(assumptions);
}

function deriveClarificationQuestions(
  template: ProjectTemplate,
  missingDetails: string[],
): string[] {
  return uniqueStrings([
    ...template.clarificationQuestions,
    ...missingDetails.map((detail) => `Clarify: ${detail}`),
  ]).slice(0, 8);
}

function deriveCapabilities(template: ProjectTemplate): string[] {
  return uniqueStrings([
    ...template.mustHaveFeatures,
    ...template.shouldHaveFeatures,
  ]);
}

export function extractIdeaKeywords(idea: string): string[] {
  return uniqueStrings(tokenizeIdea(idea)).slice(0, 18);
}

export function validateProjectIdeaInput(idea: string): IdeaValidationResult {
  const normalizedIdea = normalizeIdea(idea);
  const words = normalizedIdea.match(/[\p{L}\p{N}]+/gu) ?? [];
  const errors: string[] = [];

  if (!normalizedIdea) {
    errors.push("Project idea is required.");
  }

  if (words.length > 0 && words.length < 6) {
    errors.push("Add more detail: include users, the problem, and the main workflow.");
  }

  if (normalizedIdea.length > 2500) {
    errors.push("The idea is too long for this lightweight analyzer. Keep it under 2500 characters.");
  }

  const tokens = extractIdeaKeywords(normalizedIdea);
  const projectType = detectProjectType(tokens);
  const template = getProjectTemplate(projectType);
  const warnings = deriveMissingDetails(tokens, template, normalizedIdea).slice(0, 4);

  return {
    normalizedIdea,
    wordCount: words.length,
    errors,
    warnings,
    isValid: errors.length === 0,
  };
}

export function buildProjectContext(idea: string): ProjectContext {
  const normalizedIdea = normalizeIdea(idea);
  const keywords = extractIdeaKeywords(normalizedIdea);
  const projectType = detectProjectType(keywords);
  const template = getProjectTemplate(projectType);
  const userRoles = deriveRoles(normalizedIdea, template);
  const primaryUsers = derivePrimaryUsers(userRoles);
  const missingDetails = deriveMissingDetails(keywords, template, normalizedIdea);

  return {
    normalizedIdea,
    keywords,
    domain: template.domain,
    projectType,
    systemType: template.systemType,
    userRoles,
    primaryUsers,
    targetUsers: deriveTargetUsers(template, userRoles),
    coreCapabilities: deriveCapabilities(template),
    keyEntities: uniqueStrings(template.entities),
    stakeholders: deriveStakeholders(userRoles),
    missingDetails,
    clarificationQuestions: deriveClarificationQuestions(template, missingDetails),
    assumptions: deriveAssumptions(template, normalizedIdea, userRoles, missingDetails),
    successMetrics: uniqueStrings(template.metrics),
    template,
  };
}
