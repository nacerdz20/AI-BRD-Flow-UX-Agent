import type { BRDOutput, FlowchartOutput, UXOutput } from "../types/projectAnalysis";
import { buildStructuredPrompt } from "./promptUtils";

export function createUXPrompt(
  brd: BRDOutput,
  flowcharts: FlowchartOutput,
  draft: UXOutput,
): string {
  return buildStructuredPrompt({
    role: "UX Architect Agent",
    objective:
      "Design the experience layer by mapping personas, journeys, architecture, and accessibility guidance directly to the BRD and the flowcharts.",
    context: [
      `Project overview: ${brd.projectOverview}`,
      `Target users:\n${brd.targetUsers.map((item) => `- ${item}`).join("\n")}`,
      `Use cases:\n${brd.useCases.map((item) => `- ${item}`).join("\n")}`,
      `Decision points:\n${flowcharts.decisionPoints.map((item) => `- ${item}`).join("\n")}`,
    ],
    rules: [
      "Align every UX artifact with a business goal or requirement.",
      "Keep personas, journeys, and navigation consistent with the defined roles and flow transitions.",
      "Include accessibility guidance for forms, navigation, and feedback states.",
    ],
    mockPayload: draft,
  });
}
