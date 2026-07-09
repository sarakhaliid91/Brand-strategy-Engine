/**
 * Per-field example hints shown under each form field, so the strategist
 * never faces a blank box. Grounded in real client work (a specialty coffee
 * roastery + a bakery) from the strategist's own Excel framework, adapted
 * into generic-enough examples to spark ideas for any client.
 *
 * Keys match the `name` attribute used in the wizard forms. Multiline
 * fields get newline-joined example lines; single-line fields get one
 * example. Grouped fields (values, personas) are prefixed by group/key.
 */

export type Examples = Record<string, string>;

const en: Examples = {
  // Purpose
  whoWeHelp: "Style-conscious professionals\nOffice workers in the business district",
  whatWeHelpThemWith:
    "A one-of-a-kind customer experience\nDrinks and food that match their standards\nA warm, welcoming space to meet friends or clients\nSupporting local culture through community events",
  desiredEmotion: "A sense of comfort and belonging\nPride and quiet satisfaction\nFeeling truly valued",
  emotionImpact: "Boosts their sense of self-worth\nHelps them focus and feel accomplished during the day",
  knockOnEffect: "People check in on them and want to meet up regularly\nFriends describe them as having great taste",
  practicalImpact: "Others trust their judgment and recommendations\nTheir social circle grows",
  biggestImpact: "Giving them a space that helps them succeed socially and professionally",

  // Vision
  customers: "Serve over 25,000 customers who see us as a second family",
  achievements: "Become the leading specialty roastery in the region\nBuild a dedicated R&D team",
  industry: "Raise the quality bar for the whole specialty coffee category",
  environment: "Train and employ baristas locally\nEncourage buying quality local coffee over imports",
  world: "Contribute to national tourism and cultural goals",

  // Mission
  ongoingCommitments:
    "Roast in small batches every week\nDeliver a standout, memorable customer experience\nMaintain a strong, consistent social media presence",

  // Values — group perceptions
  group_customers_comments: "Warm and flexible\nExcellent service\nClean and elegant\nBest in the category",
  group_customers_relatedValues: "Kindness\nExcellence\nRefinement\nLeadership",
  group_suppliers_comments: "Transparent and trustworthy to deal with\nHonest about their products",
  group_suppliers_relatedValues: "Clarity\nQuality\nIntegrity",
  group_general_public_comments: "High quality\nA respected name locally\nWarm and welcoming",
  group_general_public_relatedValues: "Quality\nLeadership\nWarmth",
  shortlist: "Refinement\nLeadership\nClarity\nExcellence\nWarmth",
  coreValueNames: "Refinement\nLeadership\nClarity\nExcellence",
  coreValueSentences:
    "You'll feel like the finest detail in everything we do\nWe set the trends others follow\nYou'll never doubt what we stand for\nCraftsmanship leads everything we make",

  // Audience persona
  personaName: "Sara Al-Otaibi — the image-conscious professional",
  age: "24–40",
  gender: "Female",
  occupation: "Office employee",
  professionalResponsibilities: "HR coordination",
  education: "Bachelor's degree",
  location: "North of the city",
  personalIncome: "8,000/month",
  householdIncome: "25,000/month",
  maritalStatus: "Single",
  familyStatus: "Lives with family",
  homeownerStatus: "Family-owned home",
  hobbiesInterests: "Shopping and walks with friends",
  sports: "Gym — weight training",
  music: "Trending pop playlists",
  restaurantPreference: "Wherever is busy and popular right now",
  weekendPleasures: "Chalet trips, travel, cinema, coffee outings with friends",
  entertainment: "The gym, and taking photos for social media",
  likesToWear: "Sharp, clean, put-together outfits",
  likesToTalkAbout: "Social status and standout places",
  groupsAndForums: "Style- and image-conscious circles",
  favouriteApps: "TikTok, Snapchat, Instagram",
  behaviouralCharacteristics: "Stubborn, socially confident, playful, a bit controlling",
  mostPassionateAbout: "Success and moving up in life",
  obligationsTheyHate: "Any kind of rigid responsibility",
  biggestPersonalGoal: "To stand out and be noticed",
  biggestProfessionalGoal: "To reach a senior leadership role",
  personalityCoreValues: "Ambitious, sharp, image-conscious, sociable",
  coreFears: "Being seen as poor, being alone, losing control, not being liked",
  coreDesire: "Recognition, status, and control over their surroundings",
  challenges: "Keeping up with every new trend while staying within budget\nWanting everyone to like them",
  desires: "A place that feels like it truly belongs to them\nA one-of-a-kind experience worth talking about",
  fears: "A dull, lifeless atmosphere\nMediocre food or drinks that ruin the experience",

  // Positioning
  unmetNeeds: "A strong, distinctive visual identity\nA compelling brand story",
  opportunities: "A genuinely unique customer experience\nStanding out through interior design",
  ideas: "A signature seasonal menu\nA loyalty program tied to the brand story",
  differentiatorIdeas: "A one-of-a-kind customer experience\nDistinctive interior design\nHigh-quality, consistent product",
  differentiatorAddedValues:
    "Makes the customer feel special and confident in what we offer\nA beautiful space worth photographing\nA sense of premium quality",
  differentiatorEnhances:
    "Deepens their sense of belonging, like a second home\nHelps them feel comfortable and connected\nCreates an unforgettable flavor experience",
  differentiatorRatings: "9\n7\n8",
  uspEndResult: "High-quality coffee and food",
  uspBenefit: "A one-of-a-kind, memorable customer experience",
  posWeHelp: "image-conscious professionals and office workers",
  posWho: "are looking for a place to meet friends and colleagues",
  posToAchieve: "a genuine sense of satisfaction and belonging",
  posUnlike: "brands that only offer food and drinks",
  posOurSolution: "a distinctive, memorable experience built around them",

  // Brand persona
  personalityCharacteristics: "Warm, generous, quietly confident, approachable, cultured",
  personalityDesires: "Belonging, connection, recognition",
  personalityFears: "Loneliness, disorder, failure",
  appearanceCharacteristics: "Approachable, refined, ambitious, elegant, socially at ease",
  dressStyle: "Smart-casual, tailored",
  accessories: "A watch or bracelet",
  toneOfVoice: "Simple and unpretentious, warm but composed, respectful, quietly confident",
  languageKeywords: "Belonging, craft, warmth, a place of your own",

  // Interview examples (keyed by question text, subset)
  "What do you love and why?":
    "I love someone who speaks with composure and courtesy, and genuinely helps others.",
  "What do you dislike / hate and why?":
    "I dislike people who don't care about how they present themselves or treat others.",
  "Where do you provide the most value to your audience?":
    "In offering an experience unlike any other, to show how much we value and care for them.",
  "What is the one thing you would change about your industry, and why?":
    "That coffee is treated as a mere drink rather than a culture that deserves a daily place in people's lives.",
  "Why is your market a great space to be in?":
    "Because people genuinely love coffee, and there's so much room to be creative — the sky's the limit.",
  "What is the purpose of your existence?":
    "To help people come together after a tiring day and open up with the people they love.",
  "What is important to you in the way you do business?":
    "Staying true to the strategy so I never lose who I am in front of people.",
  "What does your audience need to be protected against?":
    "Boredom, monotony, and endless routine.",
  "What are you passionate about?":
    "Giving my customers an experience unlike any other, so they can thrive around me.",
  "What impact would you like to have on your customers?":
    "To make them genuinely happier.",
  "What would you like your customers to say about you?":
    "This is the one place I don't want to replace.",

  // Core message / brand story
  guidance: "Keep the tone warm and confident; lean into the sense of belonging over pure luxury.",
  storyGuidance: "Make the turning point specific and sensory — a moment, not a summary.",
  characterName: "Omar",
};

