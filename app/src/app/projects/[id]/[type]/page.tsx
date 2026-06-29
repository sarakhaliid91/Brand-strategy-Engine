import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getProjectOwnedByUser,
  getSectionWithCurrentVersion,
  isGenerateUnlocked,
  getRecentAIVersions,
  getCompetitorEntries,
} from "@/lib/sections/queries";
import { SECTION_TYPES, SectionType } from "@/lib/sections/types";
import { SECTION_DEFINITIONS } from "@/lib/sections/definitions";
import { getAvailableProviders } from "@/lib/ai/client";
import { AIProvider, PROVIDER_LABELS } from "@/lib/ai/providers/types";
import {
  saveSectionAction,
  approveSectionAction,
  generateSectionAction,
  selectVersionAction,
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
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          placeholder="One per line"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      )}
    </label>
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
        <fieldset key={group} className="rounded-md border border-zinc-200 p-3">
          <legend className="px-1 text-xs font-medium text-zinc-600 capitalize">
            {group.replace("_", " ")}
          </legend>
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
        </fieldset>
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
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">Demographics</legend>
        <div className="grid grid-cols-2 gap-2">
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
      </fieldset>
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">Psychographics</legend>
        <div className="grid grid-cols-2 gap-2">
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
      </fieldset>
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">Personality</legend>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Behavioural characteristics" name="behaviouralCharacteristics" defaultValue={content.personality.behaviouralCharacteristics} />
          <Field label="Most passionate about" name="mostPassionateAbout" defaultValue={content.personality.mostPassionateAbout} />
          <Field label="Obligations they hate" name="obligationsTheyHate" defaultValue={content.personality.obligationsTheyHate} />
          <Field label="Biggest personal goal" name="biggestPersonalGoal" defaultValue={content.personality.biggestPersonalGoal} />
          <Field label="Biggest professional goal" name="biggestProfessionalGoal" defaultValue={content.personality.biggestProfessionalGoal} />
          <Field label="Core values" name="personalityCoreValues" defaultValue={content.personality.coreValues} />
          <Field label="Core fears" name="coreFears" defaultValue={content.personality.coreFears} />
          <Field label="Core desire" name="coreDesire" defaultValue={content.personality.coreDesire} />
        </div>
      </fieldset>
      <Field label="Challenges & pain points" name="challenges" defaultValue={content.circumstances.challenges.join("\n")} multiline />
      <Field label="Desires" name="desires" defaultValue={content.circumstances.desires.join("\n")} multiline />
      <Field label="Fears" name="fears" defaultValue={content.circumstances.fears.join("\n")} multiline />
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">
          Archetype mix (0 - 1 weight per archetype)
        </legend>
        <div className="grid grid-cols-3 gap-2">
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
      </fieldset>
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
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">
          Differentiator shortlist (one per line, aligned by row)
        </legend>
        <div className="flex flex-col gap-2">
          <Field label="Ideas" name="differentiatorIdeas" defaultValue={content.differentiators.map((d) => d.idea).join("\n")} multiline />
          <Field label="Added value" name="differentiatorAddedValues" defaultValue={content.differentiators.map((d) => d.addedValue).join("\n")} multiline />
          <Field label="Enhances experience" name="differentiatorEnhances" defaultValue={content.differentiators.map((d) => d.enhancesExperience).join("\n")} multiline />
          <Field label="Rating" name="differentiatorRatings" defaultValue={content.differentiators.map((d) => d.rating).join("\n")} multiline />
        </div>
      </fieldset>
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">USP inputs</legend>
        <div className="flex flex-col gap-2">
          <Field label="End result delivered" name="uspEndResult" defaultValue={content.uspEndResult} />
          <Field label="Benefit of the difference" name="uspBenefit" defaultValue={content.uspBenefit} />
        </div>
      </fieldset>
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">
          Positioning statement inputs
        </legend>
        <div className="flex flex-col gap-2">
          <Field label="We help…" name="posWeHelp" defaultValue={content.posWeHelp} />
          <Field label="Who…" name="posWho" defaultValue={content.posWho} />
          <Field label="To achieve / experience…" name="posToAchieve" defaultValue={content.posToAchieve} />
          <Field label="Unlike (the ordinary alternative)…" name="posUnlike" defaultValue={content.posUnlike} />
          <Field label="Our solution…" name="posOurSolution" defaultValue={content.posOurSolution} />
        </div>
      </fieldset>
    </>
  );
}

