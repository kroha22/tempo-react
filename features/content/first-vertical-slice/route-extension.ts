import type {
  CanDoObjective,
  Chunk,
  ContentBlock,
  Example,
  ExerciseItem,
  ExerciseUse,
  KnowledgeTarget,
  Lesson,
  LessonFlowDefinition,
  StudyItem,
} from "../types.ts";

const base = { schemaVersion: 1, contentRevision: 1, status: "reviewed" as const };
const quality = { ptPtReviewed: true, translationReviewedLocales: ["ru"], naturalness: "preferred" as const, synthetic: true };

export type RouteActivity = {
  id: string;
  kind: "choice" | "scene";
  prompt: string;
  support?: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  errorCode: string;
  targetId: string;
};

export type RouteLessonExperience = {
  id: string;
  title: string;
  canDo: string;
  minutes: number;
  cue: string;
  examples: { pt: string; ru: string }[];
  vocabulary?: { pt: string; ru: string; note?: string }[];
  activity: RouteActivity;
  saveItemIds: string[];
  topicId?: string;
  practiceVerbKeys?: string[];
  checkpointCriteria?: string[];
};

export const routeLessonExperiences: RouteLessonExperience[] = [
  {
    id: "lesson:a1-1:introduce-yourself",
    title: "Представиться",
    canDo: "Я могу поздороваться, спросить имя и коротко представиться.",
    minutes: 6,
    cue: "Запоминайте вопрос и ответ как готовые фразы. Так знакомство сразу звучит естественно.",
    examples: [
      { pt: "Como te chamas?", ru: "Как тебя зовут?" },
      { pt: "Chamo-me Rita. Muito prazer.", ru: "Меня зовут Рита. Очень приятно." },
    ],
    vocabulary: [
      { pt: "Olá!", ru: "Привет! / Здравствуйте!" },
      { pt: "Como te chamas?", ru: "Как тебя зовут?" },
      { pt: "Chamo-me…", ru: "Меня зовут…" },
      { pt: "Sou…", ru: "Я…" },
      { pt: "Muito prazer.", ru: "Очень приятно." },
    ],
    activity: {
      id: "exercise:intro:transfer-miguel", kind: "choice", prompt: "Вы познакомились с Мигелом. Как начать ответ?",
      options: [{ id: "a", label: "Chamo-me..." }, { id: "b", label: "Estou..." }, { id: "c", label: "Há..." }],
      correctOptionId: "a", errorCode: "INTRO_REQUIRED_CHUNK", targetId: "chunk:chamo-me",
    },
    saveItemIds: ["study:chunk:chamo-me", "study:chunk:como-te-chamas"],
  },
  {
    id: "lesson:a1-1:ser-estar-description-state",
    title: "SER или ESTAR",
    canDo: "Я могу сказать, кто это или какой человек, и описать состояние сейчас.",
    minutes: 10,
    cue: "SER нужен, чтобы назвать или описать. ESTAR — чтобы сказать, как кто-то себя чувствует сейчас или где находится.",
    examples: [
      { pt: "O Rui é calmo.", ru: "Руй спокойный по характеру." },
      { pt: "O Rui está calmo.", ru: "Сейчас Руй спокоен." },
    ],
    vocabulary: [
      { pt: "calmo / calma", ru: "спокойный / спокойная" },
      { pt: "nervoso / nervosa", ru: "нервный / нервная" },
      { pt: "cansado / cansada", ru: "уставший / уставшая" },
      { pt: "pronto / pronta", ru: "готовый / готовая" },
      { pt: "pequeno / pequena", ru: "маленький / маленькая" },
      { pt: "grande", ru: "большой / большая" },
    ],
    activity: {
      id: "exercise:ser-estar:independent", kind: "choice", prompt: "Сегодня Ана устала. Выберите естественную фразу.",
      options: [{ id: "estar", label: "A Ana está cansada." }, { id: "ser", label: "A Ana é cansada." }],
      correctOptionId: "estar", errorCode: "SER_ESTAR_CHOICE", targetId: "grammar:ser-estar:first-contrast",
    },
    saveItemIds: ["study:verb:ser:identity", "study:verb:estar:state"], topicId: "ser-estar", practiceVerbKeys: ["ser", "estar"],
  },
  {
    id: "lesson:a1-1:name-familiar-objects",
    title: "Знакомые предметы",
    canDo: "Я могу назвать один или несколько знакомых предметов с правильным артиклем.",
    minutes: 8,
    cue: "Учите существительное вместе с артиклем и формой множественного числа — так род и число запоминаются сразу.",
    examples: [
      { pt: "a janela — as janelas", ru: "окно — окна" },
      { pt: "o livro — os livros", ru: "книга — книги" },
    ],
    vocabulary: [
      { pt: "a mesa — as mesas", ru: "стол — столы" },
      { pt: "a caixa — as caixas", ru: "коробка — коробки" },
      { pt: "a porta — as portas", ru: "дверь — двери" },
      { pt: "a janela — as janelas", ru: "окно — окна" },
      { pt: "o gato — os gatos", ru: "кот — коты" },
      { pt: "a chave — as chaves", ru: "ключ — ключи" },
      { pt: "o livro — os livros", ru: "книга — книги" },
    ],
    activity: {
      id: "exercise:nouns:independent", kind: "choice", prompt: "Как назвать несколько окон?",
      options: [{ id: "as", label: "as janelas" }, { id: "os", label: "os janelas" }, { id: "a", label: "a janelas" }],
      correctOptionId: "as", errorCode: "NOUN_ARTICLE_NUMBER", targetId: "grammar:noun:number-regular",
    },
    saveItemIds: ["study:noun:mesa", "study:noun:caixa", "study:noun:porta", "study:noun:janela", "study:noun:gato", "study:noun:chave", "study:noun:livro"],
  },
  {
    id: "lesson:a1-1:locate-object",
    title: "Где находится предмет",
    canDo: "Я могу спросить и сказать, где находится знакомый предмет.",
    minutes: 9,
    cue: "Сначала найдите знакомый предмет, затем определите, где он находится: внутри, сверху, под чем-то или рядом.",
    examples: [
      { pt: "Onde está o gato?", ru: "Где кот?" },
      { pt: "O gato está na caixa.", ru: "Кот в коробке." },
    ],
    vocabulary: [
      { pt: "dentro de", ru: "внутри" },
      { pt: "em cima de", ru: "на / сверху" },
      { pt: "debaixo de", ru: "под" },
      { pt: "ao lado de", ru: "рядом с" },
      { pt: "no / na", ru: "в / на + известный предмет", note: "em + o/a" },
    ],
    activity: {
      id: "exercise:space:independent", kind: "scene", prompt: "Прочитайте фразу и выберите, где должен быть кот: O gato está debaixo da mesa.",
      support: "Ответ можно выбрать мышью или с клавиатуры.",
      options: [{ id: "inside", label: "в коробке" }, { id: "on", label: "на столе" }, { id: "under", label: "под столом" }],
      correctOptionId: "under", errorCode: "SPACE_RELATION", targetId: "pattern:space:debaixo-de",
    },
    saveItemIds: ["study:chunk:onde-esta", "study:chunk:dentro-de", "study:chunk:em-cima-de", "study:chunk:debaixo-de", "study:chunk:ao-lado-de"], practiceVerbKeys: ["estar"],
  },
  {
    id: "lesson:a1-1:possession-and-presence",
    title: "TER и HÁ",
    canDo: "Я могу сказать, что есть у человека или в комнате.",
    minutes: 9,
    cue: "TER говорит, что есть у конкретного человека или предмета. HÁ — что вообще есть в комнате. HÁ не меняется, даже если предметов несколько.",
    examples: [
      { pt: "A Rita tem uma chave.", ru: "У Риты есть ключ." },
      { pt: "Há três livros na mesa.", ru: "На столе есть три книги." },
    ],
    vocabulary: [
      { pt: "a sala — as salas", ru: "комната / гостиная" },
      { pt: "a cadeira — as cadeiras", ru: "стул — стулья" },
      { pt: "a cama — as camas", ru: "кровать — кровати" },
      { pt: "o quarto — os quartos", ru: "спальня — спальни" },
      { pt: "o armário — os armários", ru: "шкаф — шкафы" },
      { pt: "o copo — os copos", ru: "стакан — стаканы" },
    ],
    activity: {
      id: "exercise:ter-ha:independent", kind: "choice", prompt: "В комнате два стула, но мы не говорим, чьи они. Какая фраза подходит?",
      options: [{ id: "ha", label: "Há duas cadeiras na sala." }, { id: "tem", label: "Tem duas cadeiras na sala." }],
      correctOptionId: "ha", errorCode: "REQUIRED_PATTERN_HA", targetId: "grammar:ha:existence-entry",
    },
    saveItemIds: ["study:verb:ter:possession", "study:chunk:ha-presence", "study:noun:sala", "study:noun:cadeira", "study:noun:cama", "study:noun:quarto", "study:noun:armario", "study:noun:copo"], practiceVerbKeys: ["ter"],
  },
  {
    id: "lesson:a1-1:ask-place-location",
    title: "Где расположено место",
    canDo: "Я могу спросить и сказать, где находится знакомое место.",
    minutes: 7,
    cue: "Чтобы спросить, где находится место, используем Onde fica…? В этом уроке берём только это значение FICAR.",
    examples: [
      { pt: "Onde fica a estação?", ru: "Где находится станция?" },
      { pt: "A estação fica no centro.", ru: "Станция находится в центре." },
    ],
    vocabulary: [
      { pt: "a estação — as estações", ru: "станция — станции" },
      { pt: "o hotel — os hotéis", ru: "отель — отели" },
      { pt: "a farmácia — as farmácias", ru: "аптека — аптеки" },
      { pt: "o centro — os centros", ru: "центр — центры" },
    ],
    activity: {
      id: "exercise:ficar:independent", kind: "choice", prompt: "Как спросить, где находится аптека?",
      options: [{ id: "fica", label: "Onde fica a farmácia?" }, { id: "esta", label: "Onde está a farmácia agora?" }, { id: "ha", label: "Há a farmácia?" }],
      correctOptionId: "fica", errorCode: "FICAR_SENSE", targetId: "grammar:ficar:location-entry",
    },
    saveItemIds: ["study:verb:ficar:location", "study:chunk:onde-fica", "study:noun:estacao", "study:noun:hotel", "study:noun:farmacia", "study:noun:centro"], topicId: "ficar-location", practiceVerbKeys: ["ficar"],
  },
  {
    id: "checkpoint:a1-1:new-room",
    title: "Новая комната",
    canDo: "Я могу представиться и описать новую комнату: кто в ней, что в ней есть и где находятся предметы.",
    minutes: 8,
    cue: "Новых слов и правил здесь нет. Покажем результат по каждому навыку отдельно — даже если что-то не получится, можно идти дальше.",
    examples: [{ pt: "Olá! Chamo-me Leonor. Há uma mesa na sala.", ru: "Привет! Меня зовут Леонор. В комнате есть стол." }],
    activity: {
      id: "exercise:checkpoint:new-room", kind: "choice", prompt: "Кот сидит под столом. Какая фраза точно описывает сцену?",
      options: [{ id: "under", label: "O gato está debaixo da mesa." }, { id: "inside", label: "O gato está na caixa." }, { id: "place", label: "O gato fica no centro." }],
      correctOptionId: "under", errorCode: "CHECKPOINT_SPACE", targetId: "pattern:space:debaixo-de",
    },
    saveItemIds: [],
    checkpointCriteria: ["Представиться", "Различать SER и ESTAR", "Назвать предметы", "Различать TER и HÁ", "Сказать, где предмет", "Спросить, где находится место"],
  },
];

