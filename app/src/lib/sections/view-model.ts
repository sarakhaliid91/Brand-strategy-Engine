import { SectionType } from "./types";
import { AudiencePersonaContent, ValuesContent } from "./content-types";

/**
 * A presentation-neutral view of a section's content. Both the on-screen
 * review page (React) and the PDF print builder (HTML string) render from
 * this, so they stay consistent without sharing JSX.
 */
export type ViewBlock =
  | { kind: "name"; text: string }
  | { kind: "para"; text: string }
  | { kind: "labelled"; label: string; text: string }
  | { kind: "list"; items: { name: string; detail?: string }[] };

function getStatement(content: unknown): string {
  if (content && typeof content === "object" && "statement" in content) {
    return String((content as { statement?: string }).statement ?? "").trim();
  }
  return "";
}

function proseBlocks(text: string): ViewBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((para): ViewBlock => {
      const m = para.match(/^([A-Z][A-Z0-9 '&\/()-]{2,}):\s*([\s\S]*)$/);
      if (m) return { kind: "labelled", label: m[1], text: m[2] };
      return { kind: "para", text: para };
    });
}

function valuesBlocks(content: ValuesContent): ViewBlock[] {
  const statement = getStatement(content);
  const lines = statement
    ? statement.split("\n").map((l) => l.trim()).filter(Boolean)
    : content.coreValues.map((v) => `${v.value}: ${v.actionSentence}`);
  const items = lines.map((line) => {
    const [name, ...rest] = line.split(":");
    return { name: name.trim(), detail: rest.join(":").trim() || undefined };
  });
  return [{ kind: "list", items }];
}

function personaBlocks(content: AudiencePersonaContent): ViewBlock[] {
  const blocks: ViewBlock[] = [];
  if (content.personaName) blocks.push({ kind: "name", text: content.personaName });

  const add = (label: string, text: string) => {
    if (text) blocks.push({ kind: "labelled", label, text });
  };
  add("Demographics", Object.values(content.demographics).filter(Boolean).join(" · "));
  add("Psychographics", Object.values(content.psychographics).filter(Boolean).join(" · "));
  add("Personality", Object.values(content.personality).filter(Boolean).join(" · "));
  add("Challenges", content.circumstances.challenges.join("; "));
  add("Desires", content.circumstances.desires.join("; "));
  add("Fears", content.circumstances.fears.join("; "));
  add(
    "Archetype mix",
    content.archetypeMix
      .filter((a) => a.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .map((a) => `${a.archetype} (${a.weight})`)
      .join(", "),
  );
  return blocks;
}

export function sectionViewModel(
  type: SectionType,
  content: unknown,
): ViewBlock[] {
  if (type === "audience_persona") {
    return personaBlocks(content as AudiencePersonaContent);
  }
  if (type === "values") {
    return valuesBlocks(content as ValuesContent);
  }
  const statement = getStatement(content);
  if (!statement) return [{ kind: "para", text: "No content." }];
  return proseBlocks(statement);
}
