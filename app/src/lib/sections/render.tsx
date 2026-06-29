import { SectionType } from "./types";
import { sectionViewModel } from "./view-model";

/**
 * Renders a section's approved content as display HTML for the on-screen
 * review page, from the shared section view-model. The PDF print builder
 * renders the same view-model to an HTML string (see lib/export/print-html).
 */
export function SectionContentView({
  type,
  content,
}: {
  type: SectionType;
  content: unknown;
}) {
  const blocks = sectionViewModel(type, content);
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "name":
            return (
              <p key={i} className="bse-para bse-persona-name">
                {block.text}
              </p>
            );
          case "labelled":
            return (
              <div key={i} className="bse-block">
                <h4 className="bse-block-heading">{block.label}</h4>
                <p className="bse-para">{block.text}</p>
              </div>
            );
          case "list":
            return (
              <ul key={i} className="bse-values">
                {block.items.map((item, j) => (
                  <li key={j} className="bse-value">
                    <span className="bse-value-name">{item.name}</span>
                    {item.detail ? (
                      <span className="bse-value-sentence"> — {item.detail}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={i} className="bse-para">
                {block.text}
              </p>
            );
        }
      })}
    </>
  );
}
