import type {PrepText} from "./test-preparation";
import {calendarMonths} from "./calendar";

export const preparationSheets=[
  {number:1,title:["Regras de boa convivência","Правила общения"],color:"Зелёный",printed:"As regras de boa convivência"},
  {number:2,title:["O corpo humano","Тело человека"],color:"Зелёный",printed:"Os ossos e os músculos / Os principais órgãos do corpo humano"},
  {number:3,title:["Saúde e bem-estar","Здоровье и самочувствие"],color:"Зелёный",printed:"A vacinação e o uso de medicamentos / O bem-estar"},
] as const;

// Recognition/review supports from these lessons. Catalog words are resolved to their existing IDs in the view.
export const preparationKeywords:Readonly<Record<string,readonly PrepText[]>>={
  letters:[["o alfabeto","алфавит"],["a vogal","гласная буква"],["a consoante","согласная буква"],["a letra","буква"],["o som","звук"],["a sílaba","слог"]],
  "r-rr":[["caro","дорогой"],["o carro","машина"],["o rato","мышь"],["o coração","сердце"]],
  "s-ss":[["a casa","дом"],["a massa","макароны"],["a rosa","роза"],["o dinossauro","динозавр"]],
  "c-cedilla":[["a cidade","город"],["a cabeça","голова"],["o açúcar","сахар"],["a cereja","вишня"]],
  "s-z":[["o lápis","карандаш"],["o vestido","платье"],["a luz","свет"],["a noz","грецкий орех"]],
  "g-gu":[["o gelo","лёд"],["a girafa","жираф"],["o foguete","ракета"],["a guitarra","гитара"]],
  nasal:[["o campo","поле"],["o dente","зуб"],["o tambor","барабан"],["o vento","ветер"]],
  digraphs:[["o ninho","гнездо"],["a folha","лист"],["a chuva","дождь"],["a galinha","курица"]],
  "x-sounds":[["o peixe","рыба"],["o exame","экзамен"],["próximo","следующий"],["o táxi","такси"]],
  clusters:[["o braço","рука"],["o prato","тарелка"],["a flor","цветок"],["o livro","книга"]],
  hours:[["o relógio","часы"],["a hora","час"],["o minuto","минута"],["o dia","сутки"]],
  months:calendarMonths,
  "ordinals-first":[["primeiro","первый"],["terceiro","третий"],["quinto","пятый"],["décimo","десятый"]],
  "ordinals-last":[["anterior","предыдущий"],["sucessor","следующий по порядку"],["vigésimo","двадцатый"],["a meta","финиш"]],
  cooperation:[["o diálogo","диалог"],["a negociação","переговоры"],["o compromisso","договорённость"],["a solução","решение"]],
  bones:[["o osso","кость"],["o músculo","мышца"],["o esqueleto","скелет"],["o tendão","сухожилие"]],
  organs:[["o coração","сердце"],["os pulmões","лёгкие"],["o estômago","желудок"],["o rim","почка"]],
  prevention:[["a vacina","вакцина"],["o medicamento","лекарство"],["a bactéria","бактерия"],["o vírus","вирус"]],
  wellbeing:[["a higiene","гигиена"],["o descanso","отдых"],["a alimentação","питание"],["o exercício","упражнение"]],
  timeline:[["o ano","год"],["antes","до, раньше"],["depois","после, позже"],["o acontecimento","событие"]],
};
