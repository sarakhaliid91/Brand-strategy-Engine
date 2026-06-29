import { SectionType } from "./types";
import {
  PurposeContent,
  VisionContent,
  MissionContent,
  ValuesContent,
  AudiencePersonaContent,
  PositioningStrategyContent,
  BrandPersonaContent,
  CoreMessageContent,
} from "./content-types";

const bullets = (label: string, items: string[]) =>
  items.length ? `${label}:\n${items.map((i) => `- ${i}`).join("\n")}` : "";

function formatPurpose(c: PurposeContent): string {
  return [
    "BRAND PURPOSE",
    bullets("Who we help", c.whoWeHelp),
    bullets("What we help them with", c.whatWeHelpThemWith),
    bullets("Desired emotion", c.desiredEmotion),
    bullets("Biggest impact", c.biggestImpact ? [c.biggestImpact] : []),
    c.statement ? `Purpose statement: ${c.statement}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatVision(c: VisionContent): string {
  return [
    "BRAND VISION",
    bullets("Customers (5-10yr aspiration)", c.customers),
    bullets("Achievements", c.achievements),
    bullets("Industry", c.industry),
    bullets("Environment", c.environment),
    bullets("World", c.world),
    c.statement ? `Vision statement: ${c.statement}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatMission(c: MissionContent): string {
  return [
    "BRAND MISSION",
    bullets("Ongoing commitments", c.ongoingCommitments),
    c.statement ? `Mission statement: ${c.statement}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatValues(c: ValuesContent): string {
  const groups = c.groupPerceptions
    .map(
      (g) =>
        `${g.group}: ${g.comments.join("; ")} (values: ${g.relatedValues.join(", ")})`,
    )
    .join("\n");
  return [
    "BRAND VALUES",
    groups ? `Stakeholder perceptions:\n${groups}` : "",
    bullets("Shortlist", c.shortlist),
    c.coreValues.length
      ? `Core values:\n${c.coreValues.map((v) => `- ${v.value}: ${v.actionSentence}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatAudiencePersona(c: AudiencePersonaContent): string {
  const topArchetypes = c.archetypeMix
    .filter((a) => a.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((a) => `${a.archetype} (${a.weight})`)
    .join(", ");
  return [
    `AUDIENCE PERSONA: ${c.personaName || "Unnamed"}`,
    `Demographics: ${Object.values(c.demographics).filter(Boolean).join(", ")}`,
    `Psychographics: ${Object.values(c.psychographics).filter(Boolean).join(", ")}`,
    `Personality: ${Object.values(c.personality).filter(Boolean).join(", ")}`,
    bullets("Challenges", c.circumstances.challenges),
    bullets("Desires", c.circumstances.desires),
    bullets("Fears", c.circumstances.fears),
    topArchetypes ? `Archetype mix: ${topArchetypes}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatPositioning(c: PositioningStrategyContent): string {
  return [
    "POSITIONING STRATEGY",
    bullets("Unmet needs", c.unmetNeeds),
    bullets("Opportunities", c.opportunities),
    c.differentiators.length
      ? `Differentiators:\n${c.differentiators
          .map(
            (d) =>
              `- ${d.idea}${d.addedValue ? ` — ${d.addedValue}` : ""}${d.rating ? ` (rating ${d.rating})` : ""}`,
          )
          .join("\n")}`
      : "",
    c.statement ? `Positioning / USP:\n${c.statement}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatBrandPersona(c: BrandPersonaContent): string {
  const topRoles = c.archetypeRoleMix
    .filter((a) => a.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((a) => `${a.archetype} (${a.weight})`)
    .join(", ");
  return [
    "BRAND PERSONA",
    topRoles ? `Brand archetype mix: ${topRoles}` : "",
    c.personalityCharacteristics
      ? `Personality: ${c.personalityCharacteristics}`
      : "",
    c.toneOfVoice ? `Tone of voice: ${c.toneOfVoice}` : "",
    c.statement ? `Persona summary:\n${c.statement}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatCoreMessage(c: CoreMessageContent): string {
  return ["CORE MESSAGE", c.statement || "(no draft yet)"]
    .filter(Boolean)
    .join("\n\n");
}

const FORMATTERS: Record<SectionType, (content: unknown) => string> = {
  purpose: (c) => formatPurpose(c as PurposeContent),
  vision: (c) => formatVision(c as VisionContent),
  mission: (c) => formatMission(c as MissionContent),
  values: (c) => formatValues(c as ValuesContent),
  audience_persona: (c) => formatAudiencePersona(c as AudiencePersonaContent),
  competitor_audit: (c) => {
    const statement =
      c && typeof c === "object" && "statement" in c
        ? String((c as { statement?: string }).statement ?? "")
        : "";
    return statement ? `COMPETITOR AUDIT\n\n${statement}` : "COMPETITOR AUDIT";
  },
  positioning_strategy: (c) => formatPositioning(c as PositioningStrategyContent),
  brand_persona: (c) => formatBrandPersona(c as BrandPersonaContent),
  core_message: (c) => formatCoreMessage(c as CoreMessageContent),
  brand_story: (c) => JSON.stringify(c),
};

export function formatApprovedContent(
  sectionType: SectionType,
  content: unknown,
): string {
  return FORMATTERS[sectionType](content);
}
