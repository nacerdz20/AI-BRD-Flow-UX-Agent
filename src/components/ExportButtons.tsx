import { useState } from "react";
import { slugify } from "../services/analysisUtils";
import { exportMarkdownFile, exportTextFile } from "../services/exportMarkdown";
import type { ProjectAnalysis } from "../types/projectAnalysis";

interface ExportButtonsProps {
  analysis: ProjectAnalysis;
  currentFilename: string;
  currentContent: string;
  disabled?: boolean;
}

export function ExportButtons({
  analysis,
  currentFilename,
  currentContent,
  disabled = false,
}: ExportButtonsProps) {
  const [feedback, setFeedback] = useState("");
  const baseName = slugify(analysis.idea);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(currentContent);
      setFeedback("Current result copied to clipboard.");
    } catch {
      setFeedback("Clipboard copy failed in this browser context.");
    }
  }

  function handleExportCurrent() {
    exportMarkdownFile(currentFilename, currentContent);
    setFeedback(`Exported ${currentFilename}`);
  }

  function handleExportFinal() {
    const filename = `${baseName}-full-report.md`;
    exportMarkdownFile(filename, analysis.exports.markdown);
    setFeedback(`Exported ${filename}`);
  }

  function handleExportJson() {
    const filename = `${baseName}-analysis.json`;
    exportTextFile(filename, analysis.exports.json, "application/json;charset=utf-8");
    setFeedback(`Exported ${filename}`);
  }

  function handleExportMermaid() {
    const filename = `${baseName}-flowcharts.md`;
    exportMarkdownFile(filename, analysis.exports.mermaid);
    setFeedback(`Exported ${filename}`);
  }

  function handleExportBRD() {
    const filename = `${baseName}-brd.md`;
    exportMarkdownFile(filename, analysis.exports.brd);
    setFeedback(`Exported ${filename}`);
  }

  function handleExportUiUx() {
    const filename = `${baseName}-uiux.md`;
    exportMarkdownFile(filename, analysis.exports.uiux);
    setFeedback(`Exported ${filename}`);
  }

  return (
    <div className="export-toolbar">
      <button
        className="ghost-button"
        type="button"
        onClick={handleExportCurrent}
        disabled={disabled}
      >
        Export Current Tab
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={handleExportFinal}
        disabled={disabled}
      >
        Export Final Markdown
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={handleExportJson}
        disabled={disabled}
      >
        Export JSON
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={handleExportMermaid}
        disabled={disabled}
      >
        Export Mermaid
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={handleExportBRD}
        disabled={disabled}
      >
        Export BRD
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={handleExportUiUx}
        disabled={disabled}
      >
        Export UI/UX
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={handleCopy}
        disabled={disabled}
      >
        Copy Result
      </button>
      {feedback ? <span className="toolbar-feedback">{feedback}</span> : null}
    </div>
  );
}