function BrandPersonaForm({ content }: { content: BrandPersonaContent }) {
  return (
    <>
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">
          Brand archetype mix / role (0 - 1 weight per archetype)
        </legend>
        <div className="grid grid-cols-3 gap-2">
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
      </fieldset>
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">Personality</legend>
        <div className="flex flex-col gap-2">
          <Field label="Characteristics" name="personalityCharacteristics" defaultValue={content.personalityCharacteristics} />
          <Field label="Desires" name="personalityDesires" defaultValue={content.personalityDesires} />
          <Field label="Fears" name="personalityFears" defaultValue={content.personalityFears} />
        </div>
      </fieldset>
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">Appearance</legend>
        <div className="flex flex-col gap-2">
          <Field label="Characteristics" name="appearanceCharacteristics" defaultValue={content.appearanceCharacteristics} />
          <Field label="Dress / style / clothes" name="dressStyle" defaultValue={content.dressStyle} />
          <Field label="Accessories" name="accessories" defaultValue={content.accessories} />
        </div>
      </fieldset>
      <Field label="Tone of voice" name="toneOfVoice" defaultValue={content.toneOfVoice} multiline />
      <Field label="Language keywords / phrases" name="languageKeywords" defaultValue={content.languageKeywords} multiline />
      <fieldset className="rounded-md border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-medium text-zinc-600">Brand interview</legend>
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
      </fieldset>
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
        className="flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <input
          name="name"
          placeholder="Competitor name"
          required
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
        <input
          name="url"
          placeholder="Website / social URL (optional)"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Add competitor
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Add competitors above, then research each with live web search.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => {
            const result = entry.researchResult as CompetitorResearchResult | null;
            return (
              <li
                key={entry.id}
                className="rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {entry.competitorName}
                    </p>
                    {entry.competitorUrl && (
                      <p className="text-xs text-zinc-400">{entry.competitorUrl}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form
                      action={researchCompetitorAction.bind(null, projectId, entry.id)}
                    >
                      <button
                        type="submit"
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-200"
                      >
                        {result ? "Re-research" : "Research (web)"}
                      </button>
                    </form>
                    <form
                      action={deleteCompetitorAction.bind(null, projectId, entry.id)}
                    >
                      <button
                        type="submit"
                        className="rounded-md px-2 py-1.5 text-xs text-zinc-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>

                {result && (
                  <div className="mt-3 flex flex-col gap-1 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                    {result.positioning && (
                      <p>
                        <span className="font-medium text-zinc-700">Positioning:</span>{" "}
                        {result.positioning}
                      </p>
                    )}
                    {result.strengths?.length > 0 && (
                      <p>
                        <span className="font-medium text-zinc-700">Strengths:</span>{" "}
                        {result.strengths.join("; ")}
                      </p>
                    )}
                    {result.weaknesses?.length > 0 && (
                      <p>
                        <span className="font-medium text-zinc-700">Weaknesses:</span>{" "}
                        {result.weaknesses.join("; ")}
                      </p>
                    )}
                    {result.toneDescriptors?.length > 0 && (
                      <p>
                        <span className="font-medium text-zinc-700">Tone:</span>{" "}
                        {result.toneDescriptors.join(", ")}
                      </p>
                    )}
                    {result.sources?.length > 0 && (
                      <p className="text-zinc-400">
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
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Synthesize comparison
        </button>
      </form>
    </div>
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

  const unlocked = await isGenerateUnlocked(projectId, type);
  const missing = def.requiredContext.filter(
    (rc) => rc !== type,
  );

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
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-8 py-4">
        <a
          href={`/projects/${projectId}`}
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          &larr; {project.name}
        </a>
        <h1 className="mt-1 text-lg font-semibold text-zinc-900">
          {def.order}. {def.displayName}
        </h1>
        <p className="text-xs text-zinc-500">{def.summary}</p>
      </header>

      <main className="mx-auto max-w-2xl px-8 py-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
            {section.status.replace("_", " ")}
          </span>
          {def.mode !== "manual" && !unlocked && (
            <span className="text-xs text-amber-600">
              Generate locked until approved: {missing.join(", ")}
            </span>
          )}
        </div>

        {formBody ? (
          <form
            action={saveSectionAction.bind(null, projectId, type)}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6"
          >
            {formBody}
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
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
              <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6">
                <p className="mb-1 text-xs text-zinc-400">Synthesized comparison</p>
                <p className="whitespace-pre-wrap text-sm text-zinc-800">
                  {statement}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            This section&apos;s editor is coming in a later phase.
          </div>
        )}

        {isAISection && formBody && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-zinc-700">AI draft</h2>
              {availableProviders.length === 0 ? (
                <span className="text-xs text-amber-600">
                  No AI provider configured. Add an API key to .env.local.
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
                              ? `Approve first: ${missing.join(", ")}`
                              : undefined
                        }
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {statement ? "Regenerate" : "Generate"} with{" "}
                        {PROVIDER_LABELS[provider]}
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </div>

            {currentVersion && statement ? (
              <div>
                <p className="mb-1 text-xs text-zinc-400">
                  Current draft · {metaLabel(currentVersion.generationMetadata)}
                </p>
                <p className="whitespace-pre-wrap text-sm text-zinc-800">
                  {statement}
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No draft yet.</p>
            )}

            {recentAIVersions.length > 1 && (
              <div className="mt-2 border-t border-zinc-100 pt-3">
                <p className="mb-2 text-xs font-medium text-zinc-500">
                  Recent AI drafts (compare &amp; pick)
                </p>
                <ul className="flex flex-col gap-2">
                  {recentAIVersions.map((version) => {
                    const isCurrent = version.id === currentVersion?.id;
                    return (
                      <li
                        key={version.id}
                        className="rounded-md border border-zinc-200 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-600">
                            {metaLabel(version.generationMetadata)} · v
                            {version.versionNumber}
                          </span>
                          {isCurrent ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
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
                                className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-700 hover:bg-zinc-200"
                              >
                                Make current
                              </button>
                            </form>
                          )}
                        </div>
                        <p className="line-clamp-3 whitespace-pre-wrap text-xs text-zinc-600">
                          {draftStatement(version.content)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {currentVersion && section.status !== "approved" && (
          <form
            action={approveSectionAction.bind(null, projectId, type)}
            className="mt-4"
          >
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Approve
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
