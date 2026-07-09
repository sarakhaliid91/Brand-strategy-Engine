import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sections as sectionsTable } from "@/lib/db/schema";
import {
  getProjectOwnedByUser,
  getSectionWithCurrentVersion,
  isGenerateUnlocked,
  getRecentAIVersions,
  getCompetitorEntries,
} from "@/lib/sections/queries";
import {
  SECTION_TYPES,
  SectionType,
  localizedSection,
} from "@/lib/sections/types";
import {
  SECTION_DEFINITIONS,
  ORDERED_SECTION_TYPES,
} from "@/lib/sections/definitions";
import { getAvailableProviders } from "@/lib/ai/client";
import { AIProvider, PROVIDER_LABELS } from "@/lib/ai/providers/types";
import {
  saveSectionAction,
  approveSectionAction,
  generateSectionAction,
  selectVersionAction,
  editStatementAction,
  addCompetitorAction,
  researchCompetitorAction,
  deleteCompetitorAction,
  synthesizeCompetitorsAction,
} from "./actions";
import { CompetitorResearchResult } from "@/lib/sections/content-types";
import {
  PurposeContent,
  VisionContent,
  MissionContent,
  ValuesContent,
  AudiencePersonaContent,
  PositioningStrategyContent,
  BrandPersonaContent,
  CoreMessageContent,
  BrandStoryContent,
  emptyPurposeContent,
  emptyVisionContent,
  emptyMissionContent,
  emptyValuesContent,
  emptyAudiencePersonaContent,
  emptyPositioningStrategyContent,
  emptyBrandPersonaContent,
  emptyCoreMessageContent,
  emptyBrandStoryContent,
  BRAND_ARCHETYPES,
  BRAND_INTERVIEW_QUESTIONS,
} from "@/lib/sections/content-types";
import { AppHeader, StatusChip, ui } from "@/app/ui";
import { CopyButton } from "@/app/client-ui";
import { getDict } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/dict";
import { fieldExamples } from "@/lib/i18n/examples";
import { isValidUuid } from "@/lib/db/uuid";

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// AI drafts are now long-form (up to ~8k output tokens for Core Message /
// Brand Story), so give the server actions on this page more time than the
// platform default before the function is killed.
export const maxDuration = 60;

type Fields = Dict["fields"];
type Ex = Record<string, string>;

function isSectionType(value: string): value is SectionType {
  return (SECTION_TYPES as readonly string[]).includes(value);
}

function ExampleHint({ text, exampleLabel }: { text?: string; exampleLabel: string }) {
  if (!text) return null;
  return (
    <p className="text-xs leading-relaxed text-ink-soft/70">
      <span className="font-semibold text-plum/70">{exampleLabel}</span>{" "}
      {text.split("\n").join(" · ")}
    </p>
  );
}

function Field({
  label,
  name,
  defaultValue,
  multiline = false,
  placeholder,
  example,
  exampleLabel = "e.g.",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  multiline?: boolean;
  placeholder?: string;
  example?: string;
  exampleLabel?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={ui.label}>{label}</span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          placeholder={placeholder}
          className={ui.input}
        />
      ) : (
        <input name={name} defaultValue={defaultValue} className={ui.input} />
      )}
      <ExampleHint text={example} exampleLabel={exampleLabel} />
    </label>
  );
}