const ar: Examples = {
  whoWeHelp: "المهتمين بالموضة\nالموظفين في المكاتب",
  whatWeHelpThemWith:
    "تقديم تجربة فريدة للعميل\nتقديم مشروبات و مأكولات تليق بمستوى العميل\nتوفير مكان دافئ للقاء الأصحاب أو العملاء\nتعزيز ثقافة المجتمع عبر فعاليات محلية",
  desiredEmotion: "الشعور بالراحة و الانتماء\nالفخر و الرضا الداخلي\nالشعور بأن له قيمة عالية",
  emotionImpact: "يعزز من قيمة الذات لديه\nيساعده على التركيز و الإنجاز في يومه",
  knockOnEffect: "أصحابه يتواصلون معه بانتظام عشان يتقابلون\nالناس تصفه بأنه ذوّاق",
  practicalImpact: "الناس تثق برأيه و اختياراته\nدائرته الاجتماعية تكبر",
  biggestImpact: "توفير بيئة تساعده على النجاح اجتماعياً و مهنياً",

  customers: "خدمة أكثر من 25 ألف عميل يشعرون بأننا عائلتهم الثانية",
  achievements: "أن نكون المحمصة الرائدة في المنطقة\nبناء فريق متخصص في البحث و التطوير",
  industry: "رفع مستوى الجودة في قطاع القهوة المختصة بالكامل",
  environment: "تدريب و تشغيل باريستا محليين\nتشجيع شراء القهوة المحلية عالية الجودة",
  world: "دعم رؤية السياحة و الثقافة الوطنية",

  ongoingCommitments:
    "تحميص دفعات صغيرة أسبوعياً\nتقديم تجربة عميل مميزة لا تُنسى\nالمحافظة على حضور قوي في منصات التواصل",

  group_customers_comments: "لطيف جداً و مرن\nخدمته ممتازة\nنظيف و أنيق\nالأفضل في مجاله",
  group_customers_relatedValues: "اللطف\nالامتياز\nالفخامة\nالريادة",
  group_suppliers_comments: "واضح و موثوق في التعامل\nأمانة في منتجاتهم",
  group_suppliers_relatedValues: "الوضوح\nالجودة\nالنزاهة",
  group_general_public_comments: "جودة عالية\nاسم محترم محلياً\nدافئ و مرحب",
  group_general_public_relatedValues: "الجودة\nالريادة\nالدفء",
  shortlist: "الفخامة\nالريادة\nالوضوح\nالامتياز\nالدفء",
  coreValueNames: "الفخامة\nالريادة\nالوضوح\nالامتياز",
  coreValueSentences:
    "ستشعر و كأنك القطعة الثمينة من كل شيء\nكل ما هو جديد نحن من نصنعه\nلن تساورك الشكوك فيما نقدمه\nالاحتراف لدينا سيد الموقف دائماً",

  personaName: "هاجر بنت خالد — الموظفة المهتمة بمظهرها",
  age: "24-40",
  gender: "أنثى",
  occupation: "وظيفة مكتبية",
  professionalResponsibilities: "إدارة الموارد البشرية",
  education: "بكالوريوس",
  location: "شمال المدينة",
  personalIncome: "8000 شهرياً",
  householdIncome: "25000 شهرياً",
  maritalStatus: "أعزب",
  familyStatus: "تعيش مع أهلها",
  homeownerStatus: "بيت ملك للعائلة",
  hobbiesInterests: "التسوق و التمشي مع الأصحاب",
  sports: "النادي - تمارين حديد",
  music: "أغاني الترندات",
  restaurantPreference: "أي مكان مزدحم و مشهور حالياً",
  weekendPleasures: "شاليه - سفر - سينما - قهاوي مع الأصحاب",
  entertainment: "النادي و التصوير لمنصات التواصل",
  likesToWear: "لبس أنيق و مرتب و ملفت",
  likesToTalkAbout: "المكانة الاجتماعية و الأماكن المميزة",
  groupsAndForums: "مهتمين بالموضة و المظهر",
  favouriteApps: "تيك توك - سناب شات - انستقرام",
  behaviouralCharacteristics: "عنيد - واثق اجتماعياً - مرح - يحب التحكم قليلاً",
  mostPassionateAbout: "النجاح و الارتقاء في الحياة",
  obligationsTheyHate: "أي نوع من المسؤوليات الصارمة",
  biggestPersonalGoal: "أن يكون ملفتاً و ملاحظاً",
  biggestProfessionalGoal: "الوصول لمنصب إداري عالٍ",
  personalityCoreValues: "طموح - ذكي - مهتم بمظهره - اجتماعي",
  coreFears: "الفقر - الوحدة - فقدان السيطرة - عدم إعجاب الآخرين",
  coreDesire: "التقدير و المكانة و التحكم بما حوله",
  challenges: "مواكبة كل ما هو جديد ضمن ميزانيته\nرغبته بأن يعجب الجميع",
  desires: "مكان يشعر بأنه ينتمي له فعلاً\nتجربة فريدة تستحق الحديث عنها",
  fears: "أجواء ميتة و بلا روح\nطعم أو خدمة سيئة تفسد التجربة",

  unmetNeeds: "هوية بصرية قوية و مميزة\nقصة براند مقنعة",
  opportunities: "تجربة عميل فريدة فعلاً\nالتميز عبر تصميم المكان",
  ideas: "قائمة موسمية مميزة\nبرنامج ولاء مرتبط بقصة البراند",
  differentiatorIdeas: "تجربة عميل فريدة\nتصميم داخلي مميز\nمنتج عالي الجودة و متسق",
  differentiatorAddedValues:
    "يشعر العميل بالتميز و الثقة فيما نقدمه\nمكان جميل يستحق التصوير\nإحساس بالجودة العالية",
  differentiatorEnhances:
    "يعزز انتماءه للمكان كأنه بيته الثاني\nيمنحه شعوراً بالراحة و الألفة\nيخلق تجربة نكهة لا تُنسى",
  differentiatorRatings: "9\n7\n8",
  uspEndResult: "قهوة و مأكولات عالية الجودة",
  uspBenefit: "تجربة عميل فريدة و لا تُنسى",
  posWeHelp: "المهتمين بالموضة و الموظفين في المكاتب",
  posWho: "يبحثون عن مكان للقاء الأصحاب و الزملاء",
  posToAchieve: "شعوراً حقيقياً بالرضا و الانتماء",
  posUnlike: "العلامات التي تقدم مشروبات و مأكولات فقط",
  posOurSolution: "تجربة مميزة و لا تُنسى محورها العميل نفسه",

  personalityCharacteristics: "دافئ - كريم - واثق بهدوء - قريب من الناس - مثقف",
  personalityDesires: "الانتماء - التواصل - التقدير",
  personalityFears: "الوحدة - العشوائية - الفشل",
  appearanceCharacteristics: "قريب - أنيق - طموح - راقٍ - مرتاح اجتماعياً",
  dressStyle: "أنيق غير رسمي",
  accessories: "ساعة أو سوار",
  toneOfVoice: "بسيط غير متكلف، دافئ لكنه رزين، مؤدب، واثق بهدوء",
  languageKeywords: "الانتماء - الحرفية - الدفء - مكانك الخاص",

  "What do you love and why?": "أحب الشخص اللي يتحدث برزانة و لباقة و يساعد غيره فعلاً.",
  "What do you dislike / hate and why?": "ما أحب الشخص اللي ما يهتم بمظهره أو بطريقة تعامله مع الناس.",
  "Where do you provide the most value to your audience?":
    "في تقديم تجربة لا تشبه أي تجربة أخرى، لنُظهر مدى تقديرنا و اهتمامنا بهم.",
  "What is the one thing you would change about your industry, and why?":
    "أن القهوة تُعامل كمشروب فقط لا كثقافة تستحق مكاناً يومياً في حياة الناس.",
  "Why is your market a great space to be in?":
    "لأن الناس تحب القهوة فعلاً، و في مساحة كبيرة للإبداع، السماء هي الحد الوحيد.",
  "What is the purpose of your existence?":
    "أن أساعد الناس يلتمّون بعد يوم متعب و ينفتحون مع من يحبون.",
  "What is important to you in the way you do business?":
    "الالتزام بالاستراتيجية حتى لا أفقد شخصيتي أمام الناس.",
  "What does your audience need to be protected against?": "الملل و الروتين الدائم.",
  "What are you passionate about?": "تقديم تجربة فريدة لعملائي حتى يزدهروا من حولي.",
  "What impact would you like to have on your customers?": "أن أجعلهم أكثر سعادة فعلاً.",
  "What would you like your customers to say about you?": "هذا المكان اللي ما أبي غيره.",

  guidance: "حافظي على نبرة دافئة و واثقة، مع التركيز على الانتماء أكثر من الفخامة المجردة.",
  storyGuidance: "اجعلي نقطة التحول محددة و حسّية — لحظة حقيقية، لا ملخصاً عاماً.",
  characterName: "عز",
};

export const fieldExamples = { en, ar };
