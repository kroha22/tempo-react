import type {FoodCardTopic} from "./food-cards.ts";
export const foodFlowTopics=["fruit","meals","preferences"] as const;
export const foodFlowPhases=["explanation","words","practice","review"] as const;
export type FoodFlowPhase=typeof foodFlowPhases[number];
export const foodFlowHref=(topic:FoodCardTopic="fruit",phase:FoodFlowPhase="explanation",related?:string)=>`/learning/food?topic=${topic}&phase=${phase}${related?`&related=${encodeURIComponent(related)}`:""}`;
export const foodFlowTitles={fruit:"Фрукты",meals:"Продукты и напитки",preferences:"Предпочтения"};
export const foodIntroductions={
  fruit:[
    ["Consigo reconhecer e escrever seis nomes de frutos.","Я могу узнать и написать шесть названий фруктов."],
    ["No dicionário, o nome aparece com o artigo: a maçã, o morango. Podemos ler um exemplo e guardar os cartões que queremos repetir.","В словаре существительное показано с артиклем: a maçã, o morango. Можно прочитать пример и сохранить нужные карточки для повторения."],
    ["A maçã tem o plural as maçãs. Depois de estudar as palavras, escrevemos as seis palavras do conjunto. As preferências ficam no terceiro bloco.","У a maçã множественное число as maçãs. После изучения напишем шесть слов набора. Предпочтения будут в третьем разделе."],
  ],
  meals:[
    ["Consigo reconhecer e escrever oito nomes de alimentos e bebidas.","Я могу узнать и написать восемь названий продуктов и напитков."],
    ["Quando falamos de leite, água, arroz ou carne como alimentos, usamos normalmente o singular. O plural pode indicar tipos, pratos ou unidades, conforme o contexto.","Когда говорим о молоке, воде, рисе или мясе как продуктах, обычно используем единственное число. Множественное число может обозначать виды, блюда или отдельные единицы — в зависимости от контекста."],
    ["Aqui, peixe e frango aparecem como comida. Lemos os exemplos antes de escrever as oito palavras. Guardar um cartão não conclui o exercício.","Здесь peixe и frango — еда. Перед письмом восьми слов прочитаем примеры. Сохранение карточки не завершает упражнение."],
  ],
} as const;
export const foodGlossary:Readonly<Record<string,string>>={
  frutos:"фрукты",nomes:"названия; существительные",alimentos:"продукты",bebidas:"напитки",dicionário:"словарь",artigo:"артикль",plural:"множественное число",singular:"единственное число",reconhecer:"узнавать",escrever:"писать",guardar:"сохранять",cartões:"карточки",repetir:"повторять",conjunto:"набор",preferências:"предпочтения",tipos:"виды",pratos:"блюда",unidades:"отдельные единицы",contexto:"контекст",comida:"еда",conclui:"завершает",exercício:"упражнение",normalmente:"обычно",
  maçã:"яблоко",maçãs:"яблоки",banana:"банан",bananas:"бананы",laranja:"апельсин",laranjas:"апельсины",pera:"груша",peras:"груши",morango:"клубника",morangos:"клубника; ягоды клубники",melancia:"арбуз",melancias:"арбузы",pão:"хлеб",pães:"хлебы",leite:"молоко",água:"вода",queijo:"сыр",arroz:"рис",peixe:"рыба как еда",carne:"мясо",frango:"куриное мясо",
  gostar:"любить; нравиться (GOSTAR DE)","gostar de":"любить что-либо","gosto de":"я люблю","gostas de":"ты любишь","gosta de":"ему/ей нравится; он/она любит",
};
