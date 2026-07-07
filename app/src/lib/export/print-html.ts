import { SECTION_DEFINITIONS } from "@/lib/sections/definitions";
import { SectionType, localizedSection } from "@/lib/sections/types";
import { sectionViewModel, ViewBlock } from "@/lib/sections/view-model";
import { printFontFaceCss } from "./fonts";

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

/* Visual Foundations palette — matches the app's tokens in globals.css. */
const PRINT_CSS = `
  :root {
    --ivory: #f4ede3;
    --ivory-dark: #ebe1d2;
    --cream: #faf5ec;
    --plum: #5b2e3a;
    --plum-deep: #3d1e26;
    --peach-soft: #e8b79a;
    --ink: #2a1e1a;
    --ink-soft: #4a3a33;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; background: var(--ivory);
    font-family: "Thmanyah Serif Text", Georgia, serif;
    color: var(--ink-soft); font-size: 12pt; line-height: 1.7;
  }

  .bse-cover {
    height: 100vh; background: var(--plum-deep);
    padding: 12mm; page-break-after: always;
  }
  .bse-cover-card {
    height: 100%; background: var(--cream); border-radius: 10mm;
    padding: 18mm; display: flex; flex-direction: column;
    justify-content: center; text-align: start;
  }
  .bse-cover-kicker {
    font-family: "Thmanyah Sans", sans-serif; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.25em;
    font-size: 10pt; color: var(--plum); margin: 0 0 10mm;
  }
  .bse-cover-title {
    font-family: "Thmanyah Serif Display", serif; font-weight: 900;
    font-size: 38pt; line-height: 1.15; margin: 0 0 6mm;
    color: var(--plum);
  }
  .bse-cover-title .bse-hl { background: var(--peach-soft); padding: 0.03em 0.15em; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  .bse-cover-client {
    font-family: "Thmanyah Sans", sans-serif; font-weight: 700;
    font-size: 15pt; color: var(--ink); margin: 0;
  }
  .bse-cover-foot {
    margin-top: auto; font-family: "Thmanyah Sans", sans-serif;
    font-size: 9pt; color: var(--ink-soft);
  }

  .bse-section {
    padding: 14mm 18mm; page-break-inside: avoid;
    border-bottom: 1px solid var(--ivory-dark);
  }
  .bse-section-title {
    font-family: "Thmanyah Serif Display", serif; font-weight: 700;
    font-size: 19pt; margin: 0 0 3px; color: var(--plum);
  }
  .bse-section-order { color: var(--ink); font-weight: 900; }
  .bse-section-summary {
    font-family: "Thmanyah Sans", sans-serif;
    font-size: 9pt; color: var(--ink-soft); margin: 0 0 8mm;
  }
  .bse-block { margin-bottom: 5mm; }
  .bse-block-heading {
    display: inline-block; font-family: "Thmanyah Sans", sans-serif;
    font-size: 8.5pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--ink);
    background: var(--ivory-dark); border-radius: 99px;
    padding: 1px 8px; margin: 0 0 2mm;
  }
  .bse-para { margin: 0 0 3mm; white-space: pre-wrap; }
  .bse-persona-name {
    font-family: "Thmanyah Serif Display", serif;
    font-weight: 700; font-size: 15pt; color: var(--ink);
  }
  .bse-values { list-style: none; padding: 0; margin: 0; }
  .bse-value { margin-bottom: 3mm; padding-inline-start: 5mm; position: relative; }
  .bse-value::before {
    content: ""; position: absolute; inset-inline-start: 0; top: 0.55em;
    width: 2.5mm; height: 2.5mm; border-radius: 50%; background: var(--plum);
  }
  .bse-value-name { font-weight: 700; color: var(--ink); }

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
  const date = new Date().toLocaleDateString(
    language === "ar" ? "ar" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const sectionsHtml = sections
    .map(({ type, content }) => {
      const def = SECTION_DEFINITIONS[type];
      const loc = localizedSection(def, language);
      const body = sectionViewModel(type, content).map(blockToHtml).join("");
      return `<section class="bse-section">
        <h2 class="bse-section-title"><span class="bse-section-order">${def.order}. </span>${esc(
          loc.name,
        )}</h2>
        <p class="bse-section-summary">${esc(loc.summary)}</p>
        ${body}
      </section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head><meta charset="utf-8" /><style>${printFontFaceCss()}</style><style>${PRINT_CSS}</style></head>
<body>
  <div class="bse-cover">
    <div class="bse-cover-card">
      <p class="bse-cover-kicker">${language === "ar" ? "استراتيجية البراند" : "Brand Strategy"}</p>
      <h1 class="bse-cover-title"><span class="bse-hl">${esc(projectName)}</span></h1>
      <p class="bse-cover-client">${esc(clientName)}</p>
      <p class="bse-cover-foot">${esc(date)}</p>
    </div>
  </div>
  ${sectionsHtml}
</body>
</html>`;
}
