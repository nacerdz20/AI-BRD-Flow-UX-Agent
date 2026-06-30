import type {
  BRDOutput,
  FlowchartOutput,
  TraceabilityMatrixEntry,
  UIOutput,
  UserStory,
} from "../types/projectAnalysis";

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function allFlows(flowcharts: FlowchartOutput) {
  return [
    flowcharts.mainFlow,
    flowcharts.registrationFlow,
    flowcharts.loginFlow,
    flowcharts.coreBusinessFlow,
    flowcharts.adminFlow,
    ...flowcharts.projectTypeFlows,
    ...flowcharts.exceptionFlows,
  ];
}

export function buildTraceabilityMatrix(
  brd: BRDOutput,
  flowcharts: FlowchartOutput,
  userStories: UserStory[],
  ui: UIOutput,
): TraceabilityMatrixEntry[] {
  const flows = allFlows(flowcharts);

  return brd.functionalRequirements.map((requirement) => {
    const relatedStories = userStories.filter((story) =>
      story.relatedRequirements.includes(requirement.id),
    );
    const relatedScreens = ui.screens.filter((screen) =>
      screen.relatedRequirements.includes(requirement.id),
    );
    const relatedFlows = flows.filter((flow) =>
      flow.relatedRequirements.includes(requirement.id),
    );

    return {
      requirementId: requirement.id,
      requirementTitle: requirement.title,
      relatedFlowcharts: unique(relatedFlows.map((flow) => flow.name)),
      relatedScreens: unique(relatedScreens.map((screen) => `${screen.id} ${screen.name}`)),
      relatedUserStories: unique(relatedStories.map((story) => story.id)),
      relatedAcceptanceCriteria: unique([
        ...requirement.acceptanceCriteria,
        ...relatedStories.flatMap((story) => story.acceptanceCriteria),
      ]),
    };
  });
}
