// Content shapes stored in `section_versions.content` (jsonb), one per
// SectionType. Modeled directly on the strategist's Excel framework files.

export interface PurposeContent {
  whoWeHelp: string[];
  whatWeHelpThemWith: string[];
  desiredEmotion: string[];
  emotionImpact: string[];
  knockOnEffect: string[];
  practicalImpact: string[];
  biggestImpact: string;
  statement: string;
}

export interface VisionContent {
  customers: string[];
  achievements: string[];
  industry: string[];
  environment: string[];
  world: string[];
  statement: string;
}

export interface MissionContent {
  ongoingCommitments: string[];
  statement: string;
}

export interface ValuesGroupPerception {
  group: string;
  comments: string[];
  relatedValues: string[];
}

export interface ValuesCoreValue {
  value: string;
  actionSentence: string;
}

export interface ValuesContent {
  groupPerceptions: ValuesGroupPerception[];
  shortlist: string[];
  coreValues: ValuesCoreValue[];
}

export interface DifferentiatorIdea {
  idea: string;
  addedValue: string;
  enhancesExperience: string;
  rating: string;
}

export interface PositioningStrategyContent {
  unmetNeeds: string[];
  opportunities: string[];
  ideas: string[];
  differentiators: DifferentiatorIdea[];
  uspEndResult: string;
  uspBenefit: string;
  posWeHelp: string;
  posWho: string;
  posToAchieve: string;
  posUnlike: string;
  posOurSolution: string;
  statement: string;
}

export interface BrandPersonaContent {
  archetypeRoleMix: { archetype: string; weight: number }[];
  personalityCharacteristics: string;
  personalityDesires: string;
  personalityFears: string;
  appearanceCharacteristics: string;
  dressStyle: string;
  accessories: string;
  toneOfVoice: string;
  languageKeywords: string;
  interview: { question: string; answer: string }[];
  statement: string;
}

export interface CoreMessageContent {
  guidance: string;
  statement: string;
}

/** One scored dimension of the strategist's real 6-category competitor audit rubric. */
export interface CompetitorDimension {
  score: number; // 0-10, overall for this dimension
  summary: string;
  notes: string[];
}

export interface CompetitorDimensions {
  positioningStrategy: CompetitorDimension;
  brandMessage: CompetitorDimension;
  personality: CompetitorDimension;
  brandIdentity: CompetitorDimension;
  brandPresence: CompetitorDimension;
  coreOffer: CompetitorDimension;
}

export const COMPETITOR_DIMENSION_LABELS: Record<keyof CompetitorDimensions, string> = {
  positioningStrategy: "Positioning strategy",
  brandMessage: "Brand message",
  personality: "Personality",
  brandIdentity: "Brand identity",
  brandPresence: "Brand presence",
  coreOffer: "Core offer",
};

export interface CompetitorResearchResult {
  positioning: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  toneDescriptors: string[];
  sources: string[];
  /** The strategist's full scored audit across 6 dimensions, 0-10 each. */
  dimensions?: CompetitorDimensions;
}

/** The competitor_audit section's own content holds the synthesized comparison. */
export interface CompetitorAuditContent {
  statement: string;
}

export interface BrandStoryContent {
  characterName: string;
  guidance: string;
  statement: string;
}

export const BRAND_INTERVIEW_QUESTIONS = [
  "What do you love and why?",
  "What do you dislike / hate and why?",
  "Where do you provide the most value to your audience?",
  "What is the one thing you would change about your industry, and why?",
  "Why is your market a great space to be in?",
  "What is the purpose of your existence?",
  "What is important to you in the way you do business?",
  "What does your audience need to be protected against?",
  "What are you passionate about?",
  "What impact would you like to have on your customers?",
  "What would you like your customers to say about you?",
] as const;

