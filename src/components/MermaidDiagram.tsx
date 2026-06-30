import { useEffect, useId, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

let isMermaidInitialized = false;
let mermaidModulePromise: Promise<
  typeof import("mermaid")["default"]
> | null = null;

async function loadMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("mermaid").then(({ default: mermaid }) => {
      if (!isMermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "neutral",
          fontFamily: "Trebuchet MS, Lucida Sans Unicode, Lucida Grande, sans-serif",
        });

        isMermaidInitialized = true;
      }

      return mermaid;
    });
  }

  return mermaidModulePromise;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const renderId = useId().replace(/:/g, "-");

  useEffect(() => {
    let isCancelled = false;

    setSvg("");
    setError(null);

    async function renderDiagram() {
      try {
        const mermaid = await loadMermaid();
        const { svg: renderedSvg } = await mermaid.render(
          `mermaid-${renderId}`,
          chart.trim(),
        );

        if (!isCancelled) {
          setSvg(renderedSvg);
        }
      } catch (renderError) {
        if (!isCancelled) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : "Unknown Mermaid rendering error.",
          );
        }
      }
    }

    void renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [chart, renderId]);

  return (
    <div className="mermaid-panel">
      <div className="mermaid-header">
        <strong>Mermaid Diagram</strong>
        <span>Rendered from the generated flow definition</span>
      </div>

      {error ? (
        <div className="mermaid-fallback">
          <p className="mermaid-error">
            Mermaid rendering failed. Showing the validated source instead.
          </p>
          <pre className="markdown-pre">{chart}</pre>
          <p className="mermaid-error-detail">{error}</p>
        </div>
      ) : svg ? (
        <div
          className="mermaid-diagram"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="mermaid-loading">Rendering diagram...</div>
      )}
    </div>
  );
}