const extraExperiences = routeLessonExperiences.slice(1);

const canDoSpecs = [
  ["cando:describe-and-state", "cando.describe-and-state", ["grammar:ser-estar:first-contrast"]],
  ["cando:name-familiar-objects", "cando.name-familiar-objects", ["grammar:noun:number-regular"]],
  ["cando:locate-familiar-object", "cando.locate-familiar-object", ["pattern:space:debaixo-de"]],
  ["cando:describe-possession-and-presence", "cando.describe-possession-and-presence", ["grammar:ha:existence-entry"]],
  ["cando:ask-place-location", "cando.ask-place-location", ["grammar:ficar:location-entry"]],
  ["cando:new-room-checkpoint", "cando.new-room-checkpoint", ["grammar:ser-estar:first-contrast", "grammar:noun:number-regular", "pattern:space:debaixo-de", "grammar:ha:existence-entry", "grammar:ficar:location-entry"]],
] as const;

export const extraCanDos: CanDoObjective[] = canDoSpecs.map(([id, statementKey, requiredKnowledgeIds]) => ({
  ...base, id, kind: "can-do", statementKey, cefr: "A1.1", requiredKnowledgeIds: [...requiredKnowledgeIds], successCriteriaKeys: [`${statementKey}.success`],
}));

const targetSpecs: [string, "grammar" | "form" | "register", string][] = [
  ["grammar:ser-estar:first-contrast", "grammar", "target.ser-estar.title"],
  ["grammar:noun:number-regular", "grammar", "target.noun-number.title"],
  ["pattern:space:debaixo-de", "grammar", "target.space-under.title"],
  ["grammar:ha:existence-entry", "grammar", "target.ha.title"],
  ["grammar:ficar:location-entry", "grammar", "target.ficar-location.title"],
];
export const extraKnowledgeTargets: KnowledgeTarget[] = targetSpecs.map(([id, targetType, titleKey]) => ({ ...base, id, kind: "knowledge-target", targetType, titleKey }));

