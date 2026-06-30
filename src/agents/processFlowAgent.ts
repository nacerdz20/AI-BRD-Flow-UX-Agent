import { createFlowchartPrompt } from "../prompts/flowchartPrompt";
import {
  formatSequence,
  safeParseJson,
} from "../services/analysisUtils";
import { generateWithLLM } from "../services/llmProvider";
import { validateAndRepairMermaid } from "../services/mermaidValidator";
import { normalizeFlowchartOutput } from "../services/outputSanitizers";
import { buildProjectContext, type ProjectContext } from "../services/projectContext";
import { findRequirementIdsByKeywords } from "../services/requirements";
import type {
  BRDOutput,
  FlowchartOutput,
  MermaidFlowchart,
} from "../types/projectAnalysis";

function flow(
  id: string,
  name: string,
  description: string,
  mermaid: string,
  relatedRequirements: string[],
): MermaidFlowchart {
  const { mermaid: repaired, issues } = validateAndRepairMermaid(mermaid);

  return {
    id,
    name,
    description: issues.length > 0 ? `${description} Validation notes: ${issues.join(" ")}` : description,
    mermaid: repaired,
    relatedRequirements,
  };
}

function detectEntity(context: ProjectContext): string {
  return context.keyEntities[0]?.toLowerCase() ?? "workflow item";
}

function buildProjectTypeFlows(
  brd: BRDOutput,
  context: ProjectContext,
): MermaidFlowchart[] {
  return context.template.extraFlows.map((hint, index) => {
    const relatedRequirements = findRequirementIdsByKeywords(brd.functionalRequirements, [hint.relatedTheme, hint.name]);
    const { mermaid } = validateAndRepairMermaid(
      [
        "flowchart TD",
        "    A(Start)",
        `    B[User enters the ${hint.name.toLowerCase()}]`,
        `    C[System captures ${hint.relatedTheme} details]`,
        "    D[Business rules and permissions are validated]",
        "    E{Valid to continue?}",
        "    F[Advance the process and update status]",
        "    G[Return guidance or correction request]",
        "    H(End)",
        "    A --> B --> C --> D --> E",
        "    E -- Yes --> F --> H",
        "    E -- No --> G --> C",
      ].join("\n"),
    );

    return flow(
      formatSequence("FLOW", index + 6),
      hint.name,
      hint.description,
      mermaid,
      relatedRequirements,
    );
  });
}

