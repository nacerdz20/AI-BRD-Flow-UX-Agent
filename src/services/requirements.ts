import type {
  FunctionalRequirement,
  PrioritizedRequirements,
  RequirementPriority,
} from "../types/projectAnalysis";
import { createEmptyPrioritizedRequirements } from "./analysisUtils";

export function groupRequirementsByPriority(
  requirements: FunctionalRequirement[],
): PrioritizedRequirements {
  const grouped = createEmptyPrioritizedRequirements();

  requirements.forEach((requirement) => {
    if (requirement.priority === "Must Have") grouped.mustHave.push(requirement);
    if (requirement.priority === "Should Have") grouped.shouldHave.push(requirement);
    if (requirement.priority === "Could Have") grouped.couldHave.push(requirement);
    if (requirement.priority === "Won't Have Now") grouped.wontHaveNow.push(requirement);
  });

  return grouped;
}

export function findRequirementIdsByKeywords(
  requirements: FunctionalRequirement[],
  keywords: string[],
): string[] {
  const lowered = keywords.map((keyword) => keyword.toLowerCase());

  return requirements
    .filter((requirement) => {
      const haystack = `${requirement.title} ${requirement.description}`.toLowerCase();
      return lowered.some((keyword) => haystack.includes(keyword));
    })
    .map((requirement) => requirement.id);
}

export function requirementPriorityWeight(priority: RequirementPriority): number {
  if (priority === "Must Have") return 1;
  if (priority === "Should Have") return 0.75;
  if (priority === "Could Have") return 0.5;
  return 0.25;
}