const exampleSpecs = [
  ["example:rui-ser-calmo", "O Rui é calmo.", "example.rui-ser-calmo.ru", "grammar:ser-estar:first-contrast"],
  ["example:janela-aberta", "A janela está aberta.", "example.janela-aberta.ru", "grammar:noun:number-regular"],
  ["example:gato-debaixo-mesa", "O gato está debaixo da mesa.", "example.gato-debaixo-mesa.ru", "pattern:space:debaixo-de"],
  ["example:ha-mesa-sala", "Há uma mesa na sala.", "example.ha-mesa-sala.ru", "grammar:ha:existence-entry"],
  ["example:estacao-centro", "A estação fica no centro.", "example.estacao-centro.ru", "grammar:ficar:location-entry"],
] as const;
export const extraExamples: Example[] = exampleSpecs.map(([id, text, translationKey, targetId]) => ({
  ...base, id, kind: "example", locale: "pt-PT", text, normalizedText: text.toLocaleLowerCase("pt-PT").replace(/[?.]/g, ""), translationKey,
  targetIds: [targetId], difficulty: "entry", presentationProfileIds: ["adult"], quality,
}));

const chunkSpecs = [
  ["chunk:onde-esta", "Onde está...?", "study.onde-esta.ru", "example:gato-debaixo-mesa"],
  ["chunk:dentro-de", "dentro de", "study.dentro-de.ru", "example:gato-debaixo-mesa"],
  ["chunk:em-cima-de", "em cima de", "study.em-cima-de.ru", "example:gato-debaixo-mesa"],
  ["chunk:debaixo-de", "debaixo de", "study.debaixo-de.ru", "example:gato-debaixo-mesa"],
  ["chunk:ao-lado-de", "ao lado de", "study.ao-lado-de.ru", "example:gato-debaixo-mesa"],
  ["chunk:ha-presence", "Há uma...", "study.ha.ru", "example:ha-mesa-sala"],
  ["chunk:onde-fica", "Onde fica...?", "study.onde-fica.ru", "example:estacao-centro"],
] as const;
export const extraChunks: Chunk[] = chunkSpecs.map(([id, text, glossKey, exampleId]) => ({
  ...base, id, kind: "chunk", locale: "pt-PT", text, normalizedText: text.toLocaleLowerCase("pt-PT").replace(/[?.]/g, ""), glossKey, register: "neutral", exampleIds: [exampleId],
}));

