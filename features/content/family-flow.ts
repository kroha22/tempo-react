import type {FamilyCardTopic} from "./family-cards.ts";

export const familyFlowPhases=["explanation","words","practice","review"] as const;
export type FamilyFlowPhase=typeof familyFlowPhases[number];
export const familyFlowHref=(topic:FamilyCardTopic="close",phase:FamilyFlowPhase="explanation",related?:string)=>`/learning/family?topic=${topic}&phase=${phase}${related?`&related=${encodeURIComponent(related)}`:""}`;
export const familyFlowTitles={close:"Близкие",relatives:"Родственники"};
export const familyExplanation={
  close:[
    ["A minha família","Моя семья"],
    ["Consigo apresentar os meus familiares e falar da família de outra pessoa. Posso usar uma família imaginária; não preciso de dar informações pessoais.","Я могу представить своих близких и рассказать о семье другого человека. Можно использовать вымышленную семью; личные сведения сообщать не нужно."],
    ["Meu e minha indicam que falo de alguém da minha família. Teu e tua indicam que falo de alguém da tua família, quando trato a outra pessoa por tu.","Meu и minha показывают, что я говорю о ком-то из своей семьи. Teu и tua — о ком-то из твоей семьи, когда обращаюсь к собеседнику на tu."],
    ["A forma concorda com o nome: o meu pai, a minha mãe, o teu irmão, a tua irmã. Tanto a Rita como o Miguel dizem o meu pai: o género de quem fala não muda esta forma.","Форма согласуется с существительным: o meu pai, a minha mãe, o teu irmão, a tua irmã. И Рита, и Мигел говорят o meu pai: род говорящего не меняет эту форму."],
    ["Em português europeu, nestas expressões usamos normalmente o artigo antes do possessivo. Aqui praticamos meu, minha, teu e tua no singular.","В европейском португальском в этих сочетаниях обычно ставим артикль перед притяжательным словом. Здесь тренируем meu, minha, teu и tua в единственном числе."],
    ["Para indicar uma profissão ou um papel, usamos SER: A minha mãe é professora. Para dizer onde alguém está, usamos ESTAR: A minha mãe está em casa.","Чтобы назвать профессию или роль, используем SER: A minha mãe é professora. Чтобы сказать, где человек находится, используем ESTAR: A minha mãe está em casa."],
    ["Avó e avô são palavras diferentes: a avó, as avós; o avô, os avôs. O acento faz parte da palavra.","Avó и avô — разные слова: a avó, as avós; o avô, os avôs. Ударение — часть слова."],
  ],
  relatives:[
    ["Outros familiares","Другие родственники"],
    ["Consigo reconhecer e escrever mais seis palavras sobre a família: tio, tia, primo, prima, filho e filha.","Я могу узнать и написать ещё шесть слов о семье: tio, tia, primo, prima, filho и filha."],
    ["O tio e a tia são familiares, tal como o primo e a prima. Filho e filha não são sinónimos de irmão e irmã.","Дядя и тётя — родственники, как и двоюродные брат и сестра. Сын и дочь — не синонимы брата и сестры."],
    ["O mesmo acordo com o nome continua: o meu tio, a minha tia, o teu primo, a tua prima. Posso ler os exemplos e depois escrever cada palavra com o seu artigo.","Согласование с существительным остаётся тем же: o meu tio, a minha tia, o teu primo, a tua prima. Можно прочитать примеры, а затем написать каждое слово с артиклем."],
    ["A prática deste bloco é a escrita das seis palavras. As frases sobre familiares próximos têm um resultado separado; guardar cartões não conclui nenhum destes exercícios.","Практика этого раздела — письмо шести слов. Фразы о близких имеют отдельный результат; сохранение карточек не завершает эти упражнения."],
  ],
} as const;
export const familyGlossary:Readonly<Record<string,string>>={
  família:"семья",familiares:"родственники",próximos:"близкие",apresentar:"представлять",imaginária:"вымышленная",informações:"сведения",pessoais:"личные",alguém:"кто-то",indicam:"показывают",concorda:"согласуется",nome:"существительное; имя",género:"род",forma:"форма",artigo:"артикль",possessivo:"притяжательное слово",singular:"единственное число",profissão:"профессия",papel:"роль",acento:"ударение; знак ударения",palavras:"слова",escrever:"писать",reconhecer:"узнавать",escrita:"письмо",separado:"отдельный",guardar:"сохранять",cartões:"карточки",substituem:"заменяют",significa:"означает",meu:"мой",minha:"моя",teu:"твой",tua:"твоя",
  mãe:"мама",mães:"мамы",pai:"папа",pais:"папы; родители",irmão:"брат",irmãos:"братья",irmã:"сестра",irmãs:"сёстры",avó:"бабушка",avós:"бабушки; бабушки и дедушки",avô:"дедушка",avôs:"дедушки",tio:"дядя",tia:"тётя",primo:"двоюродный брат",prima:"двоюродная сестра",filho:"сын",filha:"дочь",professora:"учительница",professor:"учитель",médica:"врач (женщина)",médico:"врач",cozinheiro:"повар",cozinheira:"повар (женщина)",engenheiro:"инженер",engenheira:"инженер (женщина)",estudante:"учащийся / учащаяся",
};
