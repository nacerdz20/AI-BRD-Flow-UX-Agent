import type { BRDOutput, UIOutput, UXOutput } from "../types/projectAnalysis";
import { buildStructuredPrompt } from "./promptUtils";

export function createUIPrompt(
  brd: BRDOutput,
  ux: UXOutput,
  userStoriesSummary: string[],
  draft: UIOutput,
): string {
  return buildStructuredPrompt({
    role: "UI Designer Agent",
    objective:
      "Describe the interface screen by screen so a Figma designer or frontend developer can translate it into practical, production-ready visuals.",
    context: [
      `Functional requirements:\n${brd.functionalRequirements.map((item) => `- ${item.id}: ${item.title}`).join("\n")}`,
      `User stories:\n${userStoriesSummary.map((item) => `- ${item}`).join("\n")}`,
      `Navigation flow:\n${ux.navigationFlow.map((item) => `- ${item}`).join("\n")}`,
    ],
    rules: [
      "Give each screen a clear purpose, displayed data, related requirements, and related user stories.",
      "Describe actions, validation rules, states, errors, and responsive behavior explicitly.",
      "Avoid abstract design advice that cannot be actioned by a product team.",
    ],
    mockPayload: draft,
  });
}
