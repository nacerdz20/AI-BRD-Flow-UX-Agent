import { createUIPrompt } from "../prompts/uiPrompt";
import { formatSequence, safeParseJson } from "../services/analysisUtils";
import { generateWithLLM } from "../services/llmProvider";
import { normalizeUIOutput } from "../services/outputSanitizers";
import { type ProjectContext } from "../services/projectContext";
import { findRequirementIdsByKeywords } from "../services/requirements";
import type {
  BRDOutput,
  UIOutput,
  UIScreen,
  UserStory,
  UXOutput,
} from "../types/projectAnalysis";

function storyIdsByRequirement(userStories: UserStory[], requirementIds: string[]): string[] {
  return userStories
    .filter((story) => story.relatedRequirements.some((id) => requirementIds.includes(id)))
    .map((story) => story.id);
}

function buildScreen(
  id: string,
  name: string,
  purpose: string,
  relatedRequirements: string[],
  relatedUserStories: string[],
  dataDisplayed: string[],
  mainComponents: string[],
  actions: string[],
  validationRules: string[],
  emptyState: string,
  errorState: string,
  successState: string,
  responsiveBehavior: string,
): UIScreen {
  return {
    id,
    name,
    purpose,
    relatedRequirements,
    relatedUserStories,
    dataDisplayed,
    mainComponents,
    actions,
    validationRules,
    emptyState,
    errorState,
    successState,
    responsiveBehavior,
  };
}

export async function runUIDesignerAgent(
  brd: BRDOutput,
  ux: UXOutput,
  userStories: UserStory[],
  context: ProjectContext,
): Promise<UIOutput> {
  const screens: UIScreen[] = [];

  const createScreen = (
    name: string,
    purpose: string,
    keywords: string[],
    dataDisplayed: string[],
    mainComponents: string[],
    actions: string[],
    validationRules: string[],
  ) => {
    const relatedRequirements = findRequirementIdsByKeywords(brd.functionalRequirements, keywords);
    const relatedUserStories = storyIdsByRequirement(userStories, relatedRequirements);

    screens.push(
      buildScreen(
        formatSequence("SCR", screens.length + 1),
        name,
        purpose,
        relatedRequirements,
        relatedUserStories,
        dataDisplayed,
        mainComponents,
        actions,
        validationRules,
        `Explain why no data is available on ${name} and present the next best action.`,
        `Show a concise recovery path on ${name} without losing user progress.`,
        `Confirm success on ${name} and point to the next recommended step.`,
        "Keep primary actions and status context visible on tablet and mobile layouts.",
      ),
    );
  };

  createScreen(
    "Landing / Discovery",
    "Introduce the product value, set expectations, and direct visitors into access or exploration paths.",
    ["dashboard", "product", "workspace", "catalog", "booking", "lead"],
    ["Value proposition", "Target user summary", "Primary workflow benefits", "Trust cues"],
    ["Hero block", "Use-case sections", "Trust indicators", "Primary CTA cluster"],
    ["Get Started", "View Workflow", "Log In"],
    ["Primary CTA must remain visible and descriptive across breakpoints."],
  );

  createScreen(
    "Registration",
    "Create an account with enough information to enter the governed workflow safely.",
    ["register", "authenticate", "account"],
    ["Name", "Email", "Role", "Consent state", "Validation status"],
    ["Account form", "Role selector", "Consent panel", "Inline validation summary"],
    ["Create Account", "Back to Home"],
    ["Required fields must validate before the account is created.", "Password and contact format rules must be explicit."],
  );

  createScreen(
    "Dashboard",
    "Summarize workload, statuses, pending actions, and the fastest path into the next task.",
    ["dashboard", "status", "report", "metric", "track"],
    ["Status counts", "Recent records", "Pending actions", "Queue health", "Alert summary"],
    ["KPI cards", "Recent activity table", "Quick action strip", "Notification or alert area"],
    ["Create New", "Open Queue", "View Details"],
    ["Dashboard filters must preserve state while users navigate to details."],
  );

  createScreen(
    "Workflow List / Queue",
    "Help users browse, filter, and reopen governed records with clear ownership and status.",
    ["status", "track", "workflow", "request", "order", "booking", "lead"],
    ["Record ID", "Owner", "Status", "Last updated", "Pending action"],
    ["Filter bar", "Search input", "Status chips", "Results table or list"],
    ["Apply Filters", "Open Record", "Create New"],
    ["Filter combinations should update the list without hiding the active criteria."],
  );

  createScreen(
    "Create / Edit Workflow Item",
    "Capture the structured data required to submit or correct the core workflow item.",
    ["create", "submit", "validate", "workflow", "record", "booking", "order", "lead"],
    ["Core form fields", "Progress step", "Validation messages", "Supporting attachments", "Requirement reminders"],
    ["Multi-step form", "Context sidebar", "Validation summary", "Attachment module"],
    ["Save Draft", "Continue", "Submit"],
    ["Mandatory fields must block submission until valid.", "Business-rule conflicts must appear before status progression."],
  );

  createScreen(
    "Workflow Details & Timeline",
    "Explain the current state, history, comments, and next action for a single record.",
    ["track", "status", "review", "approve", "comment"],
    ["Record summary", "Current status", "Timeline", "Decision notes", "Assigned owner", "Next step"],
    ["Status header", "Timeline panel", "Comment stream", "Decision history", "Action sidebar"],
    ["Respond", "Edit if Allowed", "Download Summary"],
    ["Only valid next actions should be shown for the current status and role."],
  );

  if (context.userRoles.some((role) => role.toLowerCase().includes("admin"))) {
    createScreen(
      "Admin Review Queue",
      "Let administrators or operators inspect pending items, exceptions, and approval decisions without losing context.",
      ["approve", "review", "exception", "permission", "admin"],
      ["Priority flags", "Queue state", "Exception reason", "Supporting evidence", "Decision history"],
      ["Queue summary cards", "Review table", "Decision drawer", "Exception banner"],
      ["Approve", "Reject", "Request Changes", "Escalate"],
      ["Decision actions must require a visible rationale before completion."],
    );
  }

  context.template.screenHints.forEach((hint) =>
    createScreen(
      hint.name,
      hint.purpose,
      [hint.name, hint.purpose],
      ["Relevant operational data for the project-type-specific workflow"],
      ["Primary content panel", "Context summary", "Action zone"],
      ["Open Detail", "Continue Workflow"],
      ["Only actions that match the record status should be enabled."],
    ),
  );

  const draft: UIOutput = {
    screens,
    designNotes: [
      "Use clear hierarchy, visible status language, and strong state feedback for governed workflows.",
      "Favor layouts that keep next-step actions and operational context visible at the same time.",
      `The UI specification reflects the ${context.projectType.toLowerCase()} template without drifting beyond the documented scope.`,
    ],
  };

  const prompt = createUIPrompt(
    brd,
    ux,
    userStories.map((story) => story.statement),
    draft,
  );
  const response = await generateWithLLM(prompt);

  return normalizeUIOutput(safeParseJson<UIOutput>(response, draft), draft);
}
