/** Explicit editorial decisions. No identity is inferred from a Russian gloss. */
export type WordClass = "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "determiner" | "particle" | "chunk";
export type VocabularyDecision = {
  surfaces: string[]; lemma: string; partOfSpeech: WordClass; sense: string;
  translation?: string; example: { pt: string; ru: string }; units?: number[];
  noun?: { article: "o" | "a"; plural: string; pluralArticle: "os" | "as"; pluralOnly?: boolean };
  forms?: string[]; government?: string; existingStudyItemId?: string;
};
const lines = (text: string) => text.trim().split("\n").map((line) => line.split("|"));

const nouns = lines(`
médico|o|médicos|O médico trabalha aqui.|Врач работает здесь.
enfermeiro|o|enfermeiros|O enfermeiro está no hospital.|Медбрат в больнице.
professor|o|professores|O professor chegou.|Учитель пришёл.
brasileiro|o|brasileiros|O Paulo é brasileiro.|Паулу — бразилец.
amigo|o|amigos|O meu amigo chegou.|Мой друг пришёл.
casa|a|casas|A casa é pequena.|Дом маленький.
escola|a|escolas|A escola fica aqui.|Школа находится здесь.
frio|o|frios|Tenho frio.|Мне холодно.
irmão|o|irmãos|O meu irmão estuda.|Мой брат учится.
irmã|a|irmãs|A minha irmã trabalha.|Моя сестра работает.
filho|o|filhos|O meu filho está em casa.|Мой сын дома.
filha|a|filhas|A minha filha está na escola.|Моя дочь в школе.
idade|a|idades|Que idade tens?|Сколько тебе лет?
fome|a|fomes|Tenho fome.|Я голоден / голодна.
sede|a|sedes|Tenho sede.|Я хочу пить.
medo|o|medos|Tenho medo.|Мне страшно.
tempo|o|tempos|Hoje não tenho tempo.|Сегодня у меня нет времени.
noite|a|noites|A noite está fria.|Ночь холодная.
cinema|o|cinemas|Vamos ao cinema.|Пойдём в кино.
festa|a|festas|A festa começa às oito.|Вечеринка начинается в восемь.
viagem|a|viagens|A viagem foi longa.|Поездка была долгой.
almoço|o|almoços|O almoço está pronto.|Обед готов.
negócio|o|negócios|O negócio corre bem.|Дела идут хорошо.
presente|o|presentes|Este presente é para ti.|Этот подарок для тебя.
aniversário|o|aniversários|Hoje é o meu aniversário.|Сегодня мой день рождения.
filme|o|filmes|O filme já acabou.|Фильм уже закончился.
acidente|o|acidentes|Houve um acidente.|Произошла авария.
convite|o|convites|Recebi um convite.|Я получил(а) приглашение.
notícia|a|notícias|Tenho uma notícia.|У меня есть новость.
livro|o|livros|Estou a ler um livro.|Я читаю книгу.
campo|o|campos|Ela vive no campo.|Она живёт в сельской местности.
boneca|a|bonecas|A boneca está na cama.|Кукла на кровати.
óculos|o|óculos|Os meus óculos estão na mesa.|Мои очки на столе.
meia-noite|a|meias-noites|Era meia-noite.|Была полночь.
telefone|o|telefones|O telefone tocou.|Зазвонил телефон.
informação|a|informações|Preciso de uma informação.|Мне нужна информация.
castelo|o|castelos|O castelo fica no centro.|Замок находится в центре.
inscrição|a|inscrições|A inscrição está feita.|Регистрация завершена.
turista|o|turistas|O turista pediu ajuda.|Турист попросил помощи.
futuro|o|futuros|Penso no futuro.|Я думаю о будущем.
ajuda|a|ajudas|Preciso de ajuda.|Мне нужна помощь.
hipótese|a|hipóteses|É uma hipótese.|Это предположение.
barulho|o|barulhos|Há muito barulho.|Очень шумно.
intenção|a|intenções|Tenho a intenção de estudar.|Я намерен(а) учиться.
convicção|a|convicções|É a minha convicção.|Это моё убеждение.
bilhete|o|bilhetes|Comprei um bilhete.|Я купил(а) билет.
estrada|a|estradas|A estrada está fechada.|Дорога закрыта.
anúncio|o|anúncios|Li o anúncio.|Я прочитал(а) объявление.
apartamento|o|apartamentos|O apartamento é pequeno.|Квартира маленькая.
carro|o|carros|O carro está na rua.|Машина на улице.
cidade|a|cidades|A cidade é bonita.|Город красивый.
caneta|a|canetas|Escrevo com uma caneta.|Я пишу ручкой.
mesa|a|mesas|O livro está na mesa.|Книга на столе.
país|o|países|Portugal é um país europeu.|Португалия — европейская страна.
camisola|a|camisolas|A camisola é verde.|Кофта зелёная.
caderno|o|cadernos|O caderno está na mochila.|Тетрадь в рюкзаке.
restaurante|o|restaurantes|O restaurante está aberto.|Ресторан открыт.
revista|a|revistas|Leio uma revista.|Я читаю журнал.
encomenda|a|encomendas|A encomenda chegou.|Посылка пришла.
recado|o|recados|Deixei um recado.|Я оставил(а) сообщение.
chave|a|chaves|A chave está aqui.|Ключ здесь.
cadeira|a|cadeiras|A cadeira está ao lado da mesa.|Стул стоит рядом со столом.
manhã|a|manhãs|A manhã está fria.|Утро холодное.
tarde|a|tardes|Esta tarde vou estudar.|Сегодня днём я буду заниматься.
semana|a|semanas|Esta semana trabalho em casa.|На этой неделе я работаю дома.
mês|o|meses|O mês já acabou.|Месяц уже закончился.
ano|o|anos|O ano começa em janeiro.|Год начинается в январе.
calor|o|calores|Hoje está calor.|Сегодня жарко.
trabalho|o|trabalhos|Tenho muito trabalho.|У меня много работы.
`);
const verbs = lines(`
ler|Estou a ler.|Я читаю.
comer|Quero comer.|Я хочу есть.
chover|Está a chover.|Идёт дождь.
nevar|Está a nevar.|Идёт снег.
trabalhar|Trabalho em casa.|Я работаю дома.
conversar|Gosto de conversar.|Я люблю беседовать.
escrever|Estou a escrever.|Я пишу.
estudar|Estudo português.|Я учу португальский.
telefonar|Vou telefonar à Ana.|Я позвоню Ане.
falar|Falo português.|Я говорю по-португальски.
morar|Moro no Porto.|Я живу в Порту.
jogar|Gosto de jogar futebol.|Я люблю играть в футбол.
comprar|Vou comprar um livro.|Я куплю книгу.
levantar|Podes levantar a caixa?|Можешь поднять коробку?
beber|Quero beber água.|Я хочу пить воду.
aprender|Quero aprender português.|Я хочу выучить португальский.
viver|Vivo em Lisboa.|Я живу в Лиссабоне.
receber|Recebi uma carta.|Я получил(а) письмо.
conhecer|Conheço a Ana.|Я знаком(а) с Аной.
compreender|Compreendo a pergunta.|Я понимаю вопрос.
ver|Vejo o mar.|Я вижу море.
fazer|Estou a fazer o jantar.|Я готовлю ужин.
dizer|O que queres dizer?|Что ты хочешь сказать?
trazer|Vou trazer o livro.|Я принесу книгу.
poder|Posso ajudar.|Я могу помочь.
perder|Não quero perder a chave.|Я не хочу потерять ключ.
querer|Quero uma água.|Я хочу воды.
pôr|Vou pôr o livro na mesa.|Я положу книгу на стол.
abrir|Vou abrir a janela.|Я открою окно.
vestir|Vou vestir o casaco.|Я надену пальто.
sentir|Sinto frio.|Я чувствую холод.
partir|O comboio vai partir.|Поезд отправится.
preferir|Prefiro água.|Я предпочитаю воду.
conseguir|Consegui acabar o trabalho.|Мне удалось закончить работу.
decidir|Decidi ficar em casa.|Я решил(а) остаться дома.
corrigir|Vou corrigir o erro.|Я исправлю ошибку.
discutir|Vamos discutir o problema.|Мы обсудим проблему.
ir|Vou à escola.|Я иду в школу.
vir|Ela vem amanhã.|Она придёт завтра.
pedir|Vou pedir ajuda.|Я попрошу помощи.
dormir|Quero dormir.|Я хочу спать.
subir|Vou subir as escadas.|Я поднимусь по лестнице.
fugir|O gato fugiu.|Кот убежал.
rir|Ela começou a rir.|Она начала смеяться.
sair|Vou sair agora.|Я сейчас выйду.
cair|O livro caiu.|Книга упала.
acordar|Acordo às sete.|Я просыпаюсь в семь.
almoçar|Vou almoçar em casa.|Я пообедаю дома.
jantar|Estamos a jantar.|Мы ужинаем.
nascer|Nasci no Porto.|Я родился / родилась в Порту.
ficar|Vou ficar em casa.|Я останусь дома.
passar|Gosto de passar tempo contigo.|Я люблю проводить с тобой время.
levantar-se|Levanto-me cedo.|Я рано встаю.
deitar-se|Deito-me às dez.|Я ложусь в десять.
sentar-se|Ela sentou-se.|Она села.
chamar-se|Chamo-me Ana.|Меня зовут Ана.
encontrar-se|Encontramo-nos amanhã.|Мы встретимся завтра.
lavar-se|Ela está a lavar-se.|Она моется.
lembrar-se|Lembro-me de ti.|Я помню о тебе.
esquecer-se|Esqueci-me do livro.|Я забыл(а) книгу.
brincar|As crianças estão a brincar.|Дети играют.
costumar|Costumo ler à noite.|Обычно я читаю вечером.
viajar|Gosto de viajar.|Я люблю путешествовать.
usar|Uso óculos.|Я ношу очки.
preparar|Estou a preparar o almoço.|Я готовлю обед.
arrumar|Vou arrumar o quarto.|Я приберу комнату.
tocar|O telefone tocou.|Зазвонил телефон.
entrar|Ela entrou em casa.|Она вошла в дом.
chegar|Cheguei cedo.|Я пришёл / пришла рано.
acontecer|O que aconteceu?|Что случилось?
ajudar|Quero ajudar.|Я хочу помочь.
acabar|Acabei o trabalho.|Я закончил(а) работу.
encontrar|Encontrei a Ana.|Я встретил(а) Ану.
convidar|Vou convidar os meus amigos.|Я приглашу друзей.
fechar|Vou fechar a porta.|Я закрою дверь.
esperar|Estou a esperar pelo autocarro.|Я жду автобус.
olhar|Ela está a olhar para o mar.|Она смотрит на море.
virar|O carro virou à direita.|Машина повернула направо.
correr|Gosto de correr.|Я люблю бегать.
esquecer|Esqueci o nome.|Я забыл(а) имя.
parar|O carro parou.|Машина остановилась.
mexer|Não quero mexer nisso.|Я не хочу это трогать.
destruir|O fogo destruiu a casa.|Огонь разрушил дом.
andar|Gosto de andar a pé.|Я люблю ходить пешком.
chorar|A criança está a chorar.|Ребёнок плачет.
vender|Vou vender o carro.|Я продам машину.
existir|Esse problema existe.|Эта проблема существует.
dever|Devo estudar mais.|Мне следует больше заниматься.
construir|Estão a construir uma casa.|Они строят дом.
descobrir|Descobri uma cidade bonita.|Я открыл(а) для себя красивый город.
publicar|Ela publicou um livro.|Она опубликовала книгу.
organizar|Vamos organizar uma festa.|Мы устроим вечеринку.
contar|Vou contar uma história.|Я расскажу историю.
perguntar|Vou perguntar à Ana.|Я спрошу Ану.
responder|Vou responder à pergunta.|Я отвечу на вопрос.
pertencer|O livro pertence à Ana.|Книга принадлежит Ане.
levar|Vou levar o livro.|Я возьму книгу с собой.
chamar|Vou chamar o Rui.|Я позову Руя.
dar|Vou dar o livro à Ana.|Я дам книгу Ане.
enviar|Vou enviar uma carta.|Я отправлю письмо.
emprestar|Podes emprestar-me o livro?|Можешь одолжить мне книгу?
oferecer|Vou oferecer um livro à Ana.|Я подарю Ане книгу.
mandar|Vou mandar uma mensagem.|Я пошлю сообщение.
voltar|Vou voltar amanhã.|Я вернусь завтра.
começar|A aula vai começar.|Урок начнётся.
`);
const adjectives = lines(`
casado|casada|A Ana é casada.|Ана замужем.
solteiro|solteira|O Rui é solteiro.|Руй не женат.
inteligente|inteligente|Ela é inteligente.|Она умная.
contente|contente|Estou contente.|Я доволен / довольна.
triste|triste|Ela está triste.|Ей грустно.
pronto|pronta|O jantar está pronto.|Ужин готов.
limpo|limpa|O quarto está limpo.|Комната чистая.
sujo|suja|O carro está sujo.|Машина грязная.
aberto|aberta|O restaurante está aberto.|Ресторан открыт.
fechado|fechada|A porta está fechada.|Дверь закрыта.
doente|doente|Estou doente.|Я болен / больна.
cansado|cansada|Estou cansado.|Я устал.
novo|nova|O livro é novo.|Книга новая.
velho|velha|O carro é velho.|Машина старая.
salgado|salgada|O almoço está salgado.|Обед пересолен.
azedo|azeda|O leite está azedo.|Молоко кислое.
pequeno|pequena|A casa é pequena.|Дом маленький.
proibido|proibida|É proibido fumar.|Курить запрещено.
permitido|permitida|É permitido entrar.|Вход разрешён.
feito|feita|O trabalho está feito.|Работа сделана.
pago|paga|O almoço está pago.|Обед оплачен.
entregue|entregue|A encomenda está entregue.|Посылка доставлена.
aceite|aceite|O convite foi aceite.|Приглашение было принято.
impresso|impressa|O livro está impresso.|Книга напечатана.
maior|maior|Esta casa é maior.|Этот дом больше.
menor|menor|Esta casa é menor.|Этот дом меньше.
ótimo|ótima|O filme é ótimo.|Фильм отличный.
péssimo|péssima|O filme é péssimo.|Фильм ужасный.
`);
const chunks = lines(`
com sono|Estou com sono.|Я хочу спать.
com fome|Estou com fome.|Я голоден / голодна.
às vezes|Às vezes, leio à noite.|Иногда я читаю вечером.
este momento|Neste momento, estou a estudar.|В данный момент я занимаюсь.
semana passada|Na semana passada, estive no Porto.|На прошлой неделе я был(а) в Порту.
a pé|Vou a pé.|Я иду пешком.
tomar duche|Vou tomar duche.|Я приму душ.
fazer a cama|Vou fazer a cama.|Я застелю постель.
de repente|De repente, o telefone tocou.|Вдруг зазвонил телефон.
gostava de|Gostava de visitar Coimbra nas próximas férias.|Мне хотелось бы посетить Коимбру в следующий отпуск.
por favor|Queria uma água, por favor.|Я бы хотел(а) воды, пожалуйста.
nos últimos tempos|Nos últimos tempos, tenho estudado muito.|В последнее время я много занимаюсь.
daqui a pouco|Daqui a pouco, vamos sair.|Скоро мы выйдем.
acabar de|Acabei de chegar.|Я только что пришёл / пришла.
estar a|Estou a ler.|Я сейчас читаю.
no próximo ano|No próximo ano, vou viajar.|В следующем году я буду путешествовать.
ter cuidado|É preciso ter cuidado.|Нужно быть осторожным.
antes de|Cheguei antes de a aula começar.|Я пришёл / пришла до начала урока.
depois de|Vou sair depois de jantar.|Я выйду после ужина.
apesar de|Apesar de estar cansada, a Ana trabalha.|Несмотря на усталость, Ана работает.
no caso de|No caso de chover, fico em casa.|В случае дождя я останусь дома.
ter de|Tenho de estudar.|Мне нужно заниматься.
precisar de|Preciso de ajuda.|Мне нужна помощь.
vende-se|Vende-se uma casa.|Продаётся дом.
aluga-se|Aluga-se um apartamento.|Сдаётся квартира.
fala-se|Aqui fala-se português.|Здесь говорят по-португальски.
precisa-se|Precisa-se de ajuda.|Требуется помощь.
aceita-se|Aceita-se este cartão.|Принимается эта карта.
na véspera|Cheguei na véspera.|Я приехал(а) накануне.
no dia seguinte|Saí no dia seguinte.|Я уехал(а) на следующий день.
dele|O livro é dele.|Книга его.
dela|O livro é dela.|Книга её.
de que cor|De que cor é a caneta?|Какого цвета ручка?
comigo|Queres vir comigo?|Хочешь пойти со мной?
contigo|Quero falar contigo.|Я хочу поговорить с тобой.
connosco|Ela vem connosco.|Она идёт с нами.
convosco|Quero falar convosco.|Я хочу поговорить с вами.
para mim|Este livro é para mim.|Эта книга для меня.
para ti|Este livro é para ti.|Эта книга для тебя.
sem ele|Vou sem ele.|Я пойду без него.
com ela|Vou com ela.|Я пойду с ней.
em cima de|O livro está em cima da mesa.|Книга лежит на столе.
debaixo de|O gato está debaixo da mesa.|Кот под столом.
ao lado de|A cadeira está ao lado da mesa.|Стул рядом со столом.
à frente de|O carro está à frente da casa.|Машина перед домом.
atrás de|O gato está atrás da porta.|Кот за дверью.
dentro de|O livro está dentro da caixa.|Книга внутри коробки.
perto de|A escola fica perto de casa.|Школа находится недалеко от дома.
de carro|Vou de carro.|Я поеду на машине.
de comboio|Vou de comboio.|Я поеду на поезде.
de autocarro|Vou de autocarro.|Я поеду на автобусе.
às|A aula começa às duas.|Урок начинается в два.
gostar de|Gosto de ler.|Я люблю читать.
pensar em|Estou a pensar em ti.|Я думаю о тебе.
falar com|Quero falar com a Ana.|Я хочу поговорить с Аной.
concordar com|Concordo contigo.|Я согласен / согласна с тобой.
insistir em|Ela insiste em ficar.|Она настаивает на том, чтобы остаться.
acreditar em|Acredito em ti.|Я верю в тебя.
depender de|Isso depende do tempo.|Это зависит от погоды.
cansado de|Estou cansado de esperar.|Я устал ждать.
interessado em|Estou interessado em aprender.|Я заинтересован в обучении.
contente com|Estou contente com o resultado.|Я доволен результатом.
preocupado com|Estou preocupado com a Ana.|Я беспокоюсь об Ане.
fiel a|Ele é fiel aos amigos.|Он верен друзьям.
habituado a|Estou habituado a trabalhar aqui.|Я привык здесь работать.
capaz de|Sou capaz de fazer isso.|Я способен это сделать.
diferente de|Este livro é diferente daquele.|Эта книга отличается от той.
do que|Esta casa é maior do que a outra.|Этот дом больше другого.
o mais|Este é o livro mais interessante.|Это самая интересная книга.
o menos|Este é o livro menos caro.|Это наименее дорогая книга.
há quanto tempo|Há quanto tempo estudas português?|Как давно ты учишь португальский?
`);

