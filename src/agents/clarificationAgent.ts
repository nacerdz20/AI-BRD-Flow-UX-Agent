import { createClarificationPrompt } from "../prompts/clarificationPrompt";
import { safeParseJson } from "../services/analysisUtils";
import { generateWithLLM } from "../services/llmProvider";
import { normalizeClarificationOutput } from "../services/outputSanitizers";
import {
  buildProjectContext,
  type ProjectContext,
} from "../services/projectContext";
import type { ClarificationOutput } from "../types/projectAnalysis";

function buildCompletenessSummary(context: ProjectContext): string {
  if (context.missingDetails.length === 0) {
    return `The brief is reasonably complete for a ${context.projectType.toLowerCase()} discovery pass. Only normal implementation details remain open.`;
  }

  if (context.missingDetails.length <= 2) {
    return `The brief is usable for analysis, but a few details still need clarification. The workflow will proceed using explicit assumptions.`;
  }

  return `The brief is directionally clear but incomplete. The workflow will continue using explicit assumptions to avoid blocking discovery.`;
}

export async function runClarificationAgent(
  projectIdea: string,
  context = buildProjectContext(projectIdea),
): Promise<ClarificationOutput> {
  const draft: ClarificationOutput = {
    missingInformation: context.missingDetails,
    questions: context.clarificationQuestions,
    assumptions: context.assumptions,
    detectedDomain: context.domain,
    detectedSystemType: context.systemType,
    detectedPrimaryUsers: context.primaryUsers,
    completenessSummary: buildCompletenessSummary(context),
  };

  const prompt = createClarificationPrompt(context, draft);
  const response = await generateWithLLM(prompt);

  return normalizeClarificationOutput(
    safeParseJson<ClarificationOutput>(response, draft),
    draft,
  );
}
