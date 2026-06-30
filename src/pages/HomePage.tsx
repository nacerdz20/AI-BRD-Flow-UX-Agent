import { useState } from "react";
import { runOrchestrator } from "../agents/orchestratorAgent";
import { ExportButtons } from "../components/ExportButtons";
import { IdeaInput } from "../components/IdeaInput";
import { ResultsTabs } from "../components/ResultsTabs";
import { buildTabMarkdownMap } from "../services/exportMarkdown";
import { llmProviderConfig } from "../services/llmProvider";
import {
  getDefaultMockProjectScenario,
  getMockProjectScenario,
  MOCK_PROJECT_SCENARIOS,
} from "../services/mockData";
import { validateProjectIdeaInput } from "../services/projectContext";
import type { AnalysisTab, ProjectAnalysis } from "../types/projectAnalysis";

const DEFAULT_MOCK_SCENARIO = getDefaultMockProjectScenario();

export function HomePage() {
  const [selectedMockId, setSelectedMockId] = useState(DEFAULT_MOCK_SCENARIO.id);
  const [idea, setIdea] = useState(DEFAULT_MOCK_SCENARIO.idea);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("brd");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const liveValidation = validateProjectIdeaInput(idea);
  const selectedMockScenario =
    getMockProjectScenario(selectedMockId) ?? DEFAULT_MOCK_SCENARIO;

  const sections = analysis
    ? buildTabMarkdownMap(analysis)
    : {
        brd: "",
        flowcharts: "",
        ux: "",
        ui: "",
        traceabilityMatrix: "",
        qualityReview: "",
        finalReport: "",
      };

  const currentContent = analysis ? sections[activeTab] : "";
  const exportFilename = analysis
    ? `${analysis.projectType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${activeTab}.md`
    : "analysis.md";

  async function handleGenerate() {
    if (!liveValidation.isValid) {
      setErrorMessage(liveValidation.errors[0] ?? "Please fix the project idea before generating the analysis.");
      return;
    }

    setIsGenerating(true);
    setLoadingStage("Starting analysis");
    setErrorMessage(null);

    try {
      const nextAnalysis = await runOrchestrator(idea, setLoadingStage, analysis ?? undefined);
      setAnalysis(nextAnalysis);
      setActiveTab("finalReport");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error while generating the analysis.";
      setErrorMessage(message);
    } finally {
      setLoadingStage("Idle");
      setIsGenerating(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <section className="hero">
        <p className="eyebrow">AI Agent Workspace</p>
        <h1>AI BRD Flow UX Agent</h1>
        <p className="hero-copy">
          A lightweight multi-agent system, developed by زوايزية الناصر
          (Nacer Zouaizia), that turns a raw product idea into a structured
          BRD, Mermaid flowcharts, UX architecture, UI screen definitions, and
          a final handoff report.
        </p>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <h3>Architecture</h3>
          <p>
            Orchestrator Agent now coordinates Clarification, Business Analyst,
            Process Flow, UX Architect, UI Designer, and Quality Reviewer
            agents. User stories are generated inside the UX stage so the
            external orchestration order stays clean and deterministic.
          </p>
        </article>
        <article className="summary-card">
          <h3>Provider Mode</h3>
          <p>
            Current provider: <strong>{llmProviderConfig.provider}</strong> in{" "}
            <strong>{llmProviderConfig.mode}</strong> mode. The app ships with
            professional mock scenarios so you can test the full pipeline
            without an API key, then replace <code>generateWithLLM()</code>{" "}
            later to connect OpenAI, Ollama, or another LLM.
          </p>
        </article>
        <article className="summary-card">
          <h3>Output Shape</h3>
          <p>
            Results stay structured in JSON first, then exported as Markdown,
            JSON, Mermaid-only, BRD-only, or UI/UX-only artifacts with version
            history.
          </p>
        </article>
      </section>

      <div className="workspace-grid">
        <IdeaInput
          value={idea}
          isGenerating={isGenerating}
          loadingLabel={loadingStage}
          onChange={setIdea}
          onGenerate={handleGenerate}
          onLoadSample={() => setIdea(selectedMockScenario.idea)}
          mockSamples={MOCK_PROJECT_SCENARIOS}
          selectedMockId={selectedMockId}
          selectedMockSummary={selectedMockScenario.summary}
          onSelectMockSample={(scenarioId) => {
            const nextScenario = getMockProjectScenario(scenarioId);

            if (!nextScenario) {
              return;
            }

            setSelectedMockId(nextScenario.id);
            setIdea(nextScenario.idea);
            setErrorMessage(null);
          }}
          errorMessage={errorMessage}
          validationErrors={liveValidation.errors}
          validationWarnings={liveValidation.warnings}
        />

        <section className="panel results-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Workspace</p>
              <h2>Analysis Console</h2>
            </div>
          </div>

          {isGenerating ? (
            <div className="loading-state">
              <h3>Analysis in progress</h3>
              <p>The agent team is currently running: <strong>{loadingStage}</strong>.</p>
              <div className="loading-bar">
                <span className="loading-bar-fill" />
              </div>
            </div>
          ) : !analysis ? (
            <div className="empty-state">
              <h3>No analysis generated yet</h3>
              <p>
                Start with the sample idea or replace it with your own product
                concept, then run the orchestrator to produce structured outputs.
              </p>
            </div>
          ) : (
            <>
              <ExportButtons
                analysis={analysis}
                currentFilename={exportFilename}
                currentContent={currentContent}
              />
              <ResultsTabs
                analysis={analysis}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                sections={sections}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
