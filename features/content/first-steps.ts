// Shared semantic owner for the pilot, visual guide and grammar entries.
export const beingContent={
  ser:{title:"Кто это и какой он",rule:"SER называет человека или предмет: кто он, откуда, кем работает, из чего сделан. С ним также говорим о времени и характеристиках.",question:"Кто это? Какой он?",icon:"◎",example:{pt:"O Rui é calmo.",ru:"Руй спокойный по характеру."}},
  estar:{title:"Как сейчас и где",rule:"ESTAR показывает местоположение, состояние или результат изменения. Это не просто «временно»: открытая дверь тоже está aberta.",question:"Как себя чувствует? Где находится?",icon:"⌖",example:{pt:"O Rui está calmo.",ru:"Сейчас Руй спокоен."}},
  contrast:{rule:"Один человек, разные сообщения: SER — характеристика, ESTAR — состояние или положение. Это не правило «навсегда или ненадолго»."},
} as const;
export const firstStepChecks=[
  {id:"first-steps:introduction",targetId:"chunk:chamo-me",prompt:"Тебя спросили: Como te chamas? Выбери ответ.",options:["Chamo-me Alex.","Estou em casa.","Há um livro."],answer:0,feedback:"Chamo-me Alex. — Меня зовут Алекс. Chamo-me пока запоминаем целиком."},
  {id:"first-steps:identity",targetId:"grammar:ser-estar:first-contrast",prompt:"Рита — учительница. Представь её.",options:["A Rita está professora.","A Rita é professora.","A Rita tenho professora."],answer:1,feedback:"A Rita é professora. — Рита учительница. Называем профессию: нужна форма é от SER."},
  {id:"first-steps:state",targetId:"grammar:ser-estar:first-contrast",prompt:"Сегодня Ана устала. Как сказать об этом?",options:["A Ana é cansada.","A Ana sou cansada.","A Ana está cansada."],answer:2,feedback:"A Ana está cansada. — Ана устала. Состояние выражаем через ESTAR."},
] as const;
export const identityExamples=[
  {pt:"Sou estudante.",ru:"Я учащийся / учащаяся."},
  {pt:"A Ana é professora.",ru:"Ана — учительница."},
  {pt:"O Rui é professor.",ru:"Руй — учитель."},
] as const;