const studySpecs = [
  ["study:verb:ser:identity", "verb", "ser", "study.ser.ru", "example:rui-ser-calmo"],
  ["study:verb:estar:state", "verb", "estar", "study.estar.ru", "example:rui-ser-calmo"],
  ["study:chunk:onde-esta", "chunk", "Onde está...?", "study.onde-esta.ru", "example:gato-debaixo-mesa"],
  ["study:chunk:dentro-de", "chunk", "dentro de", "study.dentro-de.ru", "example:gato-debaixo-mesa"],
  ["study:chunk:em-cima-de", "chunk", "em cima de", "study.em-cima-de.ru", "example:gato-debaixo-mesa"],
  ["study:chunk:debaixo-de", "chunk", "debaixo de", "study.debaixo-de.ru", "example:gato-debaixo-mesa"],
  ["study:chunk:ao-lado-de", "chunk", "ao lado de", "study.ao-lado-de.ru", "example:gato-debaixo-mesa"],
  ["study:verb:ter:possession", "verb", "ter", "study.ter.ru", "example:ha-mesa-sala"],
  ["study:chunk:ha-presence", "chunk", "Há uma...", "study.ha.ru", "example:ha-mesa-sala"],
  ["study:verb:ficar:location", "verb", "ficar", "study.ficar.ru", "example:estacao-centro"],
  ["study:chunk:onde-fica", "chunk", "Onde fica...?", "study.onde-fica.ru", "example:estacao-centro"],
] as const;