export async function runProcessFlowAgent(
  brd: BRDOutput,
  context = buildProjectContext(brd.projectOverview || ""),
): Promise<FlowchartOutput> {
  const entity = detectEntity(context);
  const hasAdmin = brd.userRoles.some((role) => role.toLowerCase().includes("admin"));

  const mainFlow = flow(
    "FLOW-001",
    "Main Process Flow",
    "Primary end-to-end flow from access into the governed business process.",
    [
      "flowchart TD",
      "    A(Start)",
      "    B[User identifies a need and enters the product]",
      "    C{Authenticated?}",
      "    D[Register account]",
      "    E[Log in]",
      "    F[Open the role-based dashboard]",
      `    G[Create or update the ${entity}]`,
      "    H[Validate required data and business rules]",
      "    I{Eligible for next stage?}",
      "    J[Route to the next workflow state]",
      "    K[Show status, feedback, and next action]",
      "    L{Completed successfully?}",
      "    M[Close the workflow and keep the audit trail]",
      "    N[Return for correction or exception handling]",
      "    O(End)",
      "    A --> B --> C",
      "    C -- No --> D --> E --> F",
      "    C -- Yes --> E --> F",
      "    F --> G --> H --> I",
      "    I -- Yes --> J --> K --> L",
      "    I -- No --> N --> G",
      "    L -- Yes --> M --> O",
      "    L -- No --> N",
    ].join("\n"),
    findRequirementIdsByKeywords(brd.functionalRequirements, ["dashboard", "status", "track", "workflow"]),
  );

  const registrationFlow = flow(
    "FLOW-002",
    "Registration Flow",
    "Capture access details and create an initial account safely.",
    [
      "flowchart TD",
      "    A(Start)",
      "    B[Guest opens registration]",
      "    C[Guest enters mandatory identity and access data]",
      "    D[System validates form rules]",
      "    E{Valid input?}",
      "    F[Create account and initialize profile]",
      "    G[Display validation messages]",
      "    H[Prompt next access step]",
      "    I(End)",
      "    A --> B --> C --> D --> E",
      "    E -- Yes --> F --> H --> I",
      "    E -- No --> G --> C",
    ].join("\n"),
    findRequirementIdsByKeywords(brd.functionalRequirements, ["register", "authenticate", "account"]),
  );

  const loginFlow = flow(
    "FLOW-003",
    "Login Flow",
    "Authenticate the user and route them into the right workspace.",
    [
      "flowchart TD",
      "    A(Start)",
      "    B[User opens login]",
      "    C[User submits credentials]",
      "    D[System authenticates the account]",
      "    E{Credentials valid?}",
      "    F[Load the appropriate workspace by role]",
      "    G[Show retry and recovery guidance]",
      "    H(End)",
      "    A --> B --> C --> D --> E",
      "    E -- Yes --> F --> H",
      "    E -- No --> G --> C",
    ].join("\n"),
    findRequirementIdsByKeywords(brd.functionalRequirements, ["authenticate", "access", "role"]),
  );

  const coreBusinessFlow = flow(
    "FLOW-004",
    "Core Business Flow",
    "Capture the core governed record and move it through a controlled lifecycle.",
    [
      "flowchart TD",
      "    A(Start)",
      `    B[User starts work on the ${entity}]`,
      `    C[System captures ${entity} details and supporting inputs]`,
      "    D[Business rules, status prerequisites, and completeness checks run]",
      `    E{Is the ${entity} valid for progression?}`,
      "    F[Move record into the next governed state]",
      "    G[Return record with correction guidance]",
      "    H[Persist decision history and timeline]",
      "    I(End)",
      "    A --> B --> C --> D --> E",
      "    E -- Yes --> F --> H --> I",
      "    E -- No --> G --> C",
    ].join("\n"),
    findRequirementIdsByKeywords(brd.functionalRequirements, ["track", "review", "status", "approve"]),
  );

  const adminFlow = flow(
    "FLOW-005",
    "Admin Flow",
    hasAdmin
      ? "Review, approve, reject, or correct operational records from the admin workspace."
      : "No dedicated admin flow is required, but a placeholder is kept for consistency.",
    hasAdmin
      ? [
          "flowchart TD",
          "    A(Start)",
          "    B[Administrator opens the review dashboard]",
          "    C[Inspect queue priorities and exception indicators]",
          "    D[Open the record and supporting evidence]",
          "    E{Decision required?}",
          "    F[Approve and advance the record]",
          "    G[Reject or return with explanation]",
          "    H[Escalate or request more information]",
          "    I[Record the decision and notify the owner]",
          "    J(End)",
          "    A --> B --> C --> D --> E",
          "    E -- Approve --> F --> I --> J",
          "    E -- Reject --> G --> I",
          "    E -- Escalate --> H --> I",
        ].join("\n")
      : [
          "flowchart TD",
          "    A(Start)",
          "    B[No dedicated admin review flow is required]",
          "    C(End)",
          "    A --> B --> C",
        ].join("\n"),
    findRequirementIdsByKeywords(brd.functionalRequirements, ["approve", "review", "admin", "permission"]),
  );

  const exceptionFlows: MermaidFlowchart[] = [
    flow(
      formatSequence("FLOW", 9),
      "Validation Exception Flow",
      "Handle incomplete or invalid submissions before they contaminate the workflow state.",
      [
        "flowchart TD",
        "    A(Start)",
        `    B[User submits an incomplete ${entity}]`,
        "    C[System blocks progression and highlights the issue]",
        "    D[User fixes data or uploads missing evidence]",
        "    E[System revalidates the record]",
        "    F(End)",
        "    A --> B --> C --> D --> E --> F",
      ].join("\n"),
      findRequirementIdsByKeywords(brd.functionalRequirements, ["validate", "status", "correction"]),
    ),
    flow(
      formatSequence("FLOW", 10),
      "Business Rule Exception Flow",
      "Handle review conflicts, policy exceptions, or escalations cleanly.",
      [
        "flowchart TD",
        "    A(Start)",
        "    B[Reviewer detects a business-rule or policy conflict]",
        "    C[Record moves to exception status]",
        "    D[Owner receives explanation and next action]",
        "    E[Record is corrected, escalated, or closed]",
        "    F(End)",
        "    A --> B --> C --> D --> E --> F",
      ].join("\n"),
      findRequirementIdsByKeywords(brd.functionalRequirements, ["review", "exception", "approve"]),
    ),
  ];

  const projectTypeFlows = buildProjectTypeFlows(brd, context);

  const draft: FlowchartOutput = {
    mainFlow,
    registrationFlow,
    loginFlow,
    coreBusinessFlow,
    adminFlow,
    projectTypeFlows,
    exceptionFlows,
    decisionPoints: [
      "Does the user need to register before proceeding?",
      `Is the ${entity} complete enough to continue?`,
      "Does the workflow require review, approval, or escalation?",
      "Can the workflow close, or must it return for correction?",
    ],
    validationNotes: [
      "All Mermaid flows were passed through the validator before being returned.",
    ],
  };

  const prompt = createFlowchartPrompt(brd, draft);
  const response = await generateWithLLM(prompt);

  return normalizeFlowchartOutput(
    safeParseJson<FlowchartOutput>(response, draft),
    draft,
  );
}
