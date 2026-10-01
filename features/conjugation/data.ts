export type PersonKey = "eu" | "tu" | "ele" | "nos" | "voces" | "eles";
export type Tense = "present" | "past";
export type VerbGroup = "ar" | "er" | "ir" | "irregular";
export type Forms = Record<PersonKey, string>;

export type Person = {
  key: PersonKey;
  label: string;
  angle: number;
};

export type ConjugationVerb = {
  infinitive: string;
  translation: string;
  accent: string;
  group: VerbGroup;
  forms: Record<Tense, Forms>;
};

export const people: Person[] = [
  { key: "eu", label: "Eu", angle: -90 },
  { key: "tu", label: "Tu", angle: -30 },
  { key: "ele", label: "Ele / ela", angle: 30 },
  { key: "nos", label: "Nós", angle: 90 },
  { key: "voces", label: "Vocês", angle: 150 },
  { key: "eles", label: "Eles / elas", angle: 210 },
];

const regularEndings: Record<Exclude<VerbGroup, "irregular">, Record<Tense, Forms>> = {
  ar: {
    present: { eu: "o", tu: "as", ele: "a", nos: "amos", voces: "am", eles: "am" },
    past: { eu: "ei", tu: "aste", ele: "ou", nos: "ámos", voces: "aram", eles: "aram" },
  },
  er: {
    present: { eu: "o", tu: "es", ele: "e", nos: "emos", voces: "em", eles: "em" },
    past: { eu: "i", tu: "este", ele: "eu", nos: "emos", voces: "eram", eles: "eram" },
  },
  ir: {
    present: { eu: "o", tu: "es", ele: "e", nos: "imos", voces: "em", eles: "em" },
    past: { eu: "i", tu: "iste", ele: "iu", nos: "imos", voces: "iram", eles: "iram" },
  },
};

function regularForms(
  infinitive: string,
  group: Exclude<VerbGroup, "irregular">,
  overrides: Partial<Record<Tense, Partial<Forms>>> = {},
): Record<Tense, Forms> {
  const stem = infinitive.slice(0, -2);
  const build = (tense: Tense): Forms => Object.fromEntries(
    people.map(({ key }) => [key, overrides[tense]?.[key] ?? `${stem}${regularEndings[group][tense][key]}`]),
  ) as Forms;

  return { present: build("present"), past: build("past") };
}

function regularVerb(
  infinitive: string,
  translation: string,
  accent: string,
  group: Exclude<VerbGroup, "irregular">,
  overrides?: Partial<Record<Tense, Partial<Forms>>>,
): ConjugationVerb {
  return { infinitive, translation, accent, group, forms: regularForms(infinitive, group, overrides) };
}

function irregularVerb(
  infinitive: string,
  translation: string,
  accent: string,
  forms: Record<Tense, Forms>,
): ConjugationVerb {
  return { infinitive, translation, accent, group: "irregular", forms };
}

export const verbs = {
  falar: regularVerb("falar", "говорить", "#f7c64c", "ar"),
  estudar: regularVerb("estudar", "учиться", "#f3a66f", "ar"),
  trabalhar: regularVerb("trabalhar", "работать", "#e8a5bd", "ar"),
  reparar: regularVerb("reparar", "ремонтировать", "#ef765d", "ar"),
  montar: regularVerb("montar", "собирать", "#db5f47", "ar"),
  criar: regularVerb("criar", "создавать", "#f0985f", "ar"),
  comer: regularVerb("comer", "есть", "#88c9e0", "er"),
  beber: regularVerb("beber", "пить", "#80cbb2", "er"),
  aprender: regularVerb("aprender", "учить", "#b9afe8", "er"),
  viver: regularVerb("viver", "жить", "#66b985", "er"),
  crescer: regularVerb("crescer", "расти", "#76c46b", "er", { present: { eu: "cresço" } }),
  compreender: regularVerb("compreender", "понимать", "#89c178", "er"),
  partir: regularVerb("partir", "уезжать", "#93c8ec", "ir"),
  abrir: regularVerb("abrir", "открывать", "#a7d17f", "ir"),
  assistir: regularVerb("assistir", "смотреть", "#ddaaea", "ir"),
  descobrir: regularVerb("descobrir", "открывать, обнаруживать", "#5ea8dc", "ir", { present: { eu: "descubro" } }),
  decidir: regularVerb("decidir", "решать", "#6c9fd3", "ir"),
  transmitir: regularVerb("transmitir", "передавать", "#778ed3", "ir"),
  ir: irregularVerb("ir", "идти", "#8fd3bd", {
    present: { eu: "vou", tu: "vais", ele: "vai", nos: "vamos", voces: "vão", eles: "vão" },
    past: { eu: "fui", tu: "foste", ele: "foi", nos: "fomos", voces: "foram", eles: "foram" },
  }),
  fazer: irregularVerb("fazer", "делать", "#ffc247", {
    present: { eu: "faço", tu: "fazes", ele: "faz", nos: "fazemos", voces: "fazem", eles: "fazem" },
    past: { eu: "fiz", tu: "fizeste", ele: "fez", nos: "fizemos", voces: "fizeram", eles: "fizeram" },
  }),
  ter: irregularVerb("ter", "иметь", "#d89b3f", {
    present: { eu: "tenho", tu: "tens", ele: "tem", nos: "temos", voces: "têm", eles: "têm" },
    past: { eu: "tive", tu: "tiveste", ele: "teve", nos: "tivemos", voces: "tiveram", eles: "tiveram" },
  }),
  ficar: regularVerb("ficar", "находиться; оставаться", "#e18a50", "ar", { past: { eu: "fiquei" } }),
  dizer: irregularVerb("dizer", "говорить", "#ff9c7a", {
    present: { eu: "digo", tu: "dizes", ele: "diz", nos: "dizemos", voces: "dizem", eles: "dizem" },
    past: { eu: "disse", tu: "disseste", ele: "disse", nos: "dissemos", voces: "disseram", eles: "disseram" },
  }),
  ser: irregularVerb("ser", "быть: кто или что", "#b884d6", {
    present: { eu: "sou", tu: "és", ele: "é", nos: "somos", voces: "são", eles: "são" },
    past: { eu: "fui", tu: "foste", ele: "foi", nos: "fomos", voces: "foram", eles: "foram" },
  }),
  estar: irregularVerb("estar", "быть: как или где", "#55b9b5", {
    present: { eu: "estou", tu: "estás", ele: "está", nos: "estamos", voces: "estão", eles: "estão" },
    past: { eu: "estive", tu: "estiveste", ele: "esteve", nos: "estivemos", voces: "estiveram", eles: "estiveram" },
  }),
} satisfies Record<string, ConjugationVerb>;

export type VerbKey = keyof typeof verbs;
export const allVerbKeys = Object.keys(verbs) as VerbKey[];