export interface AudiencePersonaContent {
  personaName: string;
  demographics: {
    age: string;
    gender: string;
    occupation: string;
    professionalResponsibilities: string;
    education: string;
    location: string;
    personalIncome: string;
    householdIncome: string;
    maritalStatus: string;
    familyStatus: string;
    homeownerStatus: string;
  };
  psychographics: {
    hobbiesInterests: string;
    sports: string;
    music: string;
    restaurantPreference: string;
    weekendPleasures: string;
    entertainment: string;
    likesToWear: string;
    likesToTalkAbout: string;
    groupsAndForums: string;
    favouriteApps: string;
  };
  personality: {
    behaviouralCharacteristics: string;
    mostPassionateAbout: string;
    obligationsTheyHate: string;
    biggestPersonalGoal: string;
    biggestProfessionalGoal: string;
    coreValues: string;
    coreFears: string;
    coreDesire: string;
  };
  circumstances: {
    challenges: string[];
    desires: string[];
    fears: string[];
  };
  archetypeMix: { archetype: string; weight: number }[];
}

export const BRAND_ARCHETYPES = [
  "The Outlaw",
  "The Magician",
  "The Hero",
  "The Lover",
  "The Jester",
  "The Everyman",
  "The Caregiver",
  "The Ruler",
  "The Creator",
  "The Innocent",
  "The Sage",
  "The Explorer",
] as const;

export function emptyAudiencePersonaContent(): AudiencePersonaContent {
  return {
    personaName: "",
    demographics: {
      age: "",
      gender: "",
      occupation: "",
      professionalResponsibilities: "",
      education: "",
      location: "",
      personalIncome: "",
      householdIncome: "",
      maritalStatus: "",
      familyStatus: "",
      homeownerStatus: "",
    },
    psychographics: {
      hobbiesInterests: "",
      sports: "",
      music: "",
      restaurantPreference: "",
      weekendPleasures: "",
      entertainment: "",
      likesToWear: "",
      likesToTalkAbout: "",
      groupsAndForums: "",
      favouriteApps: "",
    },
    personality: {
      behaviouralCharacteristics: "",
      mostPassionateAbout: "",
      obligationsTheyHate: "",
      biggestPersonalGoal: "",
      biggestProfessionalGoal: "",
      coreValues: "",
      coreFears: "",
      coreDesire: "",
    },
    circumstances: { challenges: [], desires: [], fears: [] },
    archetypeMix: BRAND_ARCHETYPES.map((a) => ({ archetype: a, weight: 0 })),
  };
}

export function emptyPurposeContent(): PurposeContent {
  return {
    whoWeHelp: [],
    whatWeHelpThemWith: [],
    desiredEmotion: [],
    emotionImpact: [],
    knockOnEffect: [],
    practicalImpact: [],
    biggestImpact: "",
    statement: "",
  };
}

export function emptyVisionContent(): VisionContent {
  return {
    customers: [],
    achievements: [],
    industry: [],
    environment: [],
    world: [],
    statement: "",
  };
}

export function emptyMissionContent(): MissionContent {
  return { ongoingCommitments: [], statement: "" };
}

export function emptyValuesContent(): ValuesContent {
  return { groupPerceptions: [], shortlist: [], coreValues: [] };
}

export function emptyPositioningStrategyContent(): PositioningStrategyContent {
  return {
    unmetNeeds: [],
    opportunities: [],
    ideas: [],
    differentiators: [],
    uspEndResult: "",
    uspBenefit: "",
    posWeHelp: "",
    posWho: "",
    posToAchieve: "",
    posUnlike: "",
    posOurSolution: "",
    statement: "",
  };
}

export function emptyBrandPersonaContent(): BrandPersonaContent {
  return {
    archetypeRoleMix: BRAND_ARCHETYPES.map((a) => ({ archetype: a, weight: 0 })),
    personalityCharacteristics: "",
    personalityDesires: "",
    personalityFears: "",
    appearanceCharacteristics: "",
    dressStyle: "",
    accessories: "",
    toneOfVoice: "",
    languageKeywords: "",
    interview: BRAND_INTERVIEW_QUESTIONS.map((question) => ({
      question,
      answer: "",
    })),
    statement: "",
  };
}

