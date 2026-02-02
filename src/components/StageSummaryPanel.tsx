// src/components/StageSummaryPanel.tsx
"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Stage } from "@/src/types/common";

type SummaryPanelProps = {
  mode: "summary";
  viewStageKey: Stage;
  isCurrentStage: boolean;
  isEditingSummary: boolean;
  hasSummary: boolean;
  summaryLoading: boolean;
  summarySaving: boolean;
  summaryText: string;
  projectTitle?: string;
  projectUpdatedAt?: string;
  onSummaryChange: (value: string) => void;
  onSetEditing: (value: boolean) => void;
  onSubmit: () => void;
  onRefreshReport?: () => void;
  refreshReportLoading?: boolean;
};

type GeneratePanelProps = {
  mode: "generate";
  onGenerate: () => void;
};

type StageSummaryPanelProps = SummaryPanelProps | GeneratePanelProps;

export default function StageSummaryPanel(props: StageSummaryPanelProps) {
  if (props.mode === "generate") {
    return (
      <div
        className="
          flex flex-1 min-h-0 items-center justify-center
          rounded-2xl bg-white/90 border border-slate-200 shadow-sm
        "
      >
        <button
          type="button"
          onClick={props.onGenerate}
          className="
            rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900
            border border-slate-200 shadow-md shadow-slate-200/60 transition
            hover:-translate-y-0.5 hover:bg-slate-50
            focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300
          "
        >
          Generate Summary
        </button>
      </div>
    );
  }

  const {
    viewStageKey,
    isCurrentStage,
    isEditingSummary,
    hasSummary,
    summaryLoading,
    summarySaving,
    summaryText,
    projectTitle,
    projectUpdatedAt,
    onSummaryChange,
    onSetEditing,
    onSubmit,
    onRefreshReport,
    refreshReportLoading,
  } = props;

  const hasContent = summaryText.trim().length > 0;
  const isReportStage = viewStageKey === "report";
  const canRefreshReport = isReportStage && typeof onRefreshReport === "function";
  const resolvedProjectTitle = projectTitle?.trim() || "Untitled project";
  const displayProjectTitle = (() => {
    const lowered = resolvedProjectTitle.trim().toLowerCase();
    if (lowered === "text" || lowered === "text - final report") {
      return "Final Report";
    }
    return resolvedProjectTitle;
  })();

  const formattedUpdatedAt = (() => {
    if (!projectUpdatedAt) return null;
    const parsed = new Date(projectUpdatedAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(parsed);
  })();

  const todayIso = (() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();

  const reportMarkdownComponents = {
    h1: ({ children }: { children?: ReactNode }) => (
      <h1
        className="mt-10 text-2xl font-semibold text-slate-900 tracking-tight first:mt-0 text-center"
        style={{ fontFamily: "var(--report-serif)" }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
      <h2
        className="mt-8 text-xl font-semibold text-slate-900 tracking-tight text-center"
        style={{ fontFamily: "var(--report-serif)" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3
        className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600 text-center"
        style={{ fontFamily: "var(--report-sans)" }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: ReactNode }) => (
      <h4 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 text-center">
        {children}
      </h4>
    ),
    p: ({ children }: { children?: ReactNode }) => {
      const confidence = parseConfidence(children);
      if (confidence) {
        return (
          <div className="mt-4 flex justify-center">
            {renderConfidenceBadge(confidence)}
          </div>
        );
      }
      return (
        <p className="mt-4 text-[14px] leading-[1.7] text-slate-800 first:mt-0">
          {children}
        </p>
      );
    },
    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="mt-4 list-disc space-y-2 pl-6 text-[14px] leading-[1.7] text-slate-800">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: ReactNode }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-6 text-[14px] leading-[1.7] text-slate-800">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: ReactNode }) => {
      const confidence = parseConfidence(children);
      if (confidence) {
        return (
          <li className="list-none">
            <div className="mt-3 flex justify-center">
              {renderConfidenceBadge(confidence)}
            </div>
          </li>
        );
      }
      return (
        <li className="text-[14px] leading-[1.7] text-slate-800">
          {children}
        </li>
      );
    },
    a: ({
      children,
      href,
    }: {
      children?: ReactNode;
      href?: string;
    }) => (
      <a
        href={href}
        className="text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-slate-700"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="mt-6 border-l-2 border-slate-300 pl-4 text-slate-700">
        <div className="text-[13px] leading-[1.7]">{children}</div>
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-slate-200" />,
    table: ({ children }: { children?: ReactNode }) => (
      <div className="mt-6 overflow-x-auto border border-slate-200">
        <table className="w-full border-collapse text-[12.5px] leading-relaxed text-slate-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children?: ReactNode }) => (
      <thead className="bg-slate-50 text-[12px] uppercase tracking-[0.12em] text-slate-500">
        {children}
      </thead>
    ),
    th: ({ children }: { children?: ReactNode }) => (
      <th className="border-b border-slate-200 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }: { children?: ReactNode }) => (
      <td className="border-b border-slate-100 px-4 py-2 align-top">
        {children}
      </td>
    ),
    pre: ({ children }: { children?: ReactNode }) => (
      <pre className="mt-6 overflow-x-auto border border-slate-200 bg-slate-50 p-4 text-[12.5px] leading-relaxed text-slate-700">
        {children}
      </pre>
    ),
    code: ({
      inline,
      children,
      className,
    }: {
      inline?: boolean;
      children?: ReactNode;
      className?: string;
    }) =>
      inline ? (
        <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px] text-slate-700">
          {children}
        </code>
      ) : (
        <code className={className}>{children}</code>
      ),
  };

  const handleDownload = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const cleanValue = (value: string | undefined) =>
    value ? value.replace(/^[\s"*']+|[\s"*']+$/g, "").trim() : undefined;

  const extractLineValue = (text: string, label: string) => {
    const safeLabel = escapeRegExp(label);
    const match = text.match(
      new RegExp(
        `^\\s*(?:[-*]\\s*)?(?:\\*\\*\\s*)?${safeLabel}\\s*:\\s*(.+?)\\s*(?:\\*\\*)?$`,
        "im"
      )
    );
    return cleanValue(match?.[1]?.trim());
  };

  const flattenText = (value: ReactNode): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map((child) => flattenText(child)).join("");
    }
    if (typeof value === "object" && "props" in value) {
      const props = value.props as { children?: ReactNode };
      return flattenText(props.children);
    }
    return "";
  };

  const parseConfidence = (children: ReactNode) => {
    const text = flattenText(children).replace(/\s+/g, " ").trim();
    const match = text.match(/confidence\s*[:\-]\s*(low|medium|high)/i);
    if (!match) return null;
    return match[1].toLowerCase() as "low" | "medium" | "high";
  };

  const renderConfidenceBadge = (level: "low" | "medium" | "high") => {
    const palette = {
      low: "border-rose-200 bg-rose-50 text-rose-700",
      medium: "border-amber-200 bg-amber-50 text-amber-700",
      high: "border-emerald-200 bg-emerald-50 text-emerald-700",
    } as const;
    const label = level.charAt(0).toUpperCase() + level.slice(1);
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] ${palette[level]}`}
        style={{ fontFamily: "var(--report-sans)" }}
      >
        Confidence: {label}
      </div>
    );
  };

  const fieldRefRegex =
    /\b(?:qa_digest|dvf_assessment|lean_canvas|stage_summaries|key_risks)\.[A-Za-z0-9_.-]+/gi;

  const sanitizeReportContent = (text: string) => {
    let sanitized = text;
    sanitized = sanitized.replace(
      /\([^)]*\b(?:qa_digest|dvf_assessment|lean_canvas|stage_summaries|key_risks)\.[^)]*\)/gi,
      ""
    );
    sanitized = sanitized.replace(
      /^\s*-\s*(?:qa_digest|dvf_assessment|lean_canvas|stage_summaries|key_risks)\.[^:]+:\s*/gim,
      "- "
    );
    sanitized = sanitized.replace(
      /^\s*(?:qa_digest|dvf_assessment|lean_canvas|stage_summaries|key_risks)\.[^:]+:\s*/gim,
      ""
    );
    sanitized = sanitized.replace(fieldRefRegex, "");
    sanitized = sanitized.replace(/\(\s*\)/g, "");
    sanitized = sanitized.replace(
      /\btext\s*-\s*final report\b/gi,
      `${resolvedProjectTitle} - Final Report`
    );
    sanitized = sanitized.replace(/\btext\b/gi, resolvedProjectTitle);
    sanitized = sanitized.replace(
      /^text\s*-\s*final report\s*\|/gim,
      "|"
    );
    sanitized = sanitized.replace(/\s{2,}/g, " ");
    sanitized = sanitized.replace(/\s+\./g, ".");
    sanitized = sanitized.replace(/(?:\*\*|\*)issued by[^*]+(?:\*\*)?/gi, "");
    sanitized = sanitized.replace(/issued by[^|\n]+\|\s*\d{4}-\d{2}-\d{2}[^*\n]*/gi, "");
    sanitized = sanitized.replace(/page\s*\d+/gi, "");
    sanitized = sanitized.replace(/\s+#\s*$/gm, "");
    sanitized = sanitized.replace(/\s+#\s+(?=\S)/g, " ");
    sanitized = sanitized.replace(/^#{2,6}\s*$/gm, "");
    sanitized = sanitized.replace(/\*\*\s*Assumptions\s*&\s*Gaps\s*:\s*\*\*/gi, "\n\n**Assumptions & Gaps:**");
    sanitized = sanitized.replace(/\*\*\s*Basis of Assessment\s*:\s*\*\*/gi, "\n\n**Basis of Assessment:**");
    sanitized = sanitized.replace(/\*\*\s*Confidence\s*:\s*/gi, "\n\n**Confidence:** ");
    const lines = sanitized
      .split("\n")
      .map((line) => {
        const cleaned = line.replace(/[ \t]{2,}/g, " ").replace(/\s+$/g, "");
        const boldMatches = cleaned.match(/\*\*/g);
        if (boldMatches && boldMatches.length % 2 === 1) {
          return cleaned.replace(/\*\*/g, "");
        }
        return cleaned;
      })
      .filter((line) => {
        const trimmed = line.trim().toLowerCase();
        if (!trimmed) return true;
        if (/^#+\s*text\s*-\s*final report/.test(trimmed)) return false;
        if (/^#{2,6}\s*$/.test(trimmed)) return false;
        if (/^-\s*:\s*$/.test(trimmed)) return false;
        return true;
      });
    return lines.join("\n").trim();
  };

  const normalizeHeadingSpacing = (text: string) => {
    let normalized = text;
    normalized = normalized.replace(/(\S)(###\s+)/g, "$1\n\n### ");
    normalized = normalized.replace(/(\S)(##\s+)/g, "$1\n\n## ");
    normalized = normalized.replace(/(\S)(####\s+)/g, "$1\n\n#### ");
    normalized = normalized.replace(/(\S)(#####\s+)/g, "$1\n\n##### ");
    normalized = normalized.replace(/(\S)(######\s+)/g, "$1\n\n###### ");
    normalized = normalized.replace(/(\S)(\*\*\s*Assumptions\s*&\s*Gaps)/g, "$1\n\n$2");
    normalized = normalized.replace(/(\S)(\*\*\s*Basis of Assessment)/g, "$1\n\n$2");
    normalized = normalized.replace(/(\S)(\*\*\s*Confidence\s*:)/g, "$1\n\n$2");
    const lines = normalized.split("\n");
    const output: string[] = [];
    lines.forEach((line, index) => {
      const isHeading = /^\s*#{2,6}\s+/.test(line);
      if (isHeading) {
        const prev = output[output.length - 1];
        if (prev && prev.trim().length > 0) {
          output.push("");
        }
      }
      output.push(line);
      const next = lines[index + 1];
      if (isHeading && next && next.trim().length > 0) {
        output.push("");
      }
    });
    return output.join("\n").trim();
  };

  const normalizeTableSpacing = (text: string) => {
    const lines = text.split("\n");
    const output: string[] = [];
    lines.forEach((line, index) => {
      const isTableRow = /^\s*\|/.test(line);
      const prev = output[output.length - 1];
      if (isTableRow && prev && prev.trim().length > 0 && !/^\s*\|/.test(prev)) {
        output.push("");
      }
      output.push(line);
      const next = lines[index + 1];
      if (isTableRow && next && next.trim().length > 0 && !/^\s*\|/.test(next)) {
        output.push("");
      }
    });
    return output.join("\n").trim();
  };

  const leanCanvasLabels = [
    "Problem",
    "Existing Alternatives",
    "Solution",
    "Key Metrics",
    "Unique Value Proposition",
    "High Level Concept",
    "Unfair Advantage",
    "Channels",
    "Customer Segments",
    "Early Adopters",
    "Cost Structure",
    "Revenue Streams",
  ] as const;

  const parseLeanCanvasContent = (text: string) => {
    const labelMap = new Map(
      leanCanvasLabels.map((label) => [label.toLowerCase(), label])
    );
    const labelRegex = new RegExp(
      `^\\s*(?:[-*]\\s*)?(?:\\*\\*\\s*)?(${leanCanvasLabels
        .map(escapeRegExp)
        .join("|")})\\s*:\\s*(.*)$`,
      "i"
    );

    const fields = new Map<string, string[]>();
    let currentLabel: string | null = null;
    let confidence: string | null = null;

    text.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentLabel) fields.get(currentLabel)?.push("");
        return;
      }

      const confidenceMatch = trimmed.match(
        /^(\*\*?\s*)?confidence\s*[:\-]\s*(low|medium|high)\b/i
      );
      if (confidenceMatch) {
        confidence = confidenceMatch[2].toLowerCase();
        currentLabel = null;
        return;
      }

      const match = trimmed.match(labelRegex);
      if (match) {
        const canonical = labelMap.get(match[1].toLowerCase());
        if (!canonical) return;
        currentLabel = canonical;
        if (!fields.has(canonical)) fields.set(canonical, []);
        const remainder = match[2]?.trim();
        if (remainder) fields.get(canonical)?.push(remainder);
        return;
      }

      if (currentLabel) {
        fields.get(currentLabel)?.push(trimmed);
      }
    });

    const values: Record<string, string> = {};
    leanCanvasLabels.forEach((label) => {
      const value = (fields.get(label) || []).join("\n").trim();
      values[label] = value;
    });

    return { fields: values, confidence };
  };

  const leanCanvasPlaceholders: Record<string, string> = {
    Problem: "List your customers' top 3 problems.",
    "Existing Alternatives": "List how these problems are solved today.",
    Solution: "Outline possible solution for each problem.",
    "Key Metrics": "List key numbers telling how your business is doing today.",
    "Unique Value Proposition":
      "Single, clear, compelling message that turns an unaware visitor into an interested prospect.",
    "High Level Concept": "List your X for Y analogy (e.g., YouTube = Flickr for videos).",
    "Unfair Advantage": "Something that can't be easily copied or bought.",
    Channels: "List your path to customers.",
    "Customer Segments": "List your target customers and users.",
    "Early Adopters": "List characteristics of your ideal customer.",
    "Cost Structure": "List your fixed and variable costs.",
    "Revenue Streams": "List your sources of revenue.",
  };

  const leanCanvasMarkdownComponents = {
    p: ({ children }: { children?: ReactNode }) => (
      <p className="mt-2 text-[13px] leading-[1.6] text-slate-800 first:mt-0">
        {children}
      </p>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-[1.6] text-slate-800">
        {children}
      </ul>
    ),
    li: ({ children }: { children?: ReactNode }) => (
      <li className="text-[13px] leading-[1.6] text-slate-800">{children}</li>
    ),
  };

  const renderLeanCanvasGrid = (text: string) => {
    const parsed = parseLeanCanvasContent(text);
    const cell = (title: string, body: string, className?: string) => {
      const trimmed = body?.trim();
      const placeholder = leanCanvasPlaceholders[title] ?? "Not provided.";
      const displayText = trimmed ? body : placeholder;
      const isPlaceholder = !trimmed;
      return (
        <div className={`p-3 ${className ?? ""}`}>
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"
          style={{ fontFamily: "var(--report-sans)" }}
        >
          {title}
        </div>
        <div className={`mt-2 ${isPlaceholder ? "text-slate-800" : ""}`}>
          <ReactMarkdown components={leanCanvasMarkdownComponents}>
            {displayText}
          </ReactMarkdown>
        </div>
      </div>
      );
    };

    return (
      <div className="mt-6">
        <div className="grid grid-cols-5 border border-slate-900/80">
          {cell("Problem", parsed.fields["Problem"], "border-r border-slate-900/80")}
          {cell(
            "Solution",
            parsed.fields["Solution"],
            "border-r border-b border-slate-900/80"
          )}
          {cell(
            "Unique Value Proposition",
            parsed.fields["Unique Value Proposition"],
            "border-r border-slate-900/80"
          )}
          {cell(
            "Unfair Advantage",
            parsed.fields["Unfair Advantage"],
            "border-r border-b border-slate-900/80"
          )}
          {cell(
            "Customer Segments",
            parsed.fields["Customer Segments"],
            ""
          )}

          {cell(
            "Existing Alternatives",
            parsed.fields["Existing Alternatives"],
            "border-r border-b border-slate-900/80"
          )}
          {cell(
            "Key Metrics",
            parsed.fields["Key Metrics"],
            "border-t border-r border-b border-slate-900/80"
          )}
          {cell(
            "High Level Concept",
            parsed.fields["High Level Concept"],
            "border-r border-b border-slate-900/80"
          )}
          {cell(
            "Channels",
            parsed.fields["Channels"],
            "border-t border-r border-b border-slate-900/80"
          )}
          {cell(
            "Early Adopters",
            parsed.fields["Early Adopters"],
            "border-b border-slate-900/80"
          )}

          {cell(
            "Cost Structure",
            parsed.fields["Cost Structure"],
            "col-span-3 border-r border-slate-900/80"
          )}
          {cell("Revenue Streams", parsed.fields["Revenue Streams"], "col-span-2")}
        </div>
        {parsed.confidence ? (
          <div className="mt-4 flex justify-center">
            {renderConfidenceBadge(parsed.confidence as "low" | "medium" | "high")}
          </div>
        ) : null}
      </div>
    );
  };

  const normalizeLeanCanvasNotes = (text: string) => {
    const lines = text.split("\n");
    const normalized = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("|")) return line;
      if (/^\s*\|[-\s:]+\|/.test(trimmed)) return line;

      const parts = line.split("|");
      if (parts.length < 5) return line;
      const notesIndex = parts.length - 2;
      let notesValue = parts[notesIndex]?.trim() ?? "";
      notesValue = notesValue.replace(/^based on\s*/i, "").trim();
      if (!notesValue || fieldRefRegex.test(notesValue)) {
        notesValue = "None";
      }
      parts[notesIndex] = ` ${notesValue} `;
      return parts.join("|");
    });
    return normalized.join("\n");
  };

  const normalizeReportText = summaryText.replace(/\r\n/g, "\n").trim();
  const headerFromText = extractLineValue(normalizeReportText, "Header");
  const footerFromText = extractLineValue(normalizeReportText, "Footer");
  const titleFromText = extractLineValue(normalizeReportText, "Title");
  const preparedForFromText = extractLineValue(normalizeReportText, "Prepared for");
  const preparedByFromText = extractLineValue(normalizeReportText, "Prepared by");
  const documentIdFromText = extractLineValue(normalizeReportText, "Document ID");
  const documentIdAltFromText = extractLineValue(normalizeReportText, "Document Id");
  const issuerFromText = extractLineValue(normalizeReportText, "Issued by");
  const dateFromText = extractLineValue(normalizeReportText, "Date");
  const projectConclusionFromText = extractLineValue(
    normalizeReportText,
    "Project Conclusion"
  );

  const issuerFromFooter = footerFromText
    ? footerFromText.match(/issued by\s+(.+?)\s*\|/i)?.[1]?.trim()
    : undefined;
  const dateFromFooter = footerFromText?.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];

  const reportIssuer =
    cleanValue(issuerFromText ?? issuerFromFooter) ?? "IdeaSense AI Advisory";
  const reportDate = (() => {
    const raw = cleanValue(dateFromText ?? dateFromFooter);
    if (!raw) return todayIso;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return todayIso;
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return parsed < todayStart ? todayIso : raw;
  })();
  const normalizePlaceholderText = (value: string | undefined) => {
    if (!value) return value;
    const lowered = value.trim().toLowerCase();
    if (lowered === "text" || lowered === "text - final report") {
      return `${resolvedProjectTitle} - Final Report`;
    }
    if (lowered.includes("text - final report")) {
      return value.replace(
        /text\s*-\s*final report/gi,
        `${resolvedProjectTitle} - Final Report`
      );
    }
    if (lowered.includes("text")) {
      return value.replace(/\btext\b/gi, resolvedProjectTitle);
    }
    return value;
  };

  const normalizeReportTitle = (value: string | undefined) => {
    const cleaned = normalizePlaceholderText(cleanValue(value));
    if (!cleaned) return undefined;
    return cleaned.replace(/^\s*final report\s*[-:]\s*/i, "").trim();
  };

  const formatReportTitle = (value: string | undefined) => {
    if (!value) return value;
    return value
      .split(" ")
      .map((token) => {
        const parts = token.split("-");
        const normalized = parts.map((part) => {
          if (!part) return part;
          if (part.toLowerCase() === "ideasense") return "IdeaSense";
          const hasUpper = /[A-Z]/.test(part);
          const hasLower = /[a-z]/.test(part);
          if (!hasUpper && hasLower) {
            return part.charAt(0).toUpperCase() + part.slice(1);
          }
          return part;
        });
        return normalized.join("-");
      })
      .join(" ");
  };

  const reportTitle = normalizeReportTitle(titleFromText) ?? resolvedProjectTitle;
  const reportDisplayTitle = formatReportTitle(reportTitle);
  const reportHeaderLine =
    normalizePlaceholderText(cleanValue(headerFromText)) ??
    `${resolvedProjectTitle} - Final Report`;
  const reportPreparedFor = cleanValue(preparedForFromText);
  const reportPreparedBy = cleanValue(preparedByFromText);
  const rawDocumentId = cleanValue(documentIdFromText ?? documentIdAltFromText);
  const reportDocumentId = rawDocumentId;
  const reportConclusion = cleanValue(projectConclusionFromText);

  const reportMetaItems = [
    reportPreparedFor ? { label: "Prepared for", value: reportPreparedFor } : null,
    reportPreparedBy ? { label: "Prepared by", value: reportPreparedBy } : null,
    { label: "Issued by", value: reportIssuer },
    { label: "Date", value: reportDate },
  ].filter(Boolean) as { label: string; value: string }[];

  type ReportSection = { title: string; body: string };

  const parseReportSections = (text: string) => {
    const sections: ReportSection[] = [];
    const lines = text.split("\n");
    let currentTitle = "";
    let currentBody: string[] = [];

    lines.forEach((line) => {
      const headingMatch = line.match(/^##(?!#)\s+(.+)/);
      if (headingMatch) {
        if (currentTitle || currentBody.length > 0) {
          sections.push({
            title: currentTitle || "Report",
            body: currentBody.join("\n").trim(),
          });
        }
        currentTitle = headingMatch[1].trim();
        currentBody = [];
      } else {
        currentBody.push(line);
      }
    });

    if (currentTitle || currentBody.length > 0) {
      sections.push({
        title: currentTitle || "Report",
        body: currentBody.join("\n").trim(),
      });
    }

    return sections;
  };

  const renderReportSections = (emptyState: string) => {
    if (!normalizeReportText) {
      return (
        <div className="text-[15px] leading-[1.8] text-slate-600">
          {emptyState}
        </div>
      );
    }

    const sections = parseReportSections(normalizeReportText).filter((section) => {
      const normalizedTitle = section.title.trim().toLowerCase();
      if (
        [
          "cover page",
          "document control",
          "header & footer (display convention)",
          "header and footer (display convention)",
        ].includes(normalizedTitle)
      ) {
        return false;
      }
      if (normalizedTitle.includes("final report") || normalizedTitle === "text") {
        const bodySansMeta = section.body
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => {
            if (!line) return false;
            if (line === "---") return false;
            return !/^(?:[-*]\s*)?(?:\*\*\s*)?(header|footer)\s*:/i.test(
              line
            );
          })
          .join("\n")
          .trim();
        if (!bodySansMeta) return false;
      }
      return true;
    });
    const resolvedSections: ReportSection[] =
      sections.length > 0
        ? sections
        : [{ title: "Report", body: normalizeReportText }];
    const preferredOrder = [
      "dvf score & explanation",
      "lean canvas",
      "stage summaries",
      "risks & mitigations",
      "risks and mitigations",
      "risk register",
      "summary & next steps",
      "summary and next steps",
    ];
    const orderedSections: ReportSection[] =
      resolvedSections.length > 1
        ? preferredOrder
            .map((title) =>
              resolvedSections.find((section) =>
                section.title.toLowerCase().includes(title)
              )
            )
            .filter((section): section is ReportSection => Boolean(section))
        : resolvedSections;
    const finalSections =
      orderedSections.length > 0 ? orderedSections : resolvedSections;

    const extractDvfScores = (text: string) => {
      const extractScore = (label: string) => {
        const safeLabel = escapeRegExp(label);
        const match = text.match(
          new RegExp(`${safeLabel}[^0-9]{0,12}(\\d{1,3})`, "i")
        );
        if (!match) return null;
        const value = Number(match[1]);
        return Number.isNaN(value) ? null : value;
      };

      const desirability = extractScore("Desirability");
      const viability = extractScore("Viability");
      const feasibility = extractScore("Feasibility");
      const total = extractScore("Total");
      const decisionBandMatch = text.match(
        /decision band[^A-Za-z0-9]*([A-Za-z]+)/i
      );
      const decisionBand = decisionBandMatch?.[1]?.trim();

      if (
        desirability === null ||
        viability === null ||
        feasibility === null
      ) {
        return null;
      }

      if (
        [desirability, viability, feasibility].some(
          (value) => Number.isNaN(value) || value < 0 || value > 100
        )
      ) {
        return null;
      }

      return { desirability, viability, feasibility, total, decisionBand };
    };

    const renderDvfTriangle = (scores: {
      desirability: number;
      viability: number;
      feasibility: number;
      total: number | null;
      decisionBand?: string;
    }) => {
      const size = 300;
      const centerX = size / 2;
      const centerY = size / 2 + 12;
      const radius = 110;
      const axis = [
        { label: "Desirability", score: scores.desirability, angle: -90 },
        { label: "Viability", score: scores.viability, angle: 150 },
        { label: "Feasibility", score: scores.feasibility, angle: 30 },
      ];

      const toPoint = (angleDeg: number, distance: number) => {
        const angle = (Math.PI / 180) * angleDeg;
        return {
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
        };
      };

      const outerPoints = axis.map((item) => toPoint(item.angle, radius));
      const innerPoints = axis.map((item) =>
        toPoint(item.angle, (item.score / 100) * radius)
      );
      const outerPolygon = outerPoints.map((p) => `${p.x},${p.y}`).join(" ");
      const innerPolygon = innerPoints.map((p) => `${p.x},${p.y}`).join(" ");

      return (
        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="border border-slate-200 bg-white px-4 py-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <polygon
                points={outerPolygon}
                fill="none"
                stroke="#cbd5f5"
                strokeWidth="1.5"
              />
              {axis.map((item) => {
                const point = toPoint(item.angle, radius);
                return (
                  <line
                    key={item.label}
                    x1={centerX}
                    y1={centerY}
                    x2={point.x}
                    y2={point.y}
                    stroke="#d9e2f2"
                    strokeWidth="1"
                  />
                );
              })}
              <polygon
                points={innerPolygon}
                fill="rgba(59,130,246,0.18)"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {axis.map((item) => {
                const point = toPoint(item.angle, radius + 24);
                return (
                  <text
                    key={`${item.label}-label`}
                    x={point.x}
                    y={point.y}
                    textAnchor="middle"
                    className="fill-slate-500 text-[11px] uppercase tracking-[0.14em]"
                  >
                    {item.label}
                  </text>
                );
              })}
            </svg>
            <div
              className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 text-center"
              style={{ fontFamily: "var(--report-sans)" }}
            >
              Figure 1. DVF triangle profile.
            </div>
          </div>
          <div className="w-full max-w-[380px] mx-auto">
            <div
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 text-center"
              style={{ fontFamily: "var(--report-sans)" }}
            >
              DVF Scores
            </div>
            <div className="mt-3 border border-slate-200 text-[13px] text-slate-700">
              {[
                { label: "Desirability", value: scores.desirability },
                { label: "Viability", value: scores.viability },
                { label: "Feasibility", value: scores.feasibility },
                scores.total !== null
                  ? { label: "Total", value: scores.total }
                  : null,
                scores.decisionBand
                  ? { label: "Decision Band", value: scores.decisionBand }
                  : null,
              ]
                .filter(Boolean)
                .map((row, rowIndex) => (
                  <div
                    key={row?.label}
                    className={`flex items-center justify-between px-3 py-2 ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                    style={{ fontFamily: "var(--report-sans)" }}
                  >
                    <span className="font-semibold text-slate-600">
                      {row?.label}
                    </span>
                    <span className="text-slate-900">{row?.value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-12">
        {finalSections.map((section, index) => {
          const isCoverPage = section.title.toLowerCase() === "cover page";
          const lines = section.body.split("\n").filter((line) => {
            const trimmed = line.trim();
            if (!trimmed) return true;
            if (trimmed === "---") return false;
            const metadataMatch = /^(?:[-*]\s*)?(?:\*\*\s*)?(prepared for|prepared by|issued by|date|document id|header|footer)\s*:/i.test(
              trimmed
            );
            if (metadataMatch) return false;
            return true;
          });

          const firstNonEmptyIndex = lines.findIndex(
            (line) => line.trim().length > 0
          );
          let headerLine: string | null = null;
          if (firstNonEmptyIndex >= 0) {
            const headerCandidate = lines[firstNonEmptyIndex].trim();
            const looksLikeHeader =
              headerCandidate === reportHeaderLine ||
              headerCandidate.toLowerCase().endsWith("final report");
            if (looksLikeHeader) {
              headerLine = headerCandidate;
              lines.splice(firstNonEmptyIndex, 1);
            }
          }

          if (!headerLine) {
            headerLine = reportHeaderLine;
          }

          const firstBodyIndex = lines.findIndex(
            (line) => line.trim().length > 0
          );
          if (firstBodyIndex >= 0) {
            const bodyCandidate = lines[firstBodyIndex].trim();
            const subheadingMatch = bodyCandidate.match(/^###\s+(.+)/);
            if (subheadingMatch) {
              const subheadingText = subheadingMatch[1].trim();
              const looksLikeHeader =
                subheadingText === headerLine ||
                subheadingText.toLowerCase().endsWith("final report");
              if (looksLikeHeader) {
                lines.splice(firstBodyIndex, 1);
              }
            }
          }

          let footerLine: string | null = null;
          for (let i = lines.length - 1; i >= 0; i -= 1) {
            const candidate = lines[i].trim();
            if (!candidate) continue;
            const footerMatch = candidate.match(/footer\s*:\s*(.+)$/i);
              if (footerMatch) {
                footerLine = cleanValue(footerMatch[1]) ?? null;
              lines.splice(i, 1);
              break;
            }
            if (/issued by/i.test(candidate) && /page\s*\d+/i.test(candidate)) {
              footerLine = candidate;
              lines.splice(i, 1);
              break;
            }
          }

          if (!footerLine) {
            footerLine = `Issued by ${reportIssuer} | ${reportDate} | Page ${
              index + 1
            }`;
          }
          footerLine = footerLine.replace(/page\s*\d+/i, `Page ${index + 1}`);

          const sanitizedBody = sanitizeReportContent(lines.join("\n").trim());
          const isLeanCanvas = section.title
            .toLowerCase()
            .includes("lean canvas");
          const baseBody = isLeanCanvas
            ? normalizeLeanCanvasNotes(sanitizedBody)
            : normalizeHeadingSpacing(sanitizedBody);
          const cleanedBody = isLeanCanvas
            ? baseBody
            : normalizeTableSpacing(baseBody);
          const isDvfSection = section.title.toLowerCase().includes("dvf");
          const titleClassName = isDvfSection
            ? "mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 text-center"
            : isCoverPage
              ? "mt-6 text-3xl font-semibold text-slate-900 tracking-tight"
              : "mt-6 text-2xl font-semibold text-slate-900 tracking-tight";
          const dvfScores = isDvfSection ? extractDvfScores(cleanedBody) : null;
          const bodyWithoutConclusion = isDvfSection
            ? cleanedBody.replace(
                /(?:^\s*(?:[-*]\s*)?(?:\*\*\s*)?Project Conclusion\s*:\s*.+$\s*)/im,
                ""
              ).trim()
            : cleanedBody;
          const bodyWithoutScoreLines = isDvfSection
            ? bodyWithoutConclusion
                .split("\n")
                .filter((line) =>
                  !/^\s*(?:[-*]\s*)?(?:\*\*\s*)?(desirability|viability|feasibility|total|decision band)\b/i.test(
                    line.trim()
                  )
                )
                .join("\n")
                .trim()
            : bodyWithoutConclusion;

          return (
            <section
              key={`${section.title}-${index}`}
              className="report-print-section pb-4 last:pb-0"
            >
              {index === 0 ? (
                <div
                  className="text-[10px] uppercase tracking-[0.24em] text-slate-500 text-center"
                  style={{ fontFamily: "var(--report-sans)" }}
                >
                  FINAL REPORT
                </div>
              ) : null}
              {index === 0 ? (
                <div
                  className="mt-2 text-3xl font-semibold tracking-[0.08em] text-slate-900 text-center"
                  style={{ fontFamily: "var(--report-serif)" }}
                >
                  {reportDisplayTitle
                    ? `${reportDisplayTitle} - IdeaSense Report`
                    : "IdeaSense Report"}
                </div>
              ) : null}
              {index === 0 && reportMetaItems.length > 0 ? (
                <div
                  className="mt-4 space-y-2 text-[12px] text-slate-600"
                  style={{ fontFamily: "var(--report-sans)" }}
                >
                  {reportMetaItems.map((item) => (
                    <div key={item.label}>
                      <span className="font-semibold text-slate-700">
                        {item.label}
                      </span>
                      : {item.value}
                    </div>
                  ))}
                </div>
              ) : null}
              <div
                className={`${titleClassName} text-center`}
                style={{
                  fontFamily: isDvfSection
                    ? "var(--report-sans)"
                    : "var(--report-serif)",
                }}
              >
                {normalizePlaceholderText(section.title)}
              </div>
              {isDvfSection && reportConclusion ? (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-[1.7] text-slate-700">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Project Conclusion
                  </div>
                  <div className="mt-2 text-slate-800">{reportConclusion}</div>
                </div>
              ) : null}
              {dvfScores ? renderDvfTriangle(dvfScores) : null}
              {isLeanCanvas ? (
                renderLeanCanvasGrid(bodyWithoutScoreLines)
              ) : bodyWithoutScoreLines ? (
                <div className="mt-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={reportMarkdownComponents}
                  >
                    {bodyWithoutScoreLines}
                  </ReactMarkdown>
                </div>
              ) : null}
              {index === finalSections.length - 1 ? (
                <div
                  className="mt-8 text-[11px] text-slate-500 text-center"
                  style={{ fontFamily: "var(--report-sans)" }}
                >
                  {footerLine}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`print-panel flex flex-1 min-h-0 flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${
        isReportStage
          ? "bg-white/90"
          : "bg-white [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:28px_28px]"
      }`}
    >
      <div
        className={`print-hide shrink-0 border-b border-slate-200 flex items-center justify-between gap-3 ${
          isReportStage ? "bg-white/80 px-6 py-4" : "bg-white/90 px-4 py-3"
        }`}
      >
        <div className="min-w-0">
          {isReportStage ? (
            <>
              <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                Report View
              </div>
              <div className="mt-1 text-base font-semibold text-slate-900">
                {displayProjectTitle}
              </div>
              <div className="text-xs text-slate-500">
                {formattedUpdatedAt ? `Updated ${formattedUpdatedAt}` : null}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-slate-800">
                Summary - {viewStageKey}
              </div>
              <div className="text-xs text-slate-500">
                {isCurrentStage
                  ? isEditingSummary
                    ? "Current stage (editing)"
                    : "Current stage (read-only)"
                  : "Past stage (read-only)"}
              </div>
            </>
          )}
        </div>

        {isCurrentStage && (
          <div className="flex items-center gap-2">
            {isReportStage && (
              <button
                onClick={handleDownload}
                disabled={!hasSummary}
                className="
                  shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  border border-slate-200 text-slate-700 hover:bg-slate-50 transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Download
              </button>
            )}
            {canRefreshReport && (
              <button
                onClick={onRefreshReport}
                disabled={summaryLoading || summarySaving || refreshReportLoading}
                className="
                  shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  border border-slate-200 text-slate-700 hover:bg-slate-50 transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {refreshReportLoading ? "Refreshing..." : "Refresh"}
              </button>
            )}
            {hasSummary && (
              <button
                onClick={() => onSetEditing(true)}
                disabled={isEditingSummary}
                className="
                  shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  border border-slate-200 text-slate-700 hover:bg-slate-50 transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isEditingSummary ? "Editing" : "Edit"}
              </button>
            )}
              <button
                onClick={onSubmit}
                disabled={summaryLoading || summarySaving || !hasSummary}
                className="
                  shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  bg-blue-500 text-white hover:bg-blue-600 transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {summarySaving ? "Saving..." : "Confirm"}
              </button>
          </div>
        )}
      </div>

      <div className={`flex-1 min-h-0 ${isReportStage ? "bg-white/90" : "bg-transparent"}`}>
        {summaryLoading ? (
          <div className="p-4 text-slate-400 text-sm">
            {isReportStage ? "Preparing report..." : "Loading..."}
          </div>
        ) : isCurrentStage ? (
          isEditingSummary ? (
            isReportStage ? (
              <div className="h-full overflow-y-auto px-6 py-6">
                <div
                  className="
                    mx-auto w-full max-w-[820px]
                    border border-slate-200 bg-white shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]
                    [background-image:linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)]
                    [background-size:32px_32px]
                  "
                  style={{ fontFamily: "var(--report-serif)" }}
                >
                  <div className="px-10 py-10">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                      Draft Editor
                    </div>
                    <textarea
                      value={summaryText}
                      onChange={(e) => onSummaryChange(e.target.value)}
                      className="
                        w-full min-h-[420px] resize-none rounded-lg border border-slate-200
                        p-4 text-[15px] leading-[1.85] text-slate-800 outline-none
                        bg-white focus:ring-2 focus:ring-slate-200
                      "
                      style={{ fontFamily: "var(--report-sans)" }}
                      placeholder="Generate a report to view it here."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                value={summaryText}
                onChange={(e) => onSummaryChange(e.target.value)}
                className="
                  w-full h-full resize-none rounded-xl border border-slate-200
                  p-3 text-sm text-slate-800 outline-none
                  bg-transparent backdrop-blur-[1px] focus:ring-2 focus:ring-sky-200
                "
                placeholder="Generate a summary to view it here."
              />
            )
          ) : (
            isReportStage ? (
              <div className="h-full overflow-y-auto px-6 py-6 report-print-scroll">
                <div className="report-print-root mx-auto w-full max-w-[1100px]">
                  <div className="report-print-grid grid gap-10 md:grid-cols-[minmax(0,820px)_220px]">
                    <div className="min-w-0">
                      <div
                        className="
                          report-print-paper w-full max-w-[820px]
                          border border-slate-200 bg-white shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]
                          [background-image:linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)]
                          [background-size:32px_32px]
                        "
                        style={{ fontFamily: "var(--report-serif)" }}
                      >
                        <div className="px-10 py-10">
                          {renderReportSections(
                            "Generate a report to view it here."
                          )}
                        </div>
                      </div>
                    </div>
                    <aside className="report-print-annotations hidden md:block">
                      <div className="sticky top-6 text-[11px] text-slate-500">
                        <div className="font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Annotations
                        </div>
                        <ol className="mt-3 space-y-3 text-slate-600">
                          <li>
                            <span className="font-semibold text-slate-700">
                              D
                            </span>{" "}
                            Desirability: Evidence of user pain and demand.
                          </li>
                          <li>
                            <span className="font-semibold text-slate-700">
                              V
                            </span>{" "}
                            Viability: Business model, market, and revenue
                            strength.
                          </li>
                          <li>
                            <span className="font-semibold text-slate-700">
                              F
                            </span>{" "}
                            Feasibility: Technical and operational ability to
                            deliver.
                          </li>
                        </ol>
                        <div className="mt-5 text-[11px] text-slate-500">
                          Find details in the sidebar guide, including what each
                          score range means (risk tier/decision band) and stage
                          summary format examples.
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto rounded-xl border border-slate-100 bg-transparent backdrop-blur-[1px] p-3">
                {hasContent ? (
                  <div className="text-sm text-slate-700 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summaryText}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    Generate a summary to view it here.
                  </div>
                )}
              </div>
            )
          )
        ) : (
          isReportStage ? (
            <div className="h-full overflow-y-auto px-6 py-6 report-print-scroll">
              <div className="report-print-root mx-auto w-full max-w-[1180px]">
                <div className="report-print-grid grid gap-10 md:grid-cols-[minmax(0,880px)_220px]">
                  <div className="min-w-0">
                    <div
                      className="
                        report-print-paper w-full max-w-[880px]
                        border border-slate-200 bg-white shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)]
                        [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)]
                        [background-size:28px_28px]
                      "
                      style={{ fontFamily: "var(--report-sans)" }}
                    >
                      <div className="px-10 py-10">
                        {renderReportSections(
                          "No report available for this stage."
                        )}
                      </div>
                    </div>
                  </div>
                  <aside className="report-print-annotations hidden md:block">
                    <div className="sticky top-6 text-[11px] text-slate-500">
                        <div className="font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Annotations
                        </div>
                        <ol className="mt-3 space-y-3 text-slate-600">
                        <li>
                          <span className="font-semibold text-slate-700">
                            D
                          </span>{" "}
                          Desirability: Evidence of user pain and demand.
                        </li>
                        <li>
                          <span className="font-semibold text-slate-700">
                            V
                          </span>{" "}
                          Viability: Business model, market, and revenue
                          strength.
                        </li>
                        <li>
                          <span className="font-semibold text-slate-700">
                            F
                          </span>{" "}
                          Feasibility: Technical and operational ability to
                          deliver.
                        </li>
                      </ol>
                      <div className="mt-5 text-[11px] text-slate-500">
                        Find details in the sidebar guide, including what each
                        score range means (risk tier/decision band) and stage
                        summary format examples.
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto rounded-xl border border-slate-100 bg-transparent backdrop-blur-[1px] p-3">
              {hasContent ? (
                <div className="text-sm text-slate-700 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {summaryText}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  No summary available for this stage.
                </div>
              )}
            </div>
          )
        )}
      </div>

      <div className="print-hide shrink-0 px-4 pb-4 text-xs text-slate-400">
        {isReportStage
          ? isCurrentStage
            ? "Edit the report draft, then confirm to submit."
            : "Report is read-only."
          : isCurrentStage
          ? "Click Edit to adjust the summary, then Confirm to submit."
          : "Past stage summary is read-only."}
      </div>
    </div>
  );
}
