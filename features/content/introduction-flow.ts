import {legacyCardGroups} from "./legacy-cards.ts";
import {gramaticaVocabulary} from "./gramatica-vocabulary.ts";
import {grammarReadingGlossary} from "./grammar-reading.ts";
import {readingCardChoices} from "./reading-cards.ts";

// Presentation metadata only. These are the original introduction and U01 owners.
export const introductionPhases=["explanation","words","practice","review"] as const;
export type IntroductionPhase=typeof introductionPhases[number];
export const introductionHref=(phase:IntroductionPhase="explanation",related?:string)=>`/learning/introduction?phase=${phase}${related?`&related=${encodeURIComponent(related)}`:""}`;
export const introductionFamilyHref=(related?:string)=>`${introductionHref("practice",related)}&activity=family`;
export const introductionCards=legacyCardGroups.find(group=>group.id==="intro")!;
export const introductionExplanation=[
  {pt:"Posso cumprimentar outra pessoa, dizer o meu nome e perguntar o nome e a origem dela.",ru:"Я могу поздороваться, назвать своё имя и спросить имя и происхождение собеседника."},
  {pt:"Para dizer o nome, uso «Chamo-me…». Para falar da origem ou da profissão, uso SER: «Sou de Portugal. Sou estudante.».",ru:"Чтобы назвать имя, использую готовую формулу Chamo-me… — «Меня зовут…». Для происхождения или профессии использую SER: Sou de Portugal — «Я из Португалии»; Sou estudante — «Я учащийся / учащаяся»."},
  {pt:"Para perguntar como a pessoa está agora, uso ESTAR: «Como estás?» — «Estou bem, obrigada. E tu?». Para terminar a conversa, posso dizer «Até amanhã!».",ru:"Чтобы спросить о состоянии сейчас, использую ESTAR: Como estás? — «Как ты?»; Estou bem, obrigada. E tu? — «У меня всё хорошо, спасибо. А ты?». Здесь отвечает женщина; мужчина говорит obrigado. Завершить разговор можно фразой Até amanhã! — «До завтра!»."},
] as const;
export const introductionGlossary={cumprimentar:"здороваться; приветствовать",perguntar:"спрашивать",origem:"происхождение",profissão:"профессия",estudante:"учащийся / учащаяся",agora:"сейчас",terminar:"заканчивать",conversa:"разговор",amanhã:"завтра",obrigada:"спасибо (говорит женщина)",obrigado:"спасибо (говорит мужчина)"};
// Include every existing save target offered by the reading hints, not just U01.
const readingText=introductionExplanation.map(row=>row.pt).join(" ").toLocaleLowerCase("pt-PT");
const readingTargets=Object.keys(grammarReadingGlossary).filter(form=>{
  const escaped=form.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  return new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`,"iu").test(readingText);
}).flatMap(form=>readingCardChoices(form).map(choice=>choice.studyItemId));
export const introductionStudyItemIds=[...new Set([...introductionCards.ids,...gramaticaVocabulary.filter(word=>word.units.includes(1)).map(word=>word.studyItemId),...readingTargets])];
