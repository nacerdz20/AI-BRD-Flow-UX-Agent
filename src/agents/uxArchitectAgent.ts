import { createUXPrompt } from "../prompts/uxPrompt";
import { safeParseJson, uniqueStrings } from "../services/analysisUtils";
import { generateWithLLM } from "../services/llmProvider";
import { normalizeUXOutput } from "../services/outputSanitizers";
import { type ProjectContext } from "../services/projectContext";
import type {
  BRDOutput,
  FlowchartOutput,
  UserStory,
  UXOutput,
} from "../types/projectAnalysis";
import { runUserStoriesAgent } from "./userStoriesAgent";

export interface UXArchitectResult {
  ux: UXOutput;
  userStories: UserStory[];
}

function requirementTitles(brd: BRDOutput): string[] {
  return brd.functionalRequirements.map((requirement) => requirement.title.toLowerCase());
}

export async function runUXArchitectAgent(
  brd: BRDOutput,
  flows: FlowchartOutput,
  context: ProjectContext,
): Promise<UXArchitectResult> {
  const titles = requirementTitles(brd);
  const primaryUser = context.primaryUsers[0] ?? "Registered User";

  const draft: UXOutput = {
    personas: [
      `${primaryUser}: needs a guided, low-friction path through the main workflow with visible progress and recoverable errors.`,
      `${context.userRoles.find((role) => role.toLowerCase().includes("admin")) ?? "Administrator"}: needs queue visibility, decision context, and safe correction paths.`,
      "Business sponsor: needs confidence that the workflow supports measurable outcomes, disciplined scope, and operational clarity.",
    ],
    userJourney: [
      "Discover the product value and confirm it matches the real-world need.",
      "Sign up or log in with enough trust to continue the workflow.",
      "Submit or manage the core record with clear guidance, validation, and status visibility.",
      "Respond to review comments, approvals, or corrections without losing context.",
      "Reach closure with confidence that the final state and next action are understood.",
    ],
    informationArchitecture: uniqueStrings([
      "Public layer: landing, value proposition, access entry points, and trust cues.",
      "Access layer: registration, login, recovery, and first-run orientation.",
      "Execution layer: dashboard, list or queue view, create/edit form, and detail timeline.",
      "Governance layer: review queue, exception handling, audit history, and operational summaries.",
      ...context.template.screenHints.map((screen) => `Project-type layer: ${screen.name} for ${screen.purpose.toLowerCase()}`),
    ]),
    navigationFlow: uniqueStrings([
      "Landing -> Register / Login -> Dashboard -> Workflow List -> Create / Edit Record -> Detail Timeline",
      "Dashboard -> Pending Actions -> Record Detail -> Resolve Required Step -> Confirmation",
      "Admin Dashboard -> Review Queue -> Record Detail -> Decision -> Outcome Log",
      ...context.template.screenHints.map((screen) => `Dashboard -> ${screen.name} -> Related Workflow Action`),
    ]),
    uxNotes: uniqueStrings([
      "Use progressive disclosure so users only see complex fields when the workflow requires them.",
      "Every status change should explain what changed, who owns the next step, and what the user can do next.",
      titles.some((title) => title.includes("notify"))
        ? "Notification touchpoints should reinforce critical transitions rather than duplicating every event."
        : "Status feedback must compensate for the absence of explicit notification-heavy behavior.",
      `Decision-heavy moments should align with the defined flowchart branches: ${flows.decisionPoints.slice(0, 3).join(" / ")}.`,
    ]),
    painPoints: [
      "Unclear business terminology increases perceived risk during submission or review.",
      "Long multi-step forms reduce completion unless progress and effort are visible.",
      "Weak review visibility causes user frustration when approvals or exceptions are delayed.",
      "Users abandon correction loops when the system explains failure but not the recovery path.",
    ],
    accessibilityNotes: [
      "Preserve keyboard navigation and focus order across tabs, forms, lists, and decision actions.",
      "Use semantic labels, helper text, and error summaries that assist both visual and screen-reader users.",
      "Do not rely on color alone for workflow state, approval state, or exception severity.",
      "Ensure responsive layouts keep primary actions, progress, and status context visible on smaller screens.",
    ],
  };

  const prompt = createUXPrompt(brd, flows, draft);
  const response = await generateWithLLM(prompt);
  const ux = normalizeUXOutput(safeParseJson<UXOutput>(response, draft), draft);
  const userStories = await runUserStoriesAgent(brd, flows, ux);

  return {
    ux,
    userStories,
  };
}