// These existing IDs continue to own their definitions and all saved progress.
const reuse: Record<string, string> = {
  livro: "study:noun:livro", mesa: "study:noun:mesa", chave: "study:noun:chave", cadeira: "study:noun:cadeira",
  "enquanto": "study:chunk:ga1:enquanto", "fazer a cama": "study:chunk:ga1:fazer-cama", "de repente": "study:chunk:ga1:de-repente", "gostava de": "study:chunk:ga1:gostava-de", "por favor": "study:chunk:ga1:por-favor", "já": "study:chunk:ga1:ja", "antes de": "study:chunk:ga1:antes-de", "ultimamente": "study:chunk:ga1:ultimamente", "desde que": "study:chunk:ga1:desde-que", "nos últimos tempos": "study:chunk:ga1:ultimos-tempos", "daqui a pouco": "study:chunk:ga1:daqui-pouco",
  "em cima de": "study:chunk:em-cima-de", "debaixo de": "study:chunk:debaixo-de", "ao lado de": "study:chunk:ao-lado-de", "dentro de": "study:chunk:dentro-de",
};
const decision = (surface: string, partOfSpeech: WordClass, pt: string, ru: string): VocabularyDecision => ({ surfaces: [surface], lemma: surface, partOfSpeech, sense: "entry", example: { pt, ru }, ...(reuse[surface] ? { existingStudyItemId: reuse[surface] } : {}) });
const functionWords = lines(`
aqui|adverb|Estou aqui.|Я здесь.
ali|adverb|O livro está ali.|Книга там.
agora|adverb|Vou sair agora.|Я сейчас выйду.
normalmente|adverb|Normalmente, trabalho em casa.|Обычно я работаю дома.
sempre|adverb|Venho sempre aqui.|Я всегда прихожу сюда.
nunca|adverb|Nunca fui a Faro.|Я никогда не был(а) в Фару.
hoje|adverb|Hoje estou em casa.|Сегодня я дома.
amanhã|adverb|Amanhã vou estudar.|Завтра я буду заниматься.
ontem|adverb|Ontem fui ao cinema.|Вчера я ходил(а) в кино.
antigamente|adverb|Antigamente, vivia no campo.|Раньше я жил(а) в сельской местности.
habitualmente|adverb|Habitualmente, leio à noite.|Обычно я читаю вечером.
antes|adverb|Antes, eu morava no Porto.|Раньше я жил(а) в Порту.
enquanto|conjunction|Enquanto eu lia, a Ana escrevia.|Пока я читал(а), Ана писала.
já|adverb|Ela já chegou.|Она уже пришла.
ultimamente|adverb|Ultimamente, tenho estudado muito.|В последнее время я много занимаюсь.
desde que|conjunction|Desde que cheguei, tenho trabalhado aqui.|С тех пор как я приехал(а), я работаю здесь.
provavelmente|adverb|Provavelmente, vai chover.|Вероятно, пойдёт дождь.
se|conjunction|Se chover, fico em casa.|Если пойдёт дождь, я останусь дома.
não|particle|Não quero sair.|Я не хочу выходить.
sem|preposition|Saiu sem falar.|Он(а) вышел / вышла, ничего не сказав.
até|preposition|Vou esperar até chegares.|Я подожду, пока ты не придёшь.
gradualmente|adverb|O tempo melhora gradualmente.|Погода постепенно улучшается.
isto|pronoun|O que é isto?|Что это?
isso|pronoun|Isso é teu?|Это твоё?
aquilo|pronoun|Aquilo é uma escola.|То здание — школа.
aí|adverb|O livro está aí contigo.|Книга там, у тебя.
lá|adverb|Ela mora lá.|Она живёт там.
seu|determiner|O seu livro está aqui.|Ваша / его / её книга здесь.
nosso|determiner|Este é o nosso carro.|Это наша машина.
onde|adverb|Onde fica a escola?|Где находится школа?
porquê|adverb|Ele saiu. Porquê?|Он ушёл. Почему?
quanto|determiner|Quanto tempo tens?|Сколько у тебя времени?
algum|determiner|Tens algum livro?|У тебя есть какая-нибудь книга?
nenhum|determiner|Não tenho nenhum livro.|У меня нет ни одной книги.
alguém|pronoun|Está alguém em casa?|Дома кто-нибудь есть?
ninguém|pronoun|Não está ninguém em casa.|Дома никого нет.
tudo|pronoun|Está tudo pronto.|Всё готово.
nada|pronoun|Não sei nada.|Я ничего не знаю.
pouco|determiner|Tenho pouco tempo.|У меня мало времени.
outro|determiner|Quero outro livro.|Я хочу другую книгу.
todo|determiner|Li o livro todo.|Я прочитал(а) всю книгу.
que|pronoun|Este é o livro que comprei.|Это книга, которую я купил(а).
cujo|determiner|Conheço o autor cujo livro estás a ler.|Я знаком(а) с автором, чью книгу ты читаешь.
entre|preposition|A mesa está entre as cadeiras.|Стол стоит между стульями.
por|preposition|Passei pelo centro.|Я прошёл / прошла через центр.
desde|preposition|Moro aqui desde janeiro.|Я живу здесь с января.
durante|preposition|Estudei durante duas horas.|Я занимался / занималась два часа.
mais|adverb|Quero estudar mais.|Я хочу больше заниматься.
menos|adverb|Hoje trabalhei menos.|Сегодня я работал(а) меньше.
tão|adverb|A Ana é tão alta como o Rui.|Ана такого же роста, как Руй.
`);
const specials: VocabularyDecision[] = [
  { ...decision("português", "noun", "O Rui é português.", "Руй — португалец."), sense: "person", translation: "португалец", noun: { article: "o", plural: "portugueses", pluralArticle: "os" } },
  { ...decision("português", "adjective", "Este é um livro português.", "Это португальская книга."), sense: "origin", translation: "португальский", forms: ["português", "portuguesa"] },
  { ...decision("tomar", "verb", "Vou tomar um medicamento.", "Я приму лекарство."), sense: "take-medicine", translation: "принимать (лекарство)", government: "tomar + medicamento" },
  { ...decision("tomar", "verb", "Vou tomar uma decisão.", "Я приму решение."), sense: "take-decision", translation: "принимать (решение)", government: "tomar uma decisão" },
  { ...decision("apanhar", "verb", "Vou apanhar a bola.", "Я поймаю мяч."), sense: "catch", translation: "ловить", government: "apanhar + objeto" },
  { ...decision("apanhar", "verb", "Vou apanhar o autocarro.", "Я сяду на автобус."), sense: "transport", translation: "садиться на транспорт", government: "apanhar + transporte" },
  { ...decision("saber", "verb", "Sei onde fica a escola.", "Я знаю, где находится школа."), sense: "know-fact", translation: "знать (факт)" },
  { ...decision("saber", "verb", "Sei nadar.", "Я умею плавать."), sense: "know-how", translation: "уметь", government: "saber + infinitivo" },
  { ...decision("ouvir", "verb", "Ouço o telefone.", "Я слышу телефон."), sense: "hear", translation: "слышать", units: [9] },
  { ...decision("ouvir", "verb", "Gosto de ouvir música.", "Я люблю слушать музыку."), sense: "listen", translation: "слушать" },
  { ...decision("quando", "conjunction", "Quando cheguei, ela saiu.", "Когда я пришёл / пришла, она вышла."), sense: "temporal", translation: "когда (связь событий)", units: [16, 18, 19, 21] },
  { ...decision("quando", "adverb", "Quando chegas?", "Когда ты приедешь?"), sense: "question", translation: "когда?", units: [40] },
  { ...decision("para", "conjunction", "Estudo para aprender.", "Я занимаюсь, чтобы научиться."), sense: "purpose", translation: "чтобы", units: [28] },
  { ...decision("para", "preposition", "Vou para o Porto.", "Я еду в Порту."), sense: "direction", translation: "в; по направлению к", units: [47] },
  { ...decision("para", "preposition", "Este livro é para a Ana.", "Эта книга для Аны."), sense: "recipient", translation: "для", units: [47] },
  { ...decision("há", "chunk", "Há uma mesa na sala.", "В комнате есть стол."), lemma: "haver", sense: "existence", translation: "есть; имеется", units: [30], existingStudyItemId: "study:chunk:ha-presence", forms: ["há", "houve", "havia", "haverá"], surfaces: ["há", "houve", "havia", "haverá"] },
  { ...decision("há", "chunk", "Cheguei há dois dias.", "Я приехал(а) два дня назад."), lemma: "há + duração", sense: "ago", translation: "… назад", units: [54] },
  { ...decision("há", "chunk", "Moro aqui há dois anos.", "Я живу здесь уже два года."), lemma: "há + duração", sense: "duration", translation: "уже … (о длительности)", units: [54] },
  { ...decision("quem", "pronoun", "Quem chegou?", "Кто пришёл?"), sense: "question", translation: "кто?", units: [40] },
  { ...decision("quem", "pronoun", "Esta é a pessoa com quem falei.", "Это человек, с которым я разговаривал(а)."), sense: "relative", translation: "кто; который (относительное)", units: [42] },
  { ...decision("como", "adverb", "Como estás?", "Как ты?"), sense: "question", translation: "как?", units: [40] },
  { ...decision("como", "conjunction", "A Ana é tão alta como o Rui.", "Ана такого же роста, как Руй."), sense: "comparison", translation: "как (в сравнении)", units: [51] },
  { ...decision("qual", "pronoun", "Qual preferes?", "Какой ты предпочитаешь?"), sense: "question", translation: "какой из?", units: [40] },
  { ...decision("qual", "pronoun", "Este é o livro do qual falei.", "Это книга, о которой я говорил(а)."), sense: "relative", translation: "который (в o qual)", units: [42] },
  { ...decision("muito", "determiner", "Tenho muito trabalho.", "У меня много работы."), sense: "quantity", translation: "много", units: [41] },
  { ...decision("muito", "adverb", "Ela está muito contente.", "Она очень довольна."), sense: "degree", translation: "очень", units: [52] },
  { ...decision("melhor", "adverb", "Hoje canto melhor.", "Сегодня я пою лучше."), lemma: "bem", sense: "manner", translation: "лучше (действовать)", units: [51], forms: ["bem", "melhor"] },
  { ...decision("melhor", "adjective", "Este livro é melhor.", "Эта книга лучше."), lemma: "bom", sense: "quality", translation: "хороший; лучше; лучший", forms: ["bom", "boa", "melhor"] },
  { ...decision("pior", "adverb", "Hoje canto pior.", "Сегодня я пою хуже."), lemma: "mal", sense: "manner", translation: "хуже (действовать)", units: [51], forms: ["mal", "pior"] },
  { ...decision("pior", "adjective", "Este livro é pior.", "Эта книга хуже."), lemma: "mau", sense: "quality", translation: "плохой; хуже; худший", forms: ["mau", "má", "pior"] },
  { ...decision("altíssimo", "adjective", "O prédio é altíssimo.", "Здание очень высокое."), lemma: "alto", sense: "height", translation: "высокий; altíssimo — очень высокий", forms: ["alto", "alta", "altíssimo", "altíssima"] },
  { ...decision("cedíssimo", "adverb", "Cheguei cedíssimo.", "Я пришёл / пришла очень рано."), lemma: "cedo", sense: "early", translation: "рано; cedíssimo — очень рано", forms: ["cedo", "cedíssimo"] },
  ...[
    ["este,esta", "este", "Este livro e esta caneta são meus.", "Эта книга и эта ручка — мои."],
    ["esse,essa", "esse", "Esse livro e essa caneta são teus.", "Эта книга и эта ручка у тебя — твои."],
    ["aquele,aquela", "aquele", "Aquele livro e aquela caneta são dela.", "Та книга и та ручка — её."],
    ["meu,minha", "meu", "Este é o meu livro e esta é a minha caneta.", "Это моя книга, а это моя ручка."],
    ["teu,tua", "teu", "Este é o teu livro e esta é a tua caneta.", "Это твоя книга, а это твоя ручка."],
    ["tanto,tanta,tantos,tantas", "tanto", "Há tantos livros e tantas revistas!", "Как много книг и журналов!"],
  ].map(([surfaces, lemma, pt, ru]) => ({ ...decision(lemma, "determiner", pt, ru), lemma, surfaces: surfaces.split(","), forms: surfaces.split(",") })),
  ...[
    ["queria", "querer", "Queria uma água, por favor.", "Я бы хотел(а) воды, пожалуйста."],
    ["podia,poderia", "poder", "Podia ajudar-me, por favor?", "Не могли бы вы мне помочь?"],
    ["preferia", "preferir", "Preferia ficar em casa.", "Я предпочёл / предпочла бы остаться дома."],
    ["deveria", "dever", "Deveria estudar mais.", "Мне следовало бы больше заниматься."],
    ["estará", "estar", "Ela estará em casa amanhã.", "Завтра она будет дома."],
  ].map(([surfaces, lemma, pt, ru]) => ({ ...decision(lemma, "verb", pt, ru), lemma, surfaces: surfaces.split(","), forms: surfaces.split(",") })),
];
export const vocabularyDecisions: VocabularyDecision[] = [
  ...nouns.map(([s, article, plural, pt, ru]) => ({ ...decision(s, "noun", pt, ru), ...(s === "enfermeiro" ? { translation: "медбрат (enfermeira — медсестра)" } : {}), noun: { article: article as "o" | "a", plural, pluralArticle: article === "o" ? "os" as const : "as" as const, ...(s === "óculos" ? { pluralOnly: true } : {}) } })),
  ...verbs.map(([s, pt, ru]) => decision(s, "verb", pt, ru)),
  ...adjectives.map(([s, feminine, pt, ru]) => ({ ...decision(s, "adjective", pt, ru), forms: [...new Set([s, feminine])] })),
  ...chunks.map(([s, pt, ru]) => ({ ...decision(s, "chunk", pt, ru), ...(s === "gostava de" ? { surfaces: ["gostava de", "gostaria"], forms: ["gostava de", "gostaria de"] } : {}) })),
  ...functionWords.map(([s, pos, pt, ru]) => decision(s, pos as WordClass, pt, ru)),
  ...specials,
];
