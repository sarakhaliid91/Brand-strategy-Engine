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