function FieldGroup({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-card border border-line bg-ivory/50 p-4">
      <legend className="px-1.5 text-xs font-bold text-plum">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function PurposeForm({ content, f, ph, ex }: { content: PurposeContent; f: Fields; ph: string; ex: Ex }) {
  return (
    <>
      <Field label={f.whoWeHelp} name="whoWeHelp" defaultValue={content.whoWeHelp.join("\n")} multiline placeholder={ph} example={ex.whoWeHelp}
        />
      <Field label={f.whatWeHelpThemWith} name="whatWeHelpThemWith" defaultValue={content.whatWeHelpThemWith.join("\n")} multiline placeholder={ph} example={ex.whatWeHelpThemWith}
        />
      <Field label={f.desiredEmotion} name="desiredEmotion" defaultValue={content.desiredEmotion.join("\n")} multiline placeholder={ph} example={ex.desiredEmotion}
        />
      <Field label={f.emotionImpact} name="emotionImpact" defaultValue={content.emotionImpact.join("\n")} multiline placeholder={ph} example={ex.emotionImpact}
        />
      <Field label={f.knockOnEffect} name="knockOnEffect" defaultValue={content.knockOnEffect.join("\n")} multiline placeholder={ph} example={ex.knockOnEffect}
        />
      <Field label={f.practicalImpact} name="practicalImpact" defaultValue={content.practicalImpact.join("\n")} multiline placeholder={ph} example={ex.practicalImpact}
        />
      <Field label={f.biggestImpact} name="biggestImpact" defaultValue={content.biggestImpact} example={ex.biggestImpact}
        />
    </>
  );
}

function VisionForm({ content, f, ph, ex }: { content: VisionContent; f: Fields; ph: string; ex: Ex }) {
  return (
    <>
      <Field label={f.customers} name="customers" defaultValue={content.customers.join("\n")} multiline placeholder={ph} example={ex.customers}
        />
      <Field label={f.achievements} name="achievements" defaultValue={content.achievements.join("\n")} multiline placeholder={ph} example={ex.achievements}
        />
      <Field label={f.industry} name="industry" defaultValue={content.industry.join("\n")} multiline placeholder={ph} example={ex.industry}
        />
      <Field label={f.environment} name="environment" defaultValue={content.environment.join("\n")} multiline placeholder={ph} example={ex.environment}
        />
      <Field label={f.world} name="world" defaultValue={content.world.join("\n")} multiline placeholder={ph} example={ex.world}
        />
    </>
  );
}

function MissionForm({ content, f, ph, ex }: { content: MissionContent; f: Fields; ph: string; ex: Ex }) {
  return (
    <Field label={f.ongoingCommitments} name="ongoingCommitments" defaultValue={content.ongoingCommitments.join("\n")} multiline placeholder={ph} example={ex.ongoingCommitments}
        />
  );
}

function ValuesForm({ content, f, ph, ex }: { content: ValuesContent; f: Fields; ph: string; ex: Ex }) {
  const byGroup = (group: string) =>
    content.groupPerceptions.find((g) => g.group === group);
  const groupLabels: Record<string, string> = {
    customers: f.group_customers,
    suppliers: f.group_suppliers,
    general_public: f.group_general_public,
  };
  return (
    <>
      {["customers", "suppliers", "general_public"].map((group) => (
        <FieldGroup key={group} legend={groupLabels[group]}>
          <div className="flex flex-col gap-2">
            <Field
              label={f.groupComments}
              name={`group_${group}_comments`}
              defaultValue={byGroup(group)?.comments.join("\n")}
              multiline
              placeholder={ph}
              example={ex[`group_${group}_comments`]}
            />
            <Field
              label={f.groupRelatedValues}
              name={`group_${group}_relatedValues`}
              defaultValue={byGroup(group)?.relatedValues.join("\n")}
              multiline
              placeholder={ph}
              example={ex[`group_${group}_relatedValues`]}
            />
          </div>
        </FieldGroup>
      ))}
      <Field label={f.shortlist} name="shortlist" defaultValue={content.shortlist.join("\n")} multiline placeholder={ph} example={ex.shortlist}
        />
      <Field
        label={f.coreValueNames}
        name="coreValueNames"
        defaultValue={content.coreValues.map((v) => v.value).join("\n")}
        multiline
        placeholder={ph}
      />
      <Field
        label={f.coreValueSentences}
        name="coreValueSentences"
        defaultValue={content.coreValues.map((v) => v.actionSentence).join("\n")}
        multiline
        placeholder={ph}
      />
    </>
  );
}

function AudiencePersonaForm({
  content,
  f,
  ph,
  ex,
  archetypes,
}: {
  content: AudiencePersonaContent;
  f: Fields;
  ph: string;
  ex: Ex;
  archetypes: Record<string, string>;
}) {
  return (
    <>
      <Field label={f.personaName} name="personaName" defaultValue={content.personaName} example={ex.personaName}
        />
      <FieldGroup legend={f.demographics}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label={f.age} name="age" defaultValue={content.demographics.age} example={ex.age}
        />
          <Field label={f.gender} name="gender" defaultValue={content.demographics.gender} example={ex.gender}
        />
          <Field label={f.occupation} name="occupation" defaultValue={content.demographics.occupation} example={ex.occupation}
        />
          <Field label={f.professionalResponsibilities} name="professionalResponsibilities" defaultValue={content.demographics.professionalResponsibilities} example={ex.professionalResponsibilities}
        />
          <Field label={f.education} name="education" defaultValue={content.demographics.education} example={ex.education}
        />
          <Field label={f.location} name="location" defaultValue={content.demographics.location} example={ex.location}
        />
          <Field label={f.personalIncome} name="personalIncome" defaultValue={content.demographics.personalIncome} example={ex.personalIncome}
        />
          <Field label={f.householdIncome} name="householdIncome" defaultValue={content.demographics.householdIncome} example={ex.householdIncome}
        />
          <Field label={f.maritalStatus} name="maritalStatus" defaultValue={content.demographics.maritalStatus} example={ex.maritalStatus}
        />
          <Field label={f.familyStatus} name="familyStatus" defaultValue={content.demographics.familyStatus} example={ex.familyStatus}
        />
          <Field label={f.homeownerStatus} name="homeownerStatus" defaultValue={content.demographics.homeownerStatus} example={ex.homeownerStatus}
        />
        </div>
      </FieldGroup>
      <FieldGroup legend={f.psychographics}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label={f.hobbiesInterests} name="hobbiesInterests" defaultValue={content.psychographics.hobbiesInterests} example={ex.hobbiesInterests}
        />
          <Field label={f.sports} name="sports" defaultValue={content.psychographics.sports} example={ex.sports}
        />
          <Field label={f.music} name="music" defaultValue={content.psychographics.music} example={ex.music}
        />
          <Field label={f.restaurantPreference} name="restaurantPreference" defaultValue={content.psychographics.restaurantPreference} example={ex.restaurantPreference}
        />
          <Field label={f.weekendPleasures} name="weekendPleasures" defaultValue={content.psychographics.weekendPleasures} example={ex.weekendPleasures}
        />
          <Field label={f.entertainment} name="entertainment" defaultValue={content.psychographics.entertainment} example={ex.entertainment}
        />
          <Field label={f.likesToWear} name="likesToWear" defaultValue={content.psychographics.likesToWear} example={ex.likesToWear}
        />
          <Field label={f.likesToTalkAbout} name="likesToTalkAbout" defaultValue={content.psychographics.likesToTalkAbout} example={ex.likesToTalkAbout}
        />
          <Field label={f.groupsAndForums} name="groupsAndForums" defaultValue={content.psychographics.groupsAndForums} example={ex.groupsAndForums}
        />
          <Field label={f.favouriteApps} name="favouriteApps" defaultValue={content.psychographics.favouriteApps} example={ex.favouriteApps}
        />
        </div>
      </FieldGroup>
      <FieldGroup legend={f.personality}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label={f.behaviouralCharacteristics} name="behaviouralCharacteristics" defaultValue={content.personality.behaviouralCharacteristics} example={ex.behaviouralCharacteristics}
        />
          <Field label={f.mostPassionateAbout} name="mostPassionateAbout" defaultValue={content.personality.mostPassionateAbout} example={ex.mostPassionateAbout}
        />
          <Field label={f.obligationsTheyHate} name="obligationsTheyHate" defaultValue={content.personality.obligationsTheyHate} example={ex.obligationsTheyHate}
        />
          <Field label={f.biggestPersonalGoal} name="biggestPersonalGoal" defaultValue={content.personality.biggestPersonalGoal} example={ex.biggestPersonalGoal}
        />
          <Field label={f.biggestProfessionalGoal} name="biggestProfessionalGoal" defaultValue={content.personality.biggestProfessionalGoal} example={ex.biggestProfessionalGoal}
        />
          <Field label={f.personalityCoreValues} name="personalityCoreValues" defaultValue={content.personality.coreValues} example={ex.personalityCoreValues}
        />
          <Field label={f.coreFears} name="coreFears" defaultValue={content.personality.coreFears} example={ex.coreFears}
        />
          <Field label={f.coreDesire} name="coreDesire" defaultValue={content.personality.coreDesire} example={ex.coreDesire}
        />
        </div>
      </FieldGroup>
      <Field label={f.challenges} name="challenges" defaultValue={content.circumstances.challenges.join("\n")} multiline placeholder={ph} example={ex.challenges}
        />
      <Field label={f.desires} name="desires" defaultValue={content.circumstances.desires.join("\n")} multiline placeholder={ph} example={ex.desires}
        />
      <Field label={f.fears} name="fears" defaultValue={content.circumstances.fears.join("\n")} multiline placeholder={ph} example={ex.fears}
        />
      <FieldGroup legend={f.archetypeMix}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BRAND_ARCHETYPES.map((archetype) => {
            const existing = content.archetypeMix.find((a) => a.archetype === archetype);
            return (
              <Field
                key={archetype}
                label={archetypes[archetype] ?? archetype}
                name={`archetype_${archetype}`}
                defaultValue={String(existing?.weight ?? 0)}
              />
            );
          })}
        </div>
      </FieldGroup>
    </>
  );
}

function PositioningStrategyForm({
  content,
  f,
  ph,
  ex,
}: {
  content: PositioningStrategyContent;
  f: Fields;
  ph: string;
  ex: Ex;
}) {
  return (
    <>
      <Field label={f.unmetNeeds} name="unmetNeeds" defaultValue={content.unmetNeeds.join("\n")} multiline placeholder={ph} example={ex.unmetNeeds}
        />
      <Field label={f.opportunities} name="opportunities" defaultValue={content.opportunities.join("\n")} multiline placeholder={ph} example={ex.opportunities}
        />
      <Field label={f.ideas} name="ideas" defaultValue={content.ideas.join("\n")} multiline placeholder={ph} example={ex.ideas}
        />
      <FieldGroup legend={f.differentiators}>
        <div className="flex flex-col gap-2">
          <Field label={f.ideas} name="differentiatorIdeas" defaultValue={content.differentiators.map((d) => d.idea).join("\n")} multiline placeholder={ph} example={ex.differentiatorIdeas} />
          <Field label={f.differentiatorAddedValues} name="differentiatorAddedValues" defaultValue={content.differentiators.map((d) => d.addedValue).join("\n")} multiline placeholder={ph} example={ex.differentiatorAddedValues} />
          <Field label={f.differentiatorEnhances} name="differentiatorEnhances" defaultValue={content.differentiators.map((d) => d.enhancesExperience).join("\n")} multiline placeholder={ph} example={ex.differentiatorEnhances} />
          <Field label={f.differentiatorRatings} name="differentiatorRatings" defaultValue={content.differentiators.map((d) => d.rating).join("\n")} multiline placeholder={ph} example={ex.differentiatorRatings} />
        </div>
      </FieldGroup>
      <FieldGroup legend={f.uspInputs}>
        <div className="flex flex-col gap-2">
          <Field label={f.uspEndResult} name="uspEndResult" defaultValue={content.uspEndResult} example={ex.uspEndResult}
        />
          <Field label={f.uspBenefit} name="uspBenefit" defaultValue={content.uspBenefit} example={ex.uspBenefit}
        />
        </div>
      </FieldGroup>
      <FieldGroup legend={f.posInputs}>
        <div className="flex flex-col gap-2">
          <Field label={f.posWeHelp} name="posWeHelp" defaultValue={content.posWeHelp} example={ex.posWeHelp}
        />
          <Field label={f.posWho} name="posWho" defaultValue={content.posWho} example={ex.posWho}
        />
          <Field label={f.posToAchieve} name="posToAchieve" defaultValue={content.posToAchieve} example={ex.posToAchieve}
        />
          <Field label={f.posUnlike} name="posUnlike" defaultValue={content.posUnlike} example={ex.posUnlike}
        />
          <Field label={f.posOurSolution} name="posOurSolution" defaultValue={content.posOurSolution} example={ex.posOurSolution}
        />
        </div>
      </FieldGroup>
    </>
  );
}

function BrandPersonaForm({
  content,
  f,
  ph,
  ex,
  archetypes,
  interview,
}: {
  content: BrandPersonaContent;
  f: Fields;
  ph: string;
  ex: Ex;
  archetypes: Record<string, string>;
  interview: Record<string, string>;
}) {
  return (
    <>
      <FieldGroup legend={f.archetypeRoleMix}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BRAND_ARCHETYPES.map((archetype) => {
            const existing = content.archetypeRoleMix.find((a) => a.archetype === archetype);
            return (
              <Field
                key={archetype}
                label={archetypes[archetype] ?? archetype}
                name={`role_${archetype}`}
                defaultValue={String(existing?.weight ?? 0)}
              />
            );
          })}
        </div>
      </FieldGroup>
      <FieldGroup legend={f.personaPersonality}>
        <div className="flex flex-col gap-2">
          <Field label={f.personalityCharacteristics} name="personalityCharacteristics" defaultValue={content.personalityCharacteristics} example={ex.personalityCharacteristics}
        />
          <Field label={f.personalityDesires} name="personalityDesires" defaultValue={content.personalityDesires} example={ex.personalityDesires}
        />
          <Field label={f.personalityFears} name="personalityFears" defaultValue={content.personalityFears} example={ex.personalityFears}
        />
        </div>
      </FieldGroup>
      <FieldGroup legend={f.appearance}>
        <div className="flex flex-col gap-2">
          <Field label={f.appearanceCharacteristics} name="appearanceCharacteristics" defaultValue={content.appearanceCharacteristics} example={ex.appearanceCharacteristics}
        />
          <Field label={f.dressStyle} name="dressStyle" defaultValue={content.dressStyle} example={ex.dressStyle}
        />
          <Field label={f.accessories} name="accessories" defaultValue={content.accessories} example={ex.accessories}
        />
        </div>
      </FieldGroup>
      <Field label={f.toneOfVoice} name="toneOfVoice" defaultValue={content.toneOfVoice} multiline placeholder={ph} example={ex.toneOfVoice}
        />
      <Field label={f.languageKeywords} name="languageKeywords" defaultValue={content.languageKeywords} multiline placeholder={ph} example={ex.languageKeywords}
        />
      <FieldGroup legend={f.brandInterview}>
        <div className="flex flex-col gap-2">
          {BRAND_INTERVIEW_QUESTIONS.map((question, i) => {
            const existing = content.interview.find((q) => q.question === question);
            return (
              <Field
                key={i}
                label={interview[question] ?? question}
                name={`interview_${i}`}
                defaultValue={existing?.answer ?? ""}
                multiline
                placeholder={ph}
                example={ex[question]}
              />
            );
          })}
        </div>
      </FieldGroup>
    </>
  );
}

