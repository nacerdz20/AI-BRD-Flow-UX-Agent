import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "./MermaidDiagram";

interface MarkdownViewerProps {
  title: string;
  content: string;
}

type CodeComponentProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
};

const markdownComponents: Components = {
  code({ inline, className, children, ...props }: CodeComponentProps) {
    const value = String(children ?? "").replace(/\n$/, "");
    const language = className?.replace("language-", "");

    if (language === "mermaid") {
      return <MermaidDiagram chart={value} />;
    }

    if (inline) {
      return (
        <code className="markdown-inline-code" {...props}>
          {children}
        </code>
      );
    }

    return (
      <pre className="markdown-pre">
        <code className={className} {...props}>
          {value}
        </code>
      </pre>
    );
  },
  table({ children }) {
    return (
      <div className="markdown-table-wrap">
        <table>{children}</table>
      </div>
    );
  },
};

export function MarkdownViewer({ title, content }: MarkdownViewerProps) {
  return (
    <section className="markdown-viewer">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Output</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
}
