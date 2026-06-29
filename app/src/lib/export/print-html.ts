import { SECTION_DEFINITIONS } from "@/lib/sections/definitions";
import { SectionType } from "@/lib/sections/types";
import { sectionViewModel, ViewBlock } from "@/lib/sections/view-model";

export interface PrintSection {
  type: SectionType;
  content: unknown;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blockToHtml(block: ViewBlock): string {
  switch (block.kind) {
    case "name":
      return `<p class="bse-para bse-persona-name">${esc(block.text)}</p>`;
    case "labelled":
      return `<div class="bse-block"><h4 class="bse-block-heading">${esc(
        block.label,
      )}</h4><p class="bse-para">${esc(block.text)}</p></div>`;
    case "list":
      return `<ul class="bse-values">${block.items
        .map(
          (i) =>
            `<li class="bse-value"><span class="bse-value-name">${esc(
              i.name,
            )}</span>${i.detail ? ` — ${esc(i.detail)}` : ""}</li>`,
        )
        .join("")}</ul>`;
    default:
      return `<p class="bse-para">${esc(block.text)}</p>`;
  }
}

const PRINT_CSS = `
  :root {
    --bse-accent: #18181b;
    --bse-muted: #71717a;
    --bse-line: #e4e4e7;
    --bse-text: #27272a;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: "Helvetica Neue", Arial, "Segoe UI", sans-serif;
    color: var(--bse-text); font-size: 12pt; line-height: 1.6;
  }
  .bse-cover {
    height: 100vh; display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 0 18mm; page-break-after: always;
    border-left: 6px solid var(--bse-accent);
  }
  .bse-cover-kicker {
    text-transform: uppercase; letter-spacing: 0.2em;
    font-size: 10pt; color: var(--bse-muted); margin-bottom: 12px;
  }
  .bse-cover-title { font-size: 32pt; font-weight: 700; margin: 0 0 8px; }
  .bse-cover-client { font-size: 16pt; color: var(--bse-muted); margin: 0; }
  .bse-section {
    padding: 14mm 18mm; page-break-inside: avoid;
    border-bottom: 1px solid var(--bse-line);
  }
  .bse-section-title {
    font-size: 18pt; font-weight: 700; margin: 0 0 4px; color: var(--bse-accent);
  }
  .bse-section-order { color: var(--bse-muted); font-weight: 400; }
  .bse-section-summary { font-size: 9pt; color: var(--bse-muted); margin: 0 0 14px; }
  .bse-block { margin-bottom: 12px; }
  .bse-block-heading {
    font-size: 9pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--bse-muted); margin: 0 0 3px;
  }
  .bse-para { margin: 0 0 8px; white-space: pre-wrap; }
  .bse-persona-name { font-weight: 700; font-size: 14pt; }
  .bse-values { list-style: none; padding: 0; margin: 0; }
  .bse-value { margin-bottom: 6px; }
  .bse-value-name { font-weight: 700; }
  [dir="rtl"] .bse-cover { border-left: none; border-right: 6px solid var(--bse-accent); align-items: flex-end; text-align: right; }
  [dir="rtl"] .bse-section, [dir="rtl"] .bse-block { text-align: right; }
`;

/** Builds the full standalone HTML document for the PDF. */
export function buildPrintHtml(args: {
  projectName: string;
  clientName: string;
  language: "ar" | "en";
  sections: PrintSection[];
}): string {
  const { projectName, clientName, language, sections } = args;
  const dir = language === "ar" ? "rtl" : "ltr";

  const sectionsHtml = sections
    .map(({ type, content }) => {
      const def = SECTION_DEFINITIONS[type];
      const body = sectionViewModel(type, content).map(blockToHtml).join("");
      return `<section class="bse-section">
        <h2 class="bse-section-title"><span class="bse-section-order">${def.order}. </span>${esc(
          def.displayName,
        )}</h2>
        <p class="bse-section-summary">${esc(def.summary)}</p>
        ${body}
      </section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head><meta charset="utf-8" /><style>${PRINT_CSS}</style></head>
<body>
  <div class="bse-cover">
    <p class="bse-cover-kicker">Brand Strategy</p>
    <h1 class="bse-cover-title">${esc(projectName)}</h1>
    <p class="bse-cover-client">${esc(clientName)}</p>
  </div>
  ${sectionsHtml}
</body>
</html>`;
}