export function emptyCoreMessageContent(): CoreMessageContent {
  return { guidance: "", statement: "" };
}

export function emptyBrandStoryContent(): BrandStoryContent {
  return { characterName: "", guidance: "", statement: "" };
}

function linesOf(formData: FormData, name: string): string[] {
  return String(formData.get(name) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function strOf(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export function parsePurposeForm(formData: FormData): PurposeContent {
  return {
    whoWeHelp: linesOf(formData, "whoWeHelp"),
    whatWeHelpThemWith: linesOf(formData, "whatWeHelpThemWith"),
    desiredEmotion: linesOf(formData, "desiredEmotion"),
    emotionImpact: linesOf(formData, "emotionImpact"),
    knockOnEffect: linesOf(formData, "knockOnEffect"),
    practicalImpact: linesOf(formData, "practicalImpact"),
    biggestImpact: strOf(formData, "biggestImpact"),
    statement: strOf(formData, "statement"),
  };
}

export function parseVisionForm(formData: FormData): VisionContent {
  return {
    customers: linesOf(formData, "customers"),
    achievements: linesOf(formData, "achievements"),
    industry: linesOf(formData, "industry"),
    environment: linesOf(formData, "environment"),
    world: linesOf(formData, "world"),
    statement: strOf(formData, "statement"),
  };
}

export function parseMissionForm(formData: FormData): MissionContent {
  return {
    ongoingCommitments: linesOf(formData, "ongoingCommitments"),
    statement: strOf(formData, "statement"),
  };
}

export function parseValuesForm(formData: FormData): ValuesContent {
  const groups = ["customers", "suppliers", "general_public"];
  const groupPerceptions: ValuesGroupPerception[] = groups
    .map((group) => ({
      group,
      comments: linesOf(formData, `group_${group}_comments`),
      relatedValues: linesOf(formData, `group_${group}_relatedValues`),
    }))
    .filter((g) => g.comments.length > 0 || g.relatedValues.length > 0);

  const shortlist = linesOf(formData, "shortlist");

  const coreValueNames = linesOf(formData, "coreValueNames");
  const coreValueSentences = linesOf(formData, "coreValueSentences");
  const coreValues: ValuesCoreValue[] = coreValueNames.map((value, i) => ({
    value,
    actionSentence: coreValueSentences[i] ?? "",
  }));

  return { groupPerceptions, shortlist, coreValues };
}

export function parseAudiencePersonaForm(
  formData: FormData,
): AudiencePersonaContent {
  return {
    personaName: strOf(formData, "personaName"),
    demographics: {
      age: strOf(formData, "age"),
      gender: strOf(formData, "gender"),
      occupation: strOf(formData, "occupation"),
      professionalResponsibilities: strOf(
        formData,
        "professionalResponsibilities",
      ),
      education: strOf(formData, "education"),
      location: strOf(formData, "location"),
      personalIncome: strOf(formData, "personalIncome"),
      householdIncome: strOf(formData, "householdIncome"),
      maritalStatus: strOf(formData, "maritalStatus"),
      familyStatus: strOf(formData, "familyStatus"),
      homeownerStatus: strOf(formData, "homeownerStatus"),
    },
    psychographics: {
      hobbiesInterests: strOf(formData, "hobbiesInterests"),
      sports: strOf(formData, "sports"),
      music: strOf(formData, "music"),
      restaurantPreference: strOf(formData, "restaurantPreference"),
      weekendPleasures: strOf(formData, "weekendPleasures"),
      entertainment: strOf(formData, "entertainment"),
      likesToWear: strOf(formData, "likesToWear"),
      likesToTalkAbout: strOf(formData, "likesToTalkAbout"),
      groupsAndForums: strOf(formData, "groupsAndForums"),
      favouriteApps: strOf(formData, "favouriteApps"),
    },
    personality: {
      behaviouralCharacteristics: strOf(
        formData,
        "behaviouralCharacteristics",
      ),
      mostPassionateAbout: strOf(formData, "mostPassionateAbout"),
      obligationsTheyHate: strOf(formData, "obligationsTheyHate"),
      biggestPersonalGoal: strOf(formData, "biggestPersonalGoal"),
      biggestProfessionalGoal: strOf(formData, "biggestProfessionalGoal"),
      coreValues: strOf(formData, "personalityCoreValues"),
      coreFears: strOf(formData, "coreFears"),
      coreDesire: strOf(formData, "coreDesire"),
    },
    circumstances: {
      challenges: linesOf(formData, "challenges"),
      desires: linesOf(formData, "desires"),
      fears: linesOf(formData, "fears"),
    },
    archetypeMix: BRAND_ARCHETYPES.map((archetype) => ({
      archetype,
      weight: Number(formData.get(`archetype_${archetype}`) ?? 0) || 0,
    })),
  };
}

export function parsePositioningStrategyForm(
  formData: FormData,
): PositioningStrategyContent {
  const diffIdeas = linesOf(formData, "differentiatorIdeas");
  const diffValues = linesOf(formData, "differentiatorAddedValues");
  const diffEnhances = linesOf(formData, "differentiatorEnhances");
  const diffRatings = linesOf(formData, "differentiatorRatings");
  const differentiators: DifferentiatorIdea[] = diffIdeas.map((idea, i) => ({
    idea,
    addedValue: diffValues[i] ?? "",
    enhancesExperience: diffEnhances[i] ?? "",
    rating: diffRatings[i] ?? "",
  }));

  return {
    unmetNeeds: linesOf(formData, "unmetNeeds"),
    opportunities: linesOf(formData, "opportunities"),
    ideas: linesOf(formData, "ideas"),
    differentiators,
    uspEndResult: strOf(formData, "uspEndResult"),
    uspBenefit: strOf(formData, "uspBenefit"),
    posWeHelp: strOf(formData, "posWeHelp"),
    posWho: strOf(formData, "posWho"),
    posToAchieve: strOf(formData, "posToAchieve"),
    posUnlike: strOf(formData, "posUnlike"),
    posOurSolution: strOf(formData, "posOurSolution"),
    statement: strOf(formData, "statement"),
  };
}

export function parseBrandPersonaForm(formData: FormData): BrandPersonaContent {
  return {
    archetypeRoleMix: BRAND_ARCHETYPES.map((archetype) => ({
      archetype,
      weight: Number(formData.get(`role_${archetype}`) ?? 0) || 0,
    })),
    personalityCharacteristics: strOf(formData, "personalityCharacteristics"),
    personalityDesires: strOf(formData, "personalityDesires"),
    personalityFears: strOf(formData, "personalityFears"),
    appearanceCharacteristics: strOf(formData, "appearanceCharacteristics"),
    dressStyle: strOf(formData, "dressStyle"),
    accessories: strOf(formData, "accessories"),
    toneOfVoice: strOf(formData, "toneOfVoice"),
    languageKeywords: strOf(formData, "languageKeywords"),
    interview: BRAND_INTERVIEW_QUESTIONS.map((question, i) => ({
      question,
      answer: strOf(formData, `interview_${i}`),
    })),
    statement: strOf(formData, "statement"),
  };
}

export function parseCoreMessageForm(formData: FormData): CoreMessageContent {
  return {
    guidance: strOf(formData, "guidance"),
    statement: strOf(formData, "statement"),
  };
}

export function parseBrandStoryForm(formData: FormData): BrandStoryContent {
  return {
    characterName: strOf(formData, "characterName"),
    guidance: strOf(formData, "guidance"),
    statement: strOf(formData, "statement"),
  };
}
