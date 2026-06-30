import type { MermaidFlowchart } from "../types/projectAnalysis";

function sanitizeLabel(label: string): string {
  return label
    .replace(/["'`]/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeMermaidLine(line: string): string {
  return line.replace(/\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\)/g, (match, square, curly, round) => {
    const label = square ?? curly ?? round ?? "";
    const cleaned = sanitizeLabel(label);

    if (square) return `[${cleaned}]`;
    if (curly) return `{${cleaned}}`;
    return `(${cleaned})`;
  });
}

export function validateAndRepairMermaid(
  source: string,
  preferredDirection: "TD" | "LR" = "TD",
): { mermaid: string; issues: string[] } {
  const issues: string[] = [];
  const lines = source
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);

  if (lines.length === 0) {
    issues.push("Empty Mermaid flow was replaced with a minimal fallback.");
    return {
      mermaid: `flowchart ${preferredDirection}\n    A(Start)\n    A --> B(End)`,
      issues,
    };
  }

  if (!/^flowchart\s+(TD|TB|LR|RL)\s*$/i.test(lines[0])) {
    issues.push("Missing or invalid Mermaid header was repaired.");
    lines.unshift(`flowchart ${preferredDirection}`);
  }

  const sanitized = lines.map((line, index) => {
    if (index === 0) {
      return line.replace(/^flowchart\s+(TD|TB|LR|RL).*/i, `flowchart ${preferredDirection}`);
    }

    const cleaned = sanitizeMermaidLine(line);

    if (cleaned !== line) {
      issues.push("Unsafe Mermaid node labels were sanitized.");
    }

    return cleaned;
  });

  if (!sanitized.some((line) => line.includes("-->"))) {
    issues.push("No connectors found, a minimal connector was added.");
    sanitized.push("    A --> B");
  }

  return {
    mermaid: sanitized.join("\n"),
    issues: Array.from(new Set(issues)),
  };
}

export function validateFlowchartArtifact(
  flow: MermaidFlowchart,
  preferredDirection: "TD" | "LR" = "TD",
): MermaidFlowchart {
  const { mermaid } = validateAndRepairMermaid(flow.mermaid, preferredDirection);

  return {
    ...flow,
    mermaid,
  };
}