function CoreMessageForm({ content, f, ph, ex }: { content: CoreMessageContent; f: Fields; ph: string; ex: Ex }) {
  return (
    <Field
      label={f.guidance}
      name="guidance"
      defaultValue={content.guidance}
      multiline
      placeholder={ph}
    example={ex.guidance}
        />
  );
}

function BrandStoryForm({ content, f, ph, ex }: { content: BrandStoryContent; f: Fields; ph: string; ex: Ex }) {
  return (
    <>
      <Field label={f.characterName} name="characterName" defaultValue={content.characterName} example={ex.characterName}
        />
      <Field
        label={f.storyGuidance}
        name="guidance"
        defaultValue={content.guidance}
        multiline
        placeholder={ph}
      example={ex.guidance}
        />
    </>
  );
}

type CompetitorEntry = {
  id: string;
  competitorName: string;
  competitorUrl: string | null;
  researchResult: unknown;
};

function CompetitorAuditPanel({
  projectId,
  entries,
  hasAnyResearch,
  s,
}: {
  projectId: string;
  entries: CompetitorEntry[];
  hasAnyResearch: boolean;
  s: Dict["section"];
}) {
  return (
    <div className="flex flex-col gap-4">
      <form
        action={addCompetitorAction.bind(null, projectId)}
        className={`${ui.card} flex flex-wrap gap-2 p-4`}
      >
        <input
          name="name"
          placeholder={s.competitorName}
          required
          className={`${ui.input} min-w-40 flex-1`}
        />
        <input
          name="url"
          placeholder={s.competitorUrl}
          className={`${ui.input} min-w-40 flex-1`}
        />
        <button type="submit" className={ui.btnPrimary}>
          {s.addCompetitor}
        </button>
      </form>

      {entries.length === 0 ? (
        <div className="rounded-card bg-ivory-dark px-6 py-8 text-center text-sm font-semibold text-plum">
          {s.competitorsEmpty}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => {
            const result = entry.researchResult as CompetitorResearchResult | null;
            return (
              <li key={entry.id} className={`${ui.card} p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-ink">
                      {entry.competitorName}
                    </p>
                    {entry.competitorUrl && (
                      <p className="text-xs text-ink-soft" dir="ltr">
                        {entry.competitorUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form
                      action={researchCompetitorAction.bind(null, projectId, entry.id)}
                    >
                      <button type="submit" className={ui.btnSoft}>
                        {result ? s.reResearch : s.research}
                      </button>
                    </form>
                    <form
                      action={deleteCompetitorAction.bind(null, projectId, entry.id)}
                    >
                      <button
                        type="submit"
                        className="rounded-full px-3 py-2 text-xs font-semibold text-ink-soft transition hover:bg-peach-soft hover:text-ink"
                      >
                        {s.remove}
                      </button>
                    </form>
                  </div>
                </div>

                {result && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-xs text-ink/80">
                    {result.positioning && (
                      <p>
                        <span className="font-bold text-plum">{s.positioning}:</span>{" "}
                        {result.positioning}
                      </p>
                    )}
                    {result.strengths?.length > 0 && (
                      <p>
                        <span className="font-bold text-plum">{s.strengths}:</span>{" "}
                        {result.strengths.join("; ")}
                      </p>
                    )}
                    {result.weaknesses?.length > 0 && (
                      <p>
                        <span className="font-bold text-plum">{s.weaknesses}:</span>{" "}
                        {result.weaknesses.join("; ")}
                      </p>
                    )}
                    {result.toneDescriptors?.length > 0 && (
                      <p>
                        <span className="font-bold text-plum">{s.tone}:</span>{" "}
                        {result.toneDescriptors.join(", ")}
                      </p>
                    )}
                    {result.sources?.length > 0 && (
                      <p className="text-ink-soft" dir="ltr">
                        {s.sources}: {result.sources.join(", ")}
                      </p>
                    )}

                    {result.dimensions && (
                      <div className="mt-2 border-t border-line pt-3">
                        <p className="mb-2 font-bold text-plum">
                          {s.dimensionsHeading}
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(Object.keys(result.dimensions) as (keyof typeof result.dimensions)[]).map(
                            (key) => {
                              const dim = result.dimensions![key];
                              return (
                                <div
                                  key={key}
                                  className="rounded-card bg-ivory px-3 py-2"
                                >
                                  <div className="mb-1 flex items-center justify-between gap-2">
                                    <span className="font-semibold text-ink">
                                      {s[`dimension_${key}` as keyof typeof s] as string}
                                    </span>
                                    <span className="shrink-0 rounded-full bg-plum px-2 py-0.5 text-[10px] font-bold text-cream">
                                      {dim.score}/10
                                    </span>
                                  </div>
                                  <p className="text-ink-soft">{dim.summary}</p>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form action={synthesizeCompetitorsAction.bind(null, projectId)}>
        <button
          type="submit"
          disabled={!hasAnyResearch}
          title={hasAnyResearch ? undefined : s.researchFirst}
          className={ui.btnDark}
        >
          {s.synthesize}
        </button>
      </form>
    </div>
  );
}

function SectionStepper({
  projectId,
  currentType,
  statusByType,
  locale,
}: {
  projectId: string;
  currentType: SectionType;
  statusByType: Map<SectionType, string>;
  locale: "en" | "ar";
}) {
  return (
    <nav aria-label="Sections" className="lg:sticky lg:top-6">
      <ol className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {ORDERED_SECTION_TYPES.map((type) => {
          const def = SECTION_DEFINITIONS[type];
          const loc = localizedSection(def, locale);
          const status = statusByType.get(type) ?? "not_started";
          const isCurrent = type === currentType;
          const dot =
            status === "approved"
              ? "bg-plum"
              : status === "not_started"
                ? "border border-line bg-transparent"
                : "bg-peach-soft";
          return (
            <li key={type} className="shrink-0">
              <Link
                href={`/projects/${projectId}/${type}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold transition lg:rounded-xl ${
                  isCurrent
                    ? "bg-ink text-cream"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
                <span className="whitespace-nowrap">
                  {def.order}. {loc.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default async function SectionWizardPage({
  params,
}: {
  params: Promise<{ id: string; type: string }>;
}) {
  const { id: projectId, type } = await params;
  if (!isSectionType(type)) notFound();
  if (!isValidUuid(projectId)) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getProjectOwnedByUser(projectId, session.user.id);
  if (!project) notFound();

  const { t, locale } = await getDict();
  const s = t.section;
  const f = t.fields;
  const ph = s.onePerLine;
  const ex = fieldExamples[locale];

  const def = SECTION_DEFINITIONS[type];
  const loc = localizedSection(def, locale);
  const result = await getSectionWithCurrentVersion(projectId, type);
  if (!result) notFound();
  const { section, currentVersion } = result;

  const allSections = await db
    .select()
    .from(sectionsTable)
    .where(eq(sectionsTable.projectId, projectId));
  const statusByType = new Map(
    allSections.map((s) => [s.sectionType as SectionType, s.status]),
  );

  const unlocked = await isGenerateUnlocked(projectId, type);
  const missing = def.requiredContext.filter(
    (rc) => rc !== type && statusByType.get(rc) !== "approved",
  );
  const missingNames = missing
    .map((m) => localizedSection(SECTION_DEFINITIONS[m], locale).name)
    .join(locale === "ar" ? "، " : ", ");

  const rawContent = currentVersion?.content as unknown;

  let formBody: React.ReactNode;
  switch (type) {
    case "purpose":
      formBody = <PurposeForm content={(rawContent as PurposeContent) ?? emptyPurposeContent()} f={f} ph={ph} ex={ex} />;
      break;
    case "vision":
      formBody = <VisionForm content={(rawContent as VisionContent) ?? emptyVisionContent()} f={f} ph={ph} ex={ex} />;
      break;
    case "mission":
      formBody = <MissionForm content={(rawContent as MissionContent) ?? emptyMissionContent()} f={f} ph={ph} ex={ex} />;
      break;
    case "values":
      formBody = <ValuesForm content={(rawContent as ValuesContent) ?? emptyValuesContent()} f={f} ph={ph} ex={ex} />;
      break;
    case "audience_persona":
      formBody = (
        <AudiencePersonaForm
          content={(rawContent as AudiencePersonaContent) ?? emptyAudiencePersonaContent()}
          f={f}
          ph={ph}
          ex={ex}
          archetypes={t.archetypes}
        />
      );
      break;
    case "positioning_strategy":
      formBody = (
        <PositioningStrategyForm
          content={(rawContent as PositioningStrategyContent) ?? emptyPositioningStrategyContent()}
          f={f}
          ph={ph}
          ex={ex}
        />
      );
      break;
    case "brand_persona":
      formBody = (
        <BrandPersonaForm
          content={(rawContent as BrandPersonaContent) ?? emptyBrandPersonaContent()}
          f={f}
          ph={ph}
          ex={ex}
          archetypes={t.archetypes}
          interview={t.interview}
        />
      );
      break;
    case "core_message":
      formBody = (
        <CoreMessageForm
          content={(rawContent as CoreMessageContent) ?? emptyCoreMessageContent()}
          f={f}
          ph={ph}
          ex={ex}
        />
      );
      break;
    case "brand_story":
      formBody = (
        <BrandStoryForm
          content={(rawContent as BrandStoryContent) ?? emptyBrandStoryContent()}
          f={f}
          ph={ph}
          ex={ex}
        />
      );
      break;
    default:
      formBody = null;
  }

  const statement =
    rawContent && typeof rawContent === "object" && "statement" in rawContent
      ? String((rawContent as { statement?: string }).statement ?? "")
      : null;

  const isCompetitorAudit = type === "competitor_audit";
  const competitorEntries = isCompetitorAudit
    ? await getCompetitorEntries(projectId)
    : [];
  const hasAnyResearch = competitorEntries.some((e) => e.researchResult);

  const isAISection = def.mode !== "manual";
  const availableProviders: AIProvider[] = isAISection
    ? getAvailableProviders()
    : [];
  const recentAIVersions = isAISection
    ? await getRecentAIVersions(projectId, type, 4)
    : [];

  const contentDir = project.language === "ar" ? "rtl" : "ltr";

  function metaLabel(meta: unknown): string {
    if (meta && typeof meta === "object" && "provider" in meta) {
      const provider = (meta as { provider?: AIProvider }).provider;
      if (provider && provider in PROVIDER_LABELS) return PROVIDER_LABELS[provider];
    }
    return "AI";
  }

  function draftStatement(content: unknown): string {
    if (content && typeof content === "object" && "statement" in content) {
      return String((content as { statement?: string }).statement ?? "");
    }
    return "";
  }

  return (
    <div className="min-h-screen bg-ivory">
      <AppHeader backHref={`/projects/${projectId}`} backLabel={project.name}>
        <Link
          href={`/projects/${projectId}/review`}
          className="rounded-full px-3 py-1.5 text-sm text-cream/60 transition hover:bg-cream/10 hover:text-cream"
        >
          {t.project.reviewExport}
        </Link>
      </AppHeader>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 sm:px-8 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <SectionStepper
            projectId={projectId}
            currentType={type}
            statusByType={statusByType}
            locale={locale}
          />
        </aside>

        <main className="min-w-0 max-w-2xl flex-1">
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-black text-ink">
                {loc.name}
              </h1>
              <StatusChip status={section.status} />
            </div>
            <p className="text-sm text-ink-soft">{loc.summary}</p>
            {isAISection && !unlocked && missing.length > 0 && (
              <p className="mt-3 inline-block rounded-xl bg-peach-soft px-3.5 py-2 text-xs font-semibold text-ink">
                {s.lockedBanner(missingNames)}
              </p>
            )}
          </div>

          {formBody ? (
            <form
              action={saveSectionAction.bind(null, projectId, type)}
              className={`${ui.card} flex flex-col gap-3.5 p-6`}
            >
              {formBody}
              <div className="mt-2 flex gap-2">
                <button type="submit" className={ui.btnDark}>
                  {s.saveNotes}
                </button>
              </div>
            </form>
          ) : isCompetitorAudit ? (
            <>
              <CompetitorAuditPanel
                projectId={projectId}
                entries={competitorEntries}
                hasAnyResearch={hasAnyResearch}
                s={s}
              />
              {statement && (
                <div className={`${ui.card} mt-4 p-6`}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-plum">
                    {s.synthesized}
                  </p>
                  <p
                    dir={contentDir}
                    className="whitespace-pre-wrap text-start font-serif text-[15px] leading-relaxed text-ink"
                  >
                    {statement}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className={`${ui.card} p-6 text-sm text-ink-soft`}>
              {s.comingLater}
            </div>
          )}

          {isAISection && formBody && (
            <div className="mt-5 overflow-hidden rounded-panel bg-plum-deep">
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-5">
                <h2 className="font-display text-lg font-bold text-cream">
                  {s.aiDraft}
                </h2>
                {availableProviders.length === 0 ? (
                  <span className="rounded-full bg-peach px-3 py-1.5 text-xs font-bold text-ink">
                    {s.noKey}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableProviders.map((provider) => (
                      <form
                        key={provider}
                        action={generateSectionAction.bind(
                          null,
                          projectId,
                          type,
                          provider,
                        )}
                      >
                        <button
                          type="submit"
                          disabled={!unlocked || !currentVersion}
                          title={
                            !currentVersion
                              ? s.saveNotesFirst
                              : !unlocked
                                ? s.approveFirst(missingNames)
                                : undefined
                          }
                          className="inline-flex items-center rounded-full bg-peach-soft px-4 py-2 text-xs font-bold text-ink transition hover:bg-peach active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {s.withProvider(
                            statement ? s.regenerate : s.generate,
                            PROVIDER_LABELS[provider],
                          )}
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </div>

              <div className="mx-2 mb-2 rounded-[1.4rem] bg-cream p-6">
                {currentVersion && statement ? (
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-plum">
                        {s.currentDraft} · {metaLabel(currentVersion.generationMetadata)}
                        {" · "}
                        {s.wordCount(wordCount(statement))}
                      </p>
                      <CopyButton
                        text={statement}
                        label={s.copyDraft}
                        copiedLabel={s.copied}
                        className="rounded-full bg-ivory-dark px-3 py-1 text-[11px] font-bold text-plum transition hover:bg-peach-soft hover:text-ink"
                      />
                    </div>
                    <p
                      dir={contentDir}
                      className="whitespace-pre-wrap text-start font-serif text-[15px] leading-relaxed text-ink"
                    >
                      {statement}
                    </p>

                    <details className="mt-4 border-t border-line pt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-ink-soft transition hover:text-ink">
                        {s.editByHand}
                      </summary>
                      <form
                        action={editStatementAction.bind(null, projectId, type)}
                        className="mt-3 flex flex-col gap-2"
                      >
                        <textarea
                          name="statement"
                          defaultValue={statement}
                          rows={8}
                          dir={contentDir}
                          className={`${ui.input} font-serif leading-relaxed`}
                        />
                        <div>
                          <button type="submit" className={ui.btnSoft}>
                            {s.saveEditedDraft}
                          </button>
                        </div>
                      </form>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-ink-soft">
                    {s.noDraftYet}{" "}
                    {currentVersion ? s.noDraftGenerate : s.noDraftSave}
                  </p>
                )}

                {recentAIVersions.length > 1 && (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
                      {s.recentDrafts}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {recentAIVersions.map((version) => {
                        const isCurrent = version.id === currentVersion?.id;
                        return (
                          <li
                            key={version.id}
                            className={`rounded-card border p-3.5 ${isCurrent ? "border-plum bg-ivory-dark/50" : "border-line"}`}
                          >
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="text-xs font-bold text-ink">
                                {metaLabel(version.generationMetadata)} · v
                                {version.versionNumber}
                              </span>
                              {isCurrent ? (
                                <span className="rounded-full bg-plum px-2.5 py-0.5 text-[10px] font-bold text-cream">
                                  {s.current}
                                </span>
                              ) : (
                                <form
                                  action={selectVersionAction.bind(
                                    null,
                                    projectId,
                                    type,
                                    version.id,
                                  )}
                                >
                                  <button
                                    type="submit"
                                    className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold text-ink transition hover:bg-peach-soft"
                                  >
                                    {s.makeCurrent}
                                  </button>
                                </form>
                              )}
                            </div>
                            <p
                              dir={contentDir}
                              className="line-clamp-3 whitespace-pre-wrap text-start text-xs leading-relaxed text-ink-soft"
                            >
                              {draftStatement(version.content)}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentVersion && section.status !== "approved" && (
            <form
              action={approveSectionAction.bind(null, projectId, type)}
              className="mt-5"
            >
              <button type="submit" className={`${ui.btnPrimary} px-7 py-3`}>
                {s.approve}
              </button>
              <p className="mt-2 text-xs text-ink-soft">{s.approveHint}</p>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
