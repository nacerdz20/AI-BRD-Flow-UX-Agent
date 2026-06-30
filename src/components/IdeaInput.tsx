import type { MockProjectScenario } from "../services/mockData";

interface IdeaInputProps {
  value: string;
  isGenerating: boolean;
  loadingLabel?: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onLoadSample: () => void;
  mockSamples: MockProjectScenario[];
  selectedMockId: string;
  selectedMockSummary: string;
  onSelectMockSample: (scenarioId: string) => void;
  errorMessage?: string | null;
  validationErrors?: string[];
  validationWarnings?: string[];
}

export function IdeaInput({
  value,
  isGenerating,
  loadingLabel,
  onChange,
  onGenerate,
  onLoadSample,
  mockSamples,
  selectedMockId,
  selectedMockSummary,
  onSelectMockSample,
  errorMessage,
  validationErrors = [],
  validationWarnings = [],
}: IdeaInputProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Input</p>
          <h2>Project Idea</h2>
        </div>
        <span className="status-pill">
          {isGenerating ? loadingLabel ?? "Generating analysis" : "Ready"}
        </span>
      </div>

      <p className="panel-copy">
        Describe the product idea in plain language. The orchestrator will turn it
        into a BRD, Mermaid flowcharts, UX architecture, UI screen definitions,
        and a final review report.
      </p>

      <div className="sample-picker">
        <label className="field-label" htmlFor="mock-scenario">
          Professional Mock Scenario
        </label>
        <select
          id="mock-scenario"
          className="sample-select"
          value={selectedMockId}
          onChange={(event) => onSelectMockSample(event.target.value)}
          disabled={isGenerating}
        >
          {mockSamples.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.title} ({scenario.projectType})
            </option>
          ))}
        </select>
        <p className="sample-hint">
          {selectedMockSummary} This mock scenario works end-to-end without an
          API key.
        </p>
      </div>

      <textarea
        className={`idea-textarea${validationErrors.length > 0 ? " invalid" : ""}`}
        dir="auto"
        rows={12}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: A platform for schools to manage student onboarding, attendance, coach assignments, and parent communication through a structured dashboard."
        aria-invalid={validationErrors.length > 0}
      />

      <div className="input-meta">
        <span>{value.trim().length} characters</span>
        <span>{value.trim() ? value.trim().split(/\s+/).length : 0} words</span>
      </div>

      <div className="idea-toolbar">
        <button
          className="ghost-button"
          type="button"
          onClick={onLoadSample}
          disabled={isGenerating}
        >
          Load Selected Mock
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || value.trim().length === 0}
        >
          {isGenerating ? "Generating..." : "Generate Analysis"}
        </button>
      </div>

      {validationErrors.length > 0 ? (
        <div className="validation-block error-block">
          <strong>Input issues</strong>
          <ul className="feedback-list">
            {validationErrors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {validationWarnings.length > 0 ? (
        <div className="validation-block warning-block">
          <strong>Assumptions likely needed</strong>
          <ul className="feedback-list">
            {validationWarnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
    </section>
  );
}
