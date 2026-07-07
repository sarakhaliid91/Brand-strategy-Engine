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
import { SECTION_TYPES, SectionType } from "@/lib/sections/types";
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

function isSectionType(value: string): value is SectionType {
  return (SECTION_TYPES as readonly string[]).includes(value);
}

function Field({
  label,
  name,
  defaultValue,
  multiline = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  multiline?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={ui.label}>{label}</span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          placeholder="One per line"
          className={ui.input}
        />
      ) : (
        <input name={name} defaultValue={defaultValue} className={ui.input} />
      )}
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
    <fieldset className="rounded-card border border-line bg-paper/50 p-4">
      <legend className="px-1.5 text-xs font-bold text-brand-deep">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function PurposeForm({ content }: { content: PurposeContent }) {
  return (
    <>
      <Field label="Who are we helping?" name="whoWeHelp" defaultValue={content.whoWeHelp.join("\n")} multiline />
      <Field label="What are we helping them with?" name="whatWeHelpThemWith" defaultValue={content.whatWeHelpThemWith.join("\n")} multiline />
      <Field label="Desired emotion" name="desiredEmotion" defaultValue={content.desiredEmotion.join("\n")} multiline />
      <Field label="How that emotion impacts their lives" name="emotionImpact" defaultValue={content.emotionImpact.join("\n")} multiline />
      <Field label="Knock-on effect elsewhere in their lives" name="knockOnEffect" defaultValue={content.knockOnEffect.join("\n")} multiline />
      <Field label="Practical impact of that knock-on effect" name="practicalImpact" defaultValue={content.practicalImpact.join("\n")} multiline />
      <Field label="Biggest impact we can have" name="biggestImpact" defaultValue={content.biggestImpact} />
    </>
  );
}

function VisionForm({ content }: { content: VisionContent }) {
  return (
    <>
      <Field label="Customers (5-10yr aspiration)" name="customers" defaultValue={content.customers.join("\n")} multiline />
      <Field label="Achievements" name="achievements" defaultValue={content.achievements.join("\n")} multiline />
      <Field label="Industry" name="industry" defaultValue={content.industry.join("\n")} multiline />
      <Field label="Environment" name="environment" defaultValue={content.environment.join("\n")} multiline />
      <Field label="World" name="world" defaultValue={content.world.join("\n")} multiline />
    </>
  );
}

function MissionForm({ content }: { content: MissionContent }) {
  return (
    <Field label="Ongoing commitments" name="ongoingCommitments" defaultValue={content.ongoingCommitments.join("\n")} multiline />
  );
}

function ValuesForm({ content }: { content: ValuesContent }) {
  const byGroup = (group: string) =>
    content.groupPerceptions.find((g) => g.group === group);
  return (
    <>
      {["customers", "suppliers", "general_public"].map((group) => (
        <FieldGroup key={group} legend={group.replace("_", " ")}>
          <div className="flex flex-col gap-2">
            <Field
              label="What would they say about the brand?"
              name={`group_${group}_comments`}
              defaultValue={byGroup(group)?.comments.join("\n")}
              multiline
            />
            <Field
              label="Related values"
              name={`group_${group}_relatedValues`}
              defaultValue={byGroup(group)?.relatedValues.join("\n")}
              multiline
            />
          </div>
        </FieldGroup>
      ))}
      <Field label="Values shortlist" name="shortlist" defaultValue={content.shortlist.join("\n")} multiline />
      <Field
        label="Core value names (one per line, matches sentences below by order)"
        name="coreValueNames"
        defaultValue={content.coreValues.map((v) => v.value).join("\n")}
        multiline
      />
      <Field
        label="Core value action sentences (same order)"
        name="coreValueSentences"
        defaultValue={content.coreValues.map((v) => v.actionSentence).join("\n")}
        multiline
      />
    </>
  );
}

