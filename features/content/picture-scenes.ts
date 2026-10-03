import type { VocabularyGroup, VocabularyWord } from "./vocabulary-model";
import type { ImageMatchingDefinition } from "../practice/image-matching";
import { publicAssetPath } from "./public-asset.ts";

// Positions are percentages of the full illustration; each source scene has its own targets.
type Target = [label: string, translation: string, x: number, y: number];
type Scene = { id: string; title: string; targets: Target[] };
export const pictureScenes: Scene[] = [
  { id: "street", title: "На нашей улице", targets: [["a casa","Дом",10,33],["a escola","Школа",27,31],["a loja","Магазин",50,40],["a farmácia","Аптека",66,34],["o café","Кафе",86,31],["a rua","Улица",43,67],["o autocarro","Автобус",67,75],["a paragem","Остановка",91,79]] },
  { id: "beach", title: "На пляже", targets: [["o barco","Лодка",22,33],["o mar","Море",44,42],["o guarda-sol","Пляжный зонт",82,12],["a areia","Песок",12,78],["o balde","Ведро",52,79],["a toalha","Полотенце",87,76]] },
  { id: "garden", title: "В саду", targets: [["a árvore","Дерево",10,35],["a borboleta","Бабочка",64,27],["a abelha","Пчела",75,43],["a flor","Цветок",59,63],["o caracol","Улитка",89,77],["a folha","Лист",74,88],["a relva","Трава",13,89]] },
  { id: "rain", title: "Под дождём", targets: [["a nuvem","Облако",79,12],["a chuva","Дождь",90,38],["o vento","Ветер",21,43],["o guarda-chuva","Зонт",57,28],["o casaco","Куртка",43,58],["as botas","Сапоги",42,81],["a poça","Лужа",63,89]] },
  { id: "weather", title: "После дождя", targets: [["a nuvem","Облако",53,10],["o vento","Ветер",60,23],["a chuva","Дождь",89,29],["o guarda-chuva","Зонт",55,64],["o casaco","Куртка",42,56],["as botas","Сапоги",41,82],["a poça","Лужа",77,90]] },
  { id: "farm", title: "На ферме", targets: [["a vaca","Корова",16,32],["o cavalo","Лошадь",39,26],["o gato","Кот",87,29],["o porco","Свинья",13,56],["a ovelha","Овца",46,57],["a galinha","Курица",18,76],["o pato","Утка",80,76]] },
  { id: "market", title: "На рынке", targets: [["a maçã","Яблоко",47,46],["a banana","Банан",68,47],["a laranja","Апельсин",91,46],["a cesta","Корзина",35,69],["o tomate","Помидор",51,71],["a batata","Картофель",70,74],["a cenoura","Морковь",93,73]] },
  { id: "school", title: "Собираемся в школу", targets: [["a mochila","Рюкзак",23,38],["o caderno","Тетрадь",47,70],["o lápis","Карандаш",65,70],["a caneta","Ручка",75,74],["o livro","Книга",21,65],["a borracha","Ластик",62,85],["a régua","Линейка",84,84]] },
  { id: "breakfast", title: "За завтраком", targets: [["a cadeira","Стул",16,30],["o leite","Молоко",65,46],["o pão","Хлеб",82,57],["a mesa","Стол",13,68],["o prato","Тарелка",42,54],["a chávena","Чашка",29,73],["a colher","Ложка",55,79],["o ovo","Яйцо",76,75]] },
  { id: "park", title: "В парке", targets: [["o parque","Парк",27,32],["o pássaro","Птица",71,9],["a árvore","Дерево",65,34],["o banco","Скамейка",50,56],["a bicicleta","Велосипед",87,57],["o cão","Собака",25,70],["a bola","Мяч",49,75]] },
];
const wordId = (label: string) => `scene-word:${label.normalize("NFD").replace(/\p{M}/gu, "").replaceAll(" ", "-")}`;
export const sceneWords: VocabularyWord[] = [...new Map(pictureScenes.flatMap(scene => scene.targets.map(([label, translation]) => [wordId(label), { id: wordId(label), label, translation }] as const))).values()];
export const sceneImageActivities: ImageMatchingDefinition[] = pictureScenes.map(scene => ({
  id: `image-${scene.id}`, title: scene.title, titleLang: "ru",
  image: { src: publicAssetPath(`/images/scenes/${scene.id}.webp`), alt: `Иллюстрация к заданию «${scene.title}»`, width: 1448, height: 1086, crop: { x: 0, y: 0, width: 1448, height: 1086 } },
  wordIds: scene.targets.map(([label]) => wordId(label)),
  spots: scene.targets.map(([label,,x,y], index) => ({ id: `${scene.id}-${index}`, x: x * 14.48, y: y * 10.86, acceptedWordIds: [wordId(label)] })),
}));
export const scenesGroup: VocabularyGroup = {
  id: "vocabulary-scenes", title: "Мир в картинках", imageActivityIds: sceneImageActivities.map(image => image.id),
  subgroups: pictureScenes.map(scene => ({ id: `scene-${scene.id}`, title: scene.title, sets: [{ id: `scene-set-${scene.id}`, title: scene.title, words: scene.targets.map(([label]) => wordId(label)) }] })),
};