const nonNounStudyItems: StudyItem[] = studySpecs.map(([id, type, text, translationKey, defaultExampleId]) => {
  if (type === "verb") return { ...base, id, kind: "study-item", target: { type: "lexeme-sense", senseId: `sense:verb:${text}:${id.split(":").at(-1)}`, partOfSpeech: "verb" }, display: { type: "verb", infinitive: text, translationKey }, defaultExampleId, cardEligible: true };
  return { ...base, id, kind: "study-item", target: { type: "chunk", chunkId: `chunk:${id.split(":").slice(2).join("-")}` }, display: { type: "chunk", text, translationKey }, defaultExampleId, cardEligible: true };
});

const nounStudySpecs = [
  ["mesa", "a", "mesas", "as", "стол", "example:ha-mesa-sala"],
  ["caixa", "a", "caixas", "as", "коробка", "example:gato-debaixo-mesa"],
  ["porta", "a", "portas", "as", "дверь", "example:janela-aberta"],
  ["janela", "a", "janelas", "as", "окно", "example:janela-aberta"],
  ["gato", "o", "gatos", "os", "кот", "example:gato-debaixo-mesa"],
  ["chave", "a", "chaves", "as", "ключ", "example:ha-mesa-sala"],
  ["livro", "o", "livros", "os", "книга", "example:janela-aberta"],
  ["sala", "a", "salas", "as", "комната / гостиная", "example:ha-mesa-sala"],
  ["cadeira", "a", "cadeiras", "as", "стул", "example:ha-mesa-sala"],
  ["cama", "a", "camas", "as", "кровать", "example:ha-mesa-sala"],
  ["quarto", "o", "quartos", "os", "спальня", "example:ha-mesa-sala"],
  ["armário", "o", "armários", "os", "шкаф", "example:ha-mesa-sala"],
  ["copo", "o", "copos", "os", "стакан", "example:ha-mesa-sala"],
  ["estação", "a", "estações", "as", "станция", "example:estacao-centro"],
  ["hotel", "o", "hotéis", "os", "отель", "example:estacao-centro"],
  ["farmácia", "a", "farmácias", "as", "аптека", "example:estacao-centro"],
  ["centro", "o", "centros", "os", "центр", "example:estacao-centro"],
] as const;

const nounStudyItems: StudyItem[] = nounStudySpecs.map(([lemma, definiteArticle, plural, pluralDefiniteArticle, , defaultExampleId]) => {
  const slug = lemma.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return { ...base, id: `study:noun:${slug}`, kind: "study-item", target: { type: "lexeme-sense", senseId: `sense:noun:${slug}`, partOfSpeech: "noun" }, display: { type: "noun", lemma, definiteArticle, plural, pluralDefiniteArticle, translationKey: `study.${slug}.ru` }, defaultExampleId, cardEligible: true };
});

export const extraStudyItems: StudyItem[] = [...nonNounStudyItems, ...nounStudyItems];

export const extraContentBlocks: ContentBlock[] = extraExperiences.map((experience) => ({ ...base, id: `block:${experience.id.split(":").slice(2).join("-")}:orientation`, kind: "content-block", blockType: "orientation", bodyKey: `body.${experience.id}`, exampleIds: [] }));

export const extraExerciseItems: ExerciseItem[] = extraExperiences.map((experience) => ({
  ...base, id: experience.activity.id, kind: "exercise-item", definitionId: "exercise-definition:choice", instructionKey: `instruction.${experience.activity.id}`, promptKey: `prompt.${experience.activity.id}`,
  options: experience.activity.options.map((option) => ({ id: `${experience.activity.id}:${option.id}`, text: option.label, ...(option.id === experience.activity.correctOptionId ? {} : { rationaleKey: `rationale.${experience.activity.id}.${option.id}` }) })),
  correctOptionId: `${experience.activity.id}:${experience.activity.correctOptionId}`, targetIds: [experience.activity.targetId], primaryDiagnosticTargetId: experience.activity.targetId, errorCode: experience.activity.errorCode,
}));

const canDoByLesson = new Map(extraExperiences.map((experience, index) => [experience.id, extraCanDos[index].id]));
export const extraExerciseUses: ExerciseUse[] = extraExperiences.map((experience) => ({ id: `use:${experience.activity.id.split(":").slice(1).join(":")}`, exerciseItemId: experience.activity.id, lessonId: experience.id, phaseId: `phase:${experience.id.split(":").slice(2).join("-")}:independent`, phase: "independent", required: true, order: 1 }));

