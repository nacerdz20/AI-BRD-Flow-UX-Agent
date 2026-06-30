import type { AnalysisTab, ProjectAnalysis } from "../types/projectAnalysis";
import { MarkdownViewer } from "./MarkdownViewer";

const TAB_ORDER: AnalysisTab[] = [
  "brd",
  "flowcharts",
  "ux",
  "ui",
  "traceabilityMatrix",
  "qualityReview",
  "finalReport",
];

const TAB_LABELS: Record<AnalysisTab, string> = {
  brd: "BRD",
  flowcharts: "Flowcharts",
  ux: "UX",
  ui: "UI",
  traceabilityMatrix: "Traceability Matrix",
  qualityReview: "Quality Review",
  finalReport: "Final Report",
};

interface ResultsTabsProps {
  analysis: ProjectAnalysis;
  activeTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
  sections: Record<AnalysisTab, string>;
}

export function ResultsTabs({
  analysis,
  activeTab,
  onTabChange,
  sections,
}: ResultsTabsProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Results</p>
          <h2>Structured Output</h2>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-value">{analysis.brd.functionalRequirements.length}</span>
          <span className="stat-label">Requirements</span>
        </article>
        <article className="stat-card">
          <span className="stat-value">{analysis.userStories.length}</span>
          <span className="stat-label">User Stories</span>
        </article>
        <article className="stat-card">
          <span className="stat-value">{analysis.traceabilityMatrix.length}</span>
          <span className="stat-label">Trace Links</span>
        </article>
        <article className="stat-card">
          <span className="stat-value">{analysis.qualityScore.overall}</span>
          <span className="stat-label">Overall Score</span>
        </article>
      </div>

      <div className="tab-bar" role="tablist" aria-label="Analysis Tabs">
        {TAB_ORDER.map((tab) => (
          <button
            key={tab}
            className={`tab-button${activeTab === tab ? " active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => onTabChange(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <MarkdownViewer title={TAB_LABELS[activeTab]} content={sections[activeTab]} />
    </section>
  );
}
