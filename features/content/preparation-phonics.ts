/** Each marked segment is removed once; translations disambiguate caro/carro, etc. */
export type PhonicsWord={word:string;meaning:string;segment:string;group:string};
type Entry=readonly [word:string,meaning:string,segment:string,group?:string];
const bank=(entries:readonly Entry[]):PhonicsWord[]=>entries.map(([word,meaning,segment,group])=>({word,meaning,segment,group:group??segment}));
export const preparationPhonics:Readonly<Record<string,readonly PhonicsWord[]>>={
  "r-rr":bank([["caro","дорогой","r"],["carro","машина","rr"],["pera","груша","r"],["terra","земля","rr"],["barata","таракан","r"],["barraca","палатка","rr"],["coração","сердце","r"],["correr","бежать","rr"],["rato","мышь","r"],["rua","улица","r"],["garrafa","бутылка","rr"],["cachorro","щенок","rr"]]),
  "s-ss":bank([["casa","дом","s"],["massa","макароны","ss"],["rosa","роза","s"],["pássaro","птица","ss"],["mesa","стол","s"],["osso","кость","ss"],["camisa","рубашка","s"],["pessoa","человек","ss"]]),
  "c-cedilla":bank([["cidade","город","c"],["cereja","вишня","c"],["cinema","кинотеатр","c"],["cenoura","морковь","c"],["cabeça","голова","ç"],["açúcar","сахар","ç"],["laço","бант","ç"],["coração","сердце","ç"]]),
  "s-z":bank([["vestido","платье","s"],["escola","школа","s"],["lápis","карандаш","s"],["festa","праздник","s"],["luz","свет","z"],["noz","грецкий орех","z"],["azul","синий","z"],["dez","десять","z"]]),
  "g-gu":bank([["gelo","лёд","g"],["girafa","жираф","g"],["gema","желток","g"],["gigante","великан","g"],["guitarra","гитара","gu"],["foguete","ракета","gu"],["guerra","война","gu"],["guia","гид","gu"]]),
  nasal:bank([["campo","поле","m"],["tambor","барабан","m"],["tempo","время","m"],["sombra","тень","m"],["dente","зуб","n"],["vento","ветер","n"],["ponte","мост","n"],["mundo","мир","n"]]),
  digraphs:bank([["ninho","гнездо","nh"],["galinha","курица","nh"],["banho","купание","nh"],["folha","лист","lh"],["olho","глаз","lh"],["milho","кукуруза","lh"],["chuva","дождь","ch"],["chave","ключ","ch"],["mochila","рюкзак","ch"]]),
  "x-sounds":bank([["peixe","рыба","x","ch"],["caixa","коробка","x","ch"],["ameixa","слива","x","ch"],["exame","экзамен","x","z"],["exemplo","пример","x","z"],["próximo","следующий","x","s"],["máximo","максимальный","x","s"],["táxi","такси","x","c + s"],["fixo","неподвижный","x","c + s"]]),
  clusters:bank([["braço","рука","br"],["cravo","гвоздика","cr"],["dragão","дракон","dr"],["fruta","фрукт","fr"],["grilo","сверчок","gr"],["prato","тарелка","pr"],["três","три","tr"],["livro","книга","vr"],["bloco","блок","bl"],["claro","светлый","cl"],["flor","цветок","fl"],["globo","глобус","gl"],["planta","растение","pl"]]),
};
