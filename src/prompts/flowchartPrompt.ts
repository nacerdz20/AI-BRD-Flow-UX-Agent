import type { BRDOutput, FlowchartOutput } from "../types/projectAnalysis";
import { buildStructuredPrompt } from "./promptUtils";

export function createFlowchartPrompt(
  brd: BRDOutput,
  draft: FlowchartOutput,
): string {
  return buildStructuredPrompt({
    role: "Process Flow Agent",
    objective:
      "Convert the BRD into Mermaid flowcharts that are syntactically valid, displayable in Markdown, and complete across normal, exceptional, and project-type-specific paths.",
    context: [
      `Project overview: ${brd.projectOverview}`,
      `Functional requirements:\n${brd.functionalRequirements.map((item) => `- ${item.id}: ${item.title}`).join("\n")}`,
      `Roles:\n${brd.userRoles.map((item) => `- ${item}`).join("\n")}`,
      `Business rules:\n${brd.businessRules.map((item) => `- ${item}`).join("\n")}`,
    ],
    rules: [
      "Return Mermaid-ready strings inside JSON fields.",
      "Use explicit decision points whenever the flow branches.",
      "Make exception handling visible instead of implicit.",
      "Do not output prose where a Mermaid diagram is expected.",
    ],
    mockPayload: draft,
  });
}
