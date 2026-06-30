import type { BRDOutput, FlowchartOutput, UserStory, UXOutput } from "../types/projectAnalysis";
import { buildStructuredPrompt } from "./promptUtils";

export function createUserStoriesPrompt(
  brd: BRDOutput,
  flowcharts: FlowchartOutput,
  ux: UXOutput,
  draft: UserStory[],
): string {
  return buildStructuredPrompt({
    role: "User Stories Agent",
    objective:
      "Generate structured user stories in the format 'As a / I want / So that' and attach Gherkin acceptance criteria that reflect the BRD and the flowcharts.",
    context: [
      `Project overview: ${brd.projectOverview}`,
      `Roles:\n${brd.userRoles.map((item) => `- ${item}`).join("\n")}`,
      `Decision points:\n${flowcharts.decisionPoints.map((item) => `- ${item}`).join("\n")}`,
      `UX personas:\n${ux.personas.map((item) => `- ${item}`).join("\n")}`,
    ],
    rules: [
      "Each user story must map to at least one requirement.",
      "Acceptance criteria must use Given / When / Then phrasing.",
      "Keep stories action-oriented and useful for product and QA handoff.",
    ],
    mockPayload: draft,
  });
}
