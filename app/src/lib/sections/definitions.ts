import { SectionDefinition, SectionType } from "./types";

/**
 * The wizard's section order and dependency chain, modeled directly on the
 * strategist's real framework files (Brand Substance, Audience Persona,
 * Competitor Audit, Positioning Strategy, Brand Persona, Core Message,
 * Brand Story Framework). Each entry's `requiredContext` lists the section
 * types whose *approved* content must exist before this section's AI draft
 * can be generated.
 */
export const SECTION_DEFINITIONS: Record<SectionType, SectionDefinition> = {
  purpose: {
    type: "purpose",
    displayName: "Brand Purpose",
    displayNameAr: "هدف البراند",
    mode: "ai_drafted",
    order: 1,
    requiredContext: [],
    summary:
      "Who we help, what we help them with, and the impact chain that leads to the brand purpose statement.",
  },
  vision: {
    type: "vision",
    displayName: "Brand Vision",
    displayNameAr: "رؤية البراند",
    mode: "ai_drafted",
    order: 2,
    requiredContext: ["purpose"],
    summary:
      "5-10 year impact aspirations across customers, achievements, industry, environment and world, composed into a vision statement.",
  },
  mission: {
    type: "mission",
    displayName: "Brand Mission",
    displayNameAr: "مهمة البراند",
    mode: "ai_drafted",
    order: 3,
    requiredContext: ["purpose", "vision"],
    summary: "Ongoing commitments composed into a mission statement.",
  },
  values: {
    type: "values",
    displayName: "Brand Values",
    displayNameAr: "قيم البراند",
    mode: "ai_drafted",
    order: 4,
    requiredContext: ["purpose", "vision", "mission"],
    summary:
      "Stakeholder perception notes refined into a values shortlist and core brand values with descriptions.",
  },
  audience_persona: {
    type: "audience_persona",
    displayName: "Audience Persona",
    displayNameAr: "شخصية الجمهور",
    mode: "manual",
    order: 5,
    requiredContext: ["purpose", "values"],
    summary:
      "Demographics, psychographics, personality, circumstances (challenges/desires/fears) and archetype mix for the target audience.",
  },
  competitor_audit: {
    type: "competitor_audit",
    displayName: "Competitor Audit",
    displayNameAr: "تحليل المنافسين",
    mode: "ai_research",
    order: 6,
    requiredContext: ["purpose"],
    summary:
      "Per-competitor research scored across positioning, message, personality, identity, presence and core offer.",
  },
  positioning_strategy: {
    type: "positioning_strategy",
    displayName: "Positioning Strategy",
    displayNameAr: "استراتيجية التموضع",
    mode: "ai_drafted",
    order: 7,
    requiredContext: [
      "purpose",
      "vision",
      "mission",
      "values",
      "audience_persona",
      "competitor_audit",
    ],
    summary:
      "Gaps & opportunities, differentiator shortlist, USP and a positioning statement.",
  },
  brand_persona: {
    type: "brand_persona",
    displayName: "Brand Persona",
    displayNameAr: "شخصية البراند",
    mode: "ai_drafted",
    order: 8,
    requiredContext: ["audience_persona", "values", "positioning_strategy"],
    summary:
      "Brand archetype mix, personality/appearance/tone-of-voice, and brand interview answers.",
  },
  core_message: {
    type: "core_message",
    displayName: "Core Message",
    displayNameAr: "الرسالة الأساسية",
    mode: "ai_drafted",
    order: 9,
    requiredContext: [
      "purpose",
      "vision",
      "mission",
      "values",
      "audience_persona",
      "positioning_strategy",
      "brand_persona",
    ],
    summary:
      "StoryBrand-style message map: audience, pain points, key benefit, competitive alternative, differentiator.",
  },
  brand_story: {
    type: "brand_story",
    displayName: "Brand Story",
    displayNameAr: "قصة البراند",
    mode: "ai_drafted",
    order: 10,
    requiredContext: [
      "purpose",
      "vision",
      "mission",
      "values",
      "audience_persona",
      "positioning_strategy",
      "brand_persona",
      "core_message",
    ],
    summary:
      "Seven-chapter hero's journey narrative: Existing World, Obstacle, Call to Action, Meeting the Guide, Challenge, Transformation, New World.",
  },
};

export const ORDERED_SECTION_TYPES: SectionType[] = Object.values(
  SECTION_DEFINITIONS,
)
  .sort((a, b) => a.order - b.order)
  .map((d) => d.type);
