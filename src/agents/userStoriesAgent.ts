import { createUserStoriesPrompt } from "../prompts/userStoriesPrompt";
import {
  formatSequence,
  safeParseJson,
  uniqueStrings,
} from "../services/analysisUtils";
import { generateWithLLM } from "../services/llmProvider";
import { normalizeUserStories } from "../services/outputSanitizers";
import type {
  BRDOutput,
  FlowchartOutput,
  FunctionalRequirement,
  UserStory,
  UXOutput,
} from "../types/projectAnalysis";

function storyStatement(role: string, action: string, benefit: string): string {
  return `As a ${role}, I want to ${action}, So that ${benefit}.`;
}

function toStory(requirement: FunctionalRequirement, index: number): UserStory {
  const role = requirement.relatedUserRole;
  const action = requirement.description
    .replace(/^Support /i, "support ")
    .replace(/\.$/, "")
    .toLowerCase();
  const benefit = `I can complete the ${requirement.title.toLowerCase()} outcome without ambiguity`;

  return {
    id: formatSequence("US", index + 1),
    role,
    action,
    benefit,
    statement: storyStatement(role, action, benefit),
    relatedRequirements: [requirement.id],
    acceptanceCriteria: [
      `Given the ${role.toLowerCase()} is in the correct workspace`,
      `When they perform the actions required for ${requirement.title.toLowerCase()}`,
      "Then the system validates the step, updates status, and shows the next action clearly",
    ],
  };
}

export async function runUserStoriesAgent(
  brd: BRDOutput,
  flowcharts: FlowchartOutput,
  ux: UXOutput,
): Promise<UserStory[]> {
  const sourceRequirements = brd.functionalRequirements.filter(
    (requirement) => requirement.priority !== "Won't Have Now",
  );
  const draft = uniqueStrings(
    sourceRequirements.map((requirement) => requirement.id),
  ).map((id) => {
    const requirement = sourceRequirements.find((item) => item.id === id)!;
    return toStory(requirement, sourceRequirements.findIndex((item) => item.id === id));
  });

  const prompt = createUserStoriesPrompt(brd, flowcharts, ux, draft);
  const response = await generateWithLLM(prompt);

  return normalizeUserStories(safeParseJson<UserStory[]>(response, draft), draft);
}