export const extraLessons: Lesson[] = extraExperiences.map((experience, index) => {
  const phaseId = extraExerciseUses[index].phaseId;
  const checkpoint = experience.id.startsWith("checkpoint:");
  const nounTargets = checkpoint ? [] : experience.saveItemIds.filter((id) => id.startsWith("study:noun:")).map((entityId) => ({ entityId, role: "new" as const, countsTowardLexicalLoad: true }));
  return { ...base, id: experience.id, kind: "lesson", lessonType: checkpoint ? "checkpoint" : "route", titleKey: `title.${experience.id}`, estimatedMinutes: { adult: experience.minutes }, primaryCanDoIds: [canDoByLesson.get(experience.id)!], targets: [{ entityId: experience.activity.targetId, role: checkpoint ? "assessment" as const : "new" as const, countsTowardLexicalLoad: false }, ...nounTargets], contentBlockIds: [extraContentBlocks[index].id], exerciseUseIds: [extraExerciseUses[index].id], prerequisiteIds: index === 0 ? ["lesson:a1-1:introduce-yourself"] : [extraExperiences[index - 1].id], flowId: `flow:${experience.id.split(":").slice(2).join("-")}:adult-v1`, completionRule: { requiredPhaseIds: [phaseId], requiredExerciseUseIds: [extraExerciseUses[index].id], minimumIndependentAttempts: 1, completionOnAttempt: true } };
});

export const extraFlows: LessonFlowDefinition[] = extraLessons.map((lesson, index) => ({ id: lesson.flowId, lessonId: lesson.id, schemaVersion: 1, contentRevision: 1, profile: lesson.lessonType === "checkpoint" ? "checkpoint" : (routeLessonExperiences[index + 1].activity.kind === "scene" ? "scene-led" : "route"), entryPhaseId: lesson.completionRule.requiredPhaseIds[0], phases: [{ id: lesson.completionRule.requiredPhaseIds[0], type: "independent-use", contentBlockIds: lesson.contentBlockIds, exerciseUseIds: lesson.exerciseUseIds, targetIds: lesson.targets.map((target) => target.entityId), required: true, safeBoundary: true, estimatedSeconds: 90 }], transitions: [], terminalPhaseId: lesson.completionRule.requiredPhaseIds[0], resumePolicy: { mode: routeLessonExperiences[index + 1].activity.kind === "scene" ? "scene-state" : "phase-boundary", maxAgeDays: 30, onContentRevision: "resume-if-compatible" } }));

export const routeExtensionRu: Record<string, string> = Object.fromEntries([
  ...extraExperiences.flatMap((experience) => [
    [`title.${experience.id}`, experience.title], [`body.${experience.id}`, experience.cue], [`instruction.${experience.activity.id}`, "Выберите ответ."], [`prompt.${experience.activity.id}`, experience.activity.prompt],
    ...experience.activity.options.filter((option) => option.id !== experience.activity.correctOptionId).map((option) => [`rationale.${experience.activity.id}.${option.id}`, "Вернитесь к смысловой опоре и попробуйте ещё раз."]),
  ]),
  ...extraCanDos.flatMap((canDo, index) => [[canDo.statementKey, extraExperiences[index].canDo], [canDo.successCriteriaKeys[0], "Независимое задание выполнено с опубликованными целями урока."]]),
  ["target.ser-estar.title", "Первый смысловой контраст SER и ESTAR"], ["target.noun-number.title", "Число существительного"], ["target.space-under.title", "Пространственное отношение debaixo de"], ["target.ha.title", "Наличие с HÁ"], ["target.ficar-location.title", "FICAR в значении расположения места"],
  ["example.rui-ser-calmo.ru", "Руй спокойный по характеру."], ["example.janela-aberta.ru", "Окно открыто."], ["example.gato-debaixo-mesa.ru", "Кот под столом."], ["example.ha-mesa-sala.ru", "В комнате есть стол."], ["example.estacao-centro.ru", "Станция находится в центре."],
  ["study.ser.ru", "быть: идентичность или характеристика"], ["study.estar.ru", "быть: состояние сейчас"], ["study.onde-esta.ru", "Где находится...?"], ["study.dentro-de.ru", "внутри"], ["study.em-cima-de.ru", "на / сверху"], ["study.debaixo-de.ru", "под"], ["study.ao-lado-de.ru", "рядом с"], ["study.ter.ru", "иметь"], ["study.ha.ru", "Есть..."], ["study.ficar.ru", "находиться, быть расположенным"], ["study.onde-fica.ru", "Где расположено...?"],
  ...nounStudySpecs.map(([lemma, , , , translation]) => [`study.${lemma.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.ru`, translation]),
]);