function AudiencePersonaForm({ content }: { content: AudiencePersonaContent }) {
  return (
    <>
      <Field label="Persona name" name="personaName" defaultValue={content.personaName} />
      <FieldGroup legend="Demographics">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Age" name="age" defaultValue={content.demographics.age} />
          <Field label="Gender" name="gender" defaultValue={content.demographics.gender} />
          <Field label="Occupation" name="occupation" defaultValue={content.demographics.occupation} />
          <Field label="Professional responsibilities" name="professionalResponsibilities" defaultValue={content.demographics.professionalResponsibilities} />
          <Field label="Education" name="education" defaultValue={content.demographics.education} />
          <Field label="Location" name="location" defaultValue={content.demographics.location} />
          <Field label="Personal income" name="personalIncome" defaultValue={content.demographics.personalIncome} />
          <Field label="Household income" name="householdIncome" defaultValue={content.demographics.householdIncome} />
          <Field label="Marital status" name="maritalStatus" defaultValue={content.demographics.maritalStatus} />
          <Field label="Family status" name="familyStatus" defaultValue={content.demographics.familyStatus} />
          <Field label="Homeowner status" name="homeownerStatus" defaultValue={content.demographics.homeownerStatus} />
        </div>
      </FieldGroup>
      <FieldGroup legend="Psychographics">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Hobbies / interests" name="hobbiesInterests" defaultValue={content.psychographics.hobbiesInterests} />
          <Field label="Sports" name="sports" defaultValue={content.psychographics.sports} />
          <Field label="Music" name="music" defaultValue={content.psychographics.music} />
          <Field label="Restaurant preference" name="restaurantPreference" defaultValue={content.psychographics.restaurantPreference} />
          <Field label="Weekend pleasures" name="weekendPleasures" defaultValue={content.psychographics.weekendPleasures} />
          <Field label="Entertainment / fun" name="entertainment" defaultValue={content.psychographics.entertainment} />
          <Field label="Likes to wear" name="likesToWear" defaultValue={content.psychographics.likesToWear} />
          <Field label="Likes to talk about" name="likesToTalkAbout" defaultValue={content.psychographics.likesToTalkAbout} />
          <Field label="Groups & forums" name="groupsAndForums" defaultValue={content.psychographics.groupsAndForums} />
          <Field label="Favourite apps" name="favouriteApps" defaultValue={content.psychographics.favouriteApps} />
        </div>
      </FieldGroup>
      <FieldGroup legend="Personality">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Behavioural characteristics" name="behaviouralCharacteristics" defaultValue={content.personality.behaviouralCharacteristics} />
          <Field label="Most passionate about" name="mostPassionateAbout" defaultValue={content.personality.mostPassionateAbout} />
          <Field label="Obligations they hate" name="obligationsTheyHate" defaultValue={content.personality.obligationsTheyHate} />
          <Field label="Biggest personal goal" name="biggestPersonalGoal" defaultValue={content.personality.biggestPersonalGoal} />
          <Field label="Biggest professional goal" name="biggestProfessionalGoal" defaultValue={content.personality.biggestProfessionalGoal} />
          <Field label="Core values" name="personalityCoreValues" defaultValue={content.personality.coreValues} />
          <Field label="Core fears" name="coreFears" defaultValue={content.personality.coreFears} />
          <Field label="Core desire" name="coreDesire" defaultValue={content.personality.coreDesire} />
        </div>
      </FieldGroup>
      <Field label="Challenges & pain points" name="challenges" defaultValue={content.circumstances.challenges.join("\n")} multiline />
      <Field label="Desires" name="desires" defaultValue={content.circumstances.desires.join("\n")} multiline />
      <Field label="Fears" name="fears" defaultValue={content.circumstances.fears.join("\n")} multiline />
      <FieldGroup legend="Archetype mix (0 - 1 weight per archetype)">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BRAND_ARCHETYPES.map((archetype) => {
            const existing = content.archetypeMix.find((a) => a.archetype === archetype);
            return (
              <Field
                key={archetype}
                label={archetype}
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
}: {
  content: PositioningStrategyContent;
}) {
  return (
    <>
      <Field label="Unmet needs" name="unmetNeeds" defaultValue={content.unmetNeeds.join("\n")} multiline />
      <Field label="Opportunities" name="opportunities" defaultValue={content.opportunities.join("\n")} multiline />
      <Field label="Ideas" name="ideas" defaultValue={content.ideas.join("\n")} multiline />
      <FieldGroup legend="Differentiator shortlist (one per line, aligned by row)">
        <div className="flex flex-col gap-2">
          <Field label="Ideas" name="differentiatorIdeas" defaultValue={content.differentiators.map((d) => d.idea).join("\n")} multiline />
          <Field label="Added value" name="differentiatorAddedValues" defaultValue={content.differentiators.map((d) => d.addedValue).join("\n")} multiline />
          <Field label="Enhances experience" name="differentiatorEnhances" defaultValue={content.differentiators.map((d) => d.enhancesExperience).join("\n")} multiline />
          <Field label="Rating" name="differentiatorRatings" defaultValue={content.differentiators.map((d) => d.rating).join("\n")} multiline />
        </div>
      </FieldGroup>
      <FieldGroup legend="USP inputs">
        <div className="flex flex-col gap-2">
          <Field label="End result delivered" name="uspEndResult" defaultValue={content.uspEndResult} />
          <Field label="Benefit of the difference" name="uspBenefit" defaultValue={content.uspBenefit} />
        </div>
      </FieldGroup>
      <FieldGroup legend="Positioning statement inputs">
        <div className="flex flex-col gap-2">
          <Field label="We help…" name="posWeHelp" defaultValue={content.posWeHelp} />
          <Field label="Who…" name="posWho" defaultValue={content.posWho} />
          <Field label="To achieve / experience…" name="posToAchieve" defaultValue={content.posToAchieve} />
          <Field label="Unlike (the ordinary alternative)…" name="posUnlike" defaultValue={content.posUnlike} />
          <Field label="Our solution…" name="posOurSolution" defaultValue={content.posOurSolution} />
        </div>
      </FieldGroup>
    </>
  );
}

function BrandPersonaForm({ content }: { content: BrandPersonaContent }) {
  return (
    <>
      <FieldGroup legend="Brand archetype mix / role (0 - 1 weight per archetype)">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BRAND_ARCHETYPES.map((archetype) => {
            const existing = content.archetypeRoleMix.find((a) => a.archetype === archetype);
            return (
              <Field
                key={archetype}
                label={archetype}
                name={`role_${archetype}`}
                defaultValue={String(existing?.weight ?? 0)}
              />
            );
          })}
        </div>
      </FieldGroup>
      <FieldGroup legend="Personality">
        <div className="flex flex-col gap-2">
          <Field label="Characteristics" name="personalityCharacteristics" defaultValue={content.personalityCharacteristics} />
          <Field label="Desires" name="personalityDesires" defaultValue={content.personalityDesires} />
          <Field label="Fears" name="personalityFears" defaultValue={content.personalityFears} />
        </div>
      </FieldGroup>
      <FieldGroup legend="Appearance">
        <div className="flex flex-col gap-2">
          <Field label="Characteristics" name="appearanceCharacteristics" defaultValue={content.appearanceCharacteristics} />
          <Field label="Dress / style / clothes" name="dressStyle" defaultValue={content.dressStyle} />
          <Field label="Accessories" name="accessories" defaultValue={content.accessories} />
        </div>
      </FieldGroup>
      <Field label="Tone of voice" name="toneOfVoice" defaultValue={content.toneOfVoice} multiline />
      <Field label="Language keywords / phrases" name="languageKeywords" defaultValue={content.languageKeywords} multiline />
      <FieldGroup legend="Brand interview">
        <div className="flex flex-col gap-2">
          {BRAND_INTERVIEW_QUESTIONS.map((question, i) => {
            const existing = content.interview.find((q) => q.question === question);
            return (
              <Field
                key={i}
                label={question}
                name={`interview_${i}`}
                defaultValue={existing?.answer ?? ""}
                multiline
              />
            );
          })}
        </div>
      </FieldGroup>
    </>
  );
}

function CoreMessageForm({ content }: { content: CoreMessageContent }) {
  return (
    <Field
      label="Optional guidance for the AI (tone, emphasis, anything to steer the message map)"
      name="guidance"
      defaultValue={content.guidance}
      multiline
    />
  );
}

function BrandStoryForm({ content }: { content: BrandStoryContent }) {
  return (
    <>
      <Field label="Hero's name (optional — the AI will invent one if blank)" name="characterName" defaultValue={content.characterName} />
      <Field
        label="Optional guidance for the AI (tone, emphasis, anything to steer the story)"
        name="guidance"
        defaultValue={content.guidance}
        multiline
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
}: {
  projectId: string;
  entries: CompetitorEntry[];
  hasAnyResearch: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <form
        action={addCompetitorAction.bind(null, projectId)}
        className={`${ui.card} flex flex-wrap gap-2 p-4`}
      >
        <input
          name="name"
          placeholder="Competitor name"
          required
          className={`${ui.input} min-w-40 flex-1`}
        />
        <input
          name="url"
          placeholder="Website / social URL (optional)"
          className={`${ui.input} min-w-40 flex-1`}
        />
        <button type="submit" className={ui.btnPrimary}>
          Add competitor
        </button>
      </form>

      {entries.length === 0 ? (
        <div className="rounded-card bg-mint-soft px-6 py-8 text-center text-sm font-semibold text-brand-deep">
          Add competitors above, then research each one with live web search.
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
                      <p className="text-xs text-muted">{entry.competitorUrl}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form
                      action={researchCompetitorAction.bind(null, projectId, entry.id)}
                    >
                      <button type="submit" className={ui.btnSoft}>
                        {result ? "Re-research" : "Research (web)"}
                      </button>
                    </form>
                    <form
                      action={deleteCompetitorAction.bind(null, projectId, entry.id)}
                    >
                      <button
                        type="submit"
                        className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:bg-coral-soft hover:text-ink"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>

                {result && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-xs text-ink/80">
                    {result.positioning && (
                      <p>
                        <span className="font-bold text-brand-deep">Positioning:</span>{" "}
                        {result.positioning}
                      </p>
                    )}
                    {result.strengths?.length > 0 && (
                      <p>
                        <span className="font-bold text-brand-deep">Strengths:</span>{" "}
                        {result.strengths.join("; ")}
                      </p>
                    )}
                    {result.weaknesses?.length > 0 && (
                      <p>
                        <span className="font-bold text-brand-deep">Weaknesses:</span>{" "}
                        {result.weaknesses.join("; ")}
                      </p>
                    )}
                    {result.toneDescriptors?.length > 0 && (
                      <p>
                        <span className="font-bold text-brand-deep">Tone:</span>{" "}
                        {result.toneDescriptors.join(", ")}
                      </p>
                    )}
                    {result.sources?.length > 0 && (
                      <p className="text-muted">
                        Sources: {result.sources.join(", ")}
                      </p>
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
          title={hasAnyResearch ? undefined : "Research at least one competitor first"}
          className={ui.btnDark}
        >
          Synthesize comparison
        </button>
      </form>
    </div>
  );
}

function SectionStepper({
  projectId,
  currentType,
  statusByType,
}: {
  projectId: string;
  currentType: SectionType;
  statusByType: Map<SectionType, string>;
}) {
  return (
    <nav aria-label="Sections" className="lg:sticky lg:top-6">
      <ol className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {ORDERED_SECTION_TYPES.map((type) => {
          const def = SECTION_DEFINITIONS[type];
          const status = statusByType.get(type) ?? "not_started";
          const isCurrent = type === currentType;
          const dot =
            status === "approved"
              ? "bg-brand"
              : status === "not_started"
                ? "border border-line bg-transparent"
                : "bg-mint";
          return (
            <li key={type} className="shrink-0">
              <Link
                href={`/projects/${projectId}/${type}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-xs font-semibold transition lg:rounded-xl ${
                  isCurrent
                    ? "bg-ink text-white"
                    : "text-muted hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
                <span className="whitespace-nowrap">
                  {def.order}. {def.displayName}
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

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getProjectOwnedByUser(projectId, session.user.id);
  if (!project) notFound();

  const def = SECTION_DEFINITIONS[type];
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
  const missingNames = missing.map((m) => SECTION_DEFINITIONS[m].displayName);

  const rawContent = currentVersion?.content as unknown;

  let formBody: React.ReactNode;
  switch (type) {
    case "purpose":
      formBody = <PurposeForm content={(rawContent as PurposeContent) ?? emptyPurposeContent()} />;
      break;
    case "vision":
      formBody = <VisionForm content={(rawContent as VisionContent) ?? emptyVisionContent()} />;
      break;
    case "mission":
      formBody = <MissionForm content={(rawContent as MissionContent) ?? emptyMissionContent()} />;
      break;
    case "values":
      formBody = <ValuesForm content={(rawContent as ValuesContent) ?? emptyValuesContent()} />;
      break;
    case "audience_persona":
      formBody = (
        <AudiencePersonaForm
          content={(rawContent as AudiencePersonaContent) ?? emptyAudiencePersonaContent()}
        />
      );
      break;
    case "positioning_strategy":
      formBody = (
        <PositioningStrategyForm
          content={(rawContent as PositioningStrategyContent) ?? emptyPositioningStrategyContent()}
        />
      );
      break;
    case "brand_persona":
      formBody = (
        <BrandPersonaForm
          content={(rawContent as BrandPersonaContent) ?? emptyBrandPersonaContent()}
        />
      );
      break;
    case "core_message":
      formBody = (
        <CoreMessageForm
          content={(rawContent as CoreMessageContent) ?? emptyCoreMessageContent()}
        />
      );
      break;
    case "brand_story":
      formBody = (
        <BrandStoryForm
          content={(rawContent as BrandStoryContent) ?? emptyBrandStoryContent()}
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

  const isRtl = project.language === "ar";

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
    <div className="min-h-screen bg-paper">
      <AppHeader backHref={`/projects/${projectId}`} backLabel={project.name}>
        <Link
          href={`/projects/${projectId}/review`}
          className="rounded-full px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Review &amp; export
        </Link>
      </AppHeader>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 sm:px-8 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <SectionStepper
            projectId={projectId}
            currentType={type}
            statusByType={statusByType}
          />
        </aside>

        <main className="min-w-0 max-w-2xl flex-1">
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-black text-ink">
                {def.displayName}
              </h1>
              <StatusChip status={section.status} />
            </div>
            <p className="text-sm text-muted">{def.summary}</p>
            {isAISection && !unlocked && missingNames.length > 0 && (
              <p className="mt-3 inline-block rounded-xl bg-coral-soft px-3.5 py-2 text-xs font-semibold text-ink">
                🔒 Drafting unlocks after you approve: {missingNames.join(", ")}
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
                  Save notes
                </button>
              </div>
            </form>
          ) : isCompetitorAudit ? (
            <>
              <CompetitorAuditPanel
                projectId={projectId}
                entries={competitorEntries}
                hasAnyResearch={hasAnyResearch}
              />
              {statement && (
                <div className={`${ui.card} mt-4 p-6`}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-deep">
                    Synthesized comparison
                  </p>
                  <p
                    dir={isRtl ? "rtl" : "ltr"}
                    className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ink"
                  >
                    {statement}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className={`${ui.card} p-6 text-sm text-muted`}>
              This section&apos;s editor is coming in a later phase.
            </div>
          )}

          {isAISection && formBody && (
            <div className="mt-5 overflow-hidden rounded-panel bg-ink">
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-5">
                <h2 className="font-display text-lg font-bold text-white">
                  AI draft
                </h2>
                {availableProviders.length === 0 ? (
                  <span className="rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-ink">
                    No AI key configured yet — add one in Vercel settings
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
                              ? "Save your raw notes first"
                              : !unlocked
                                ? `Approve first: ${missingNames.join(", ")}`
                                : undefined
                          }
                          className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-xs font-bold text-ink transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {statement ? "Regenerate" : "Generate"} with{" "}
                          {PROVIDER_LABELS[provider]}
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </div>

              <div className="mx-2 mb-2 rounded-[1.4rem] bg-white p-6">
                {currentVersion && statement ? (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-deep">
                      Current draft · {metaLabel(currentVersion.generationMetadata)}
                    </p>
                    <p
                      dir={isRtl ? "rtl" : "ltr"}
                      className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ink"
                    >
                      {statement}
                    </p>

                    <details className="mt-4 border-t border-line pt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-muted transition hover:text-ink">
                        Edit this draft by hand
                      </summary>
                      <form
                        action={editStatementAction.bind(null, projectId, type)}
                        className="mt-3 flex flex-col gap-2"
                      >
                        <textarea
                          name="statement"
                          defaultValue={statement}
                          rows={8}
                          dir={isRtl ? "rtl" : "ltr"}
                          className={`${ui.input} font-serif leading-relaxed`}
                        />
                        <div>
                          <button type="submit" className={ui.btnSoft}>
                            Save edited draft
                          </button>
                        </div>
                      </form>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    No draft yet.{" "}
                    {currentVersion
                      ? "Generate one with the buttons above — it will be written from your approved sections."
                      : "Save your notes first, then generate."}
                  </p>
                )}

                {recentAIVersions.length > 1 && (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-muted">
                      Recent AI drafts — compare &amp; pick
                    </p>
                    <ul className="flex flex-col gap-2">
                      {recentAIVersions.map((version) => {
                        const isCurrent = version.id === currentVersion?.id;
                        return (
                          <li
                            key={version.id}
                            className={`rounded-card border p-3.5 ${isCurrent ? "border-brand bg-mint-soft/50" : "border-line"}`}
                          >
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="text-xs font-bold text-ink">
                                {metaLabel(version.generationMetadata)} · v
                                {version.versionNumber}
                              </span>
                              {isCurrent ? (
                                <span className="rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold text-ink">
                                  Current
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
                                    className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold text-ink transition hover:bg-mint"
                                  >
                                    Make current
                                  </button>
                                </form>
                              )}
                            </div>
                            <p
                              dir={isRtl ? "rtl" : "ltr"}
                              className="line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-muted"
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
                ✓ Approve section
              </button>
              <p className="mt-2 text-xs text-muted">
                Approving locks this in as context for the next sections.
              </p>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
