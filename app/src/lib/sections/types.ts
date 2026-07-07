export const SECTION_TYPES = [
  "purpose",
  "vision",
  "mission",
  "values",
  "audience_persona",
  "competitor_audit",
  "positioning_strategy",
  "brand_persona",
  "core_message",
  "brand_story",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export type SectionMode = "manual" | "ai_drafted" | "ai_research";

export type SectionStatus = "not_started" | "draft" | "in_review" | "approved";

export interface SectionDefinition {
  type: SectionType;
  displayName: string;
  displayNameAr: string;
  mode: SectionMode;
  order: number;
  /** Other section types whose approved content feeds this section's AI prompt. */
  requiredContext: SectionType[];
  /** Short description shown in the wizard stepper. */
  summary: string;
  summaryAr: string;
}

/** Localized display name/summary for a section definition. */
export function localizedSection(
  def: SectionDefinition,
  locale: "en" | "ar",
): { name: string; summary: string } {
  return locale === "ar"
    ? { name: def.displayNameAr, summary: def.summaryAr }
    : { name: def.displayName, summary: def.summary };
}
