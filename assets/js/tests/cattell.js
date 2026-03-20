/* Файл: assets/js/tests/cattell.js */
/* 16PF Кеттела: 105 вопросов (a/b/c) + ключи 16 факторов + алгоритм стенов */

// ── Ключи факторов ────────────────────────────────────────────
// Каждый вопрос: { id, answer_value } где answer_value: 0=a,1=b,2=c
// Значение балла для каждого ответа: a=0, b=1, c=2 (если в ключе)
const FACTOR_KEYS = {
  A:  { q:[1,2,3,4,5,6,7],       map:{1:{a:0,b:1,c:2},2:{a:2,b:1,c:0},3:{a:0,b:1,c:2},4:{a:2,b:1,c:0},5:{a:0,b:1,c:2},6:{a:2,b:1,c:0},7:{a:0,b:1,c:2}} },
  B:  { q:[8,9,10,11,12,13],      map:{8:{a:1,b:0,c:0},9:{a:0,b:0,c:1},10:{a:1,b:0,c:0},11:{a:0,b:1,c:0},12:{a:0,b:0,c:1},13:{a:1,b:0,c:0}} },
  C:  { q:[14,15,16,17,18,19,20], map:{14:{a:0,b:1,c:2},15:{a:2,b:1,c:0},16:{a:0,b:1,c:2},17:{a:2,b:1,c:0},18:{a:0,b:1,c:2},19:{a:2,b:1,c:0},20:{a:0,b:1,c:2}} },
  E:  { q:[21,22,23,24,25,26],    map:{21:{a:0,b:1,c:2},22:{a:2,b:1,c:0},23:{a:0,b:1,c:2},24:{a:2,b:1,c:0},25:{a:0,b:1,c:2},26:{a:2,b:1,c:0}} },
  F:  { q:[27,28,29,30,31,32],    map:{27:{a:0,b:1,c:2},28:{a:2,b:1,c:0},29:{a:0,b:1,c:2},30:{a:2,b:1,c:0},31:{a:0,b:1,c:2},32:{a:2,b:1,c:0}} },
  G:  { q:[33,34,35,36,37,38],    map:{33:{a:0,b:1,c:2},34:{a:2,b:1,c:0},35:{a:0,b:1,c:2},36:{a:2,b:1,c:0},37:{a:0,b:1,c:2},38:{a:2,b:1,c:0}} },
  H:  { q:[39,40,41,42,43,44],    map:{39:{a:0,b:1,c:2},40:{a:2,b:1,c:0},41:{a:0,b:1,c:2},42:{a:2,b:1,c:0},43:{a:0,b:1,c:2},44:{a:2,b:1,c:0}} },
  I:  { q:[45,46,47,48,49,50],    map:{45:{a:0,b:1,c:2},46:{a:2,b:1,c:0},47:{a:0,b:1,c:2},48:{a:2,b:1,c:0},49:{a:0,b:1,c:2},50:{a:2,b:1,c:0}} },
  L:  { q:[51,52,53,54,55,56],    map:{51:{a:0,b:1,c:2},52:{a:2,b:1,c:0},53:{a:0,b:1,c:2},54:{a:2,b:1,c:0},55:{a:0,b:1,c:2},56:{a:2,b:1,c:0}} },
  M:  { q:[57,58,59,60,61,62],    map:{57:{a:0,b:1,c:2},58:{a:2,b:1,c:0},59:{a:0,b:1,c:2},60:{a:2,b:1,c:0},61:{a:0,b:1,c:2},62:{a:2,b:1,c:0}} },
  N:  { q:[63,64,65,66,67,68],    map:{63:{a:0,b:1,c:2},64:{a:2,b:1,c:0},65:{a:0,b:1,c:2},66:{a:2,b:1,c:0},67:{a:0,b:1,c:2},68:{a:2,b:1,c:0}} },
  O:  { q:[69,70,71,72,73,74],    map:{69:{a:0,b:1,c:2},70:{a:2,b:1,c:0},71:{a:0,b:1,c:2},72:{a:2,b:1,c:0},73:{a:0,b:1,c:2},74:{a:2,b:1,c:0}} },
  Q1: { q:[75,76,77,78,79,80],    map:{75:{a:0,b:1,c:2},76:{a:2,b:1,c:0},77:{a:0,b:1,c:2},78:{a:2,b:1,c:0},79:{a:0,b:1,c:2},80:{a:2,b:1,c:0}} },
  Q2: { q:[81,82,83,84,85,86],    map:{81:{a:0,b:1,c:2},82:{a:2,b:1,c:0},83:{a:0,b:1,c:2},84:{a:2,b:1,c:0},85:{a:0,b:1,c:2},86:{a:2,b:1,c:0}} },
  Q3: { q:[87,88,89,90,91,92],    map:{87:{a:0,b:1,c:2},88:{a:2,b:1,c:0},89:{a:0,b:1,c:2},90:{a:2,b:1,c:0},91:{a:0,b:1,c:2},92:{a:2,b:1,c:0}} },
  Q4: { q:[93,94,95,96,97,98,99,100,101,102,103,104,105], map:{93:{a:0,b:1,c:2},94:{a:2,b:1,c:0},95:{a:0,b:1,c:2},96:{a:2,b:1,c:0},97:{a:0,b:1,c:2},98:{a:2,b:1,c:0},99:{a:0,b:1,c:2},100:{a:2,b:1,c:0},101:{a:0,b:1,c:2},102:{a:2,b:1,c:0},103:{a:0,b:1,c:2},104:{a:2,b:1,c:0},105:{a:0,b:1,c:2}} },
};

// Описания факторов (биполярная шкала)
export const FACTOR_DESCRIPTIONS = {
  A:  { low:'Замкнутость',          high:'Общительность' },
  B:  { low:'Конкретное мышление',  high:'Абстрактное мышление' },
  C:  { low:'Эмоциональная нестаб.',high:'Эмоциональная устойч.' },
  E:  { low:'Подчинённость',        high:'Доминантность' },
  F:  { low:'Благоразумие',         high:'Беспечность' },
  G:  { low:'Попустительство',      high:'Нормативность' },
  H:  { low:'Робость',              high:'Смелость' },
  I:  { low:'Практичность',         high:'Чувствительность' },
  L:  { low:'Доверчивость',         high:'Подозрительность' },
  M:  { low:'Практичность',         high:'Мечтательность' },
  N:  { low:'Прямолинейность',      high:'Дипломатичность' },
  O:  { low:'Спокойствие',          high:'Тревожность' },
  Q1: { low:'Консерватизм',         high:'Радикализм' },
  Q2: { low:'Зависимость от группы',high:'Самодостаточность' },
  Q3: { low:'Низкий самоконтроль',  high:'Высокий самоконтроль' },
  Q4: { low:'Расслабленность',      high:'Напряжённость' },
};

// ── 105 вопросов (a/b/c) ─────────────────────────────────────
const questions = [
  // Фактор A (общительность)
  {id:1,  text:'Я предпочитаю работать вместе с другими людьми, а не в одиночестве', answers:[{text:'Нет',value:0},{text:'Не уверен',value:1},{text:'Да',value:2}]},
  {id:2,  text:'Я легко нахожу общий язык с людьми различных типов', answers:[{text:'Редко',value:2},{text:'Иногда',value:1},{text:'Часто',value:0}]},
  {id:3,  text:'Мне нравится быть там, где много разных людей', answers:[{text:'Нет',value:0},{text:'Не уверен',value:1},{text:'Да',value:2}]},
  {id:4,  text:'Я предпочитаю тихий образ жизни без активного общения', answers:[{text:'Да',value:2},{text:'Не уверен',value:1},{text:'Нет',value:0}]},
  {id:5,  text:'Мне легко познакомиться с новым человеком', answers:[{text:'Нет',value:0},{text:'Не уверен',value:1},{text:'Да',value:2}]},
  {id:6,  text:'При общении с людьми я предпочитаю оставаться в тени', answers:[{text:'Да',value:2},{text:'По-разному',value:1},{text:'Нет',value:0}]},
  {id:7,  text:'Мне приятнее работать с людьми, чем с книгами и предметами', answers:[{text:'Нет',value:0},{text:'Не уверен',value:1},{text:'Да',value:2}]},
  // Фактор B (интеллект)
  {id:8,  text:'Если к 9 часам утра опоздала ровно половина группы, то сколько человек успели — если в группе 40 человек?', answers:[{text:'20',value:1},{text:'Половина',value:0},{text:'Остальные',value:0}]},
  {id:9,  text:'Какое из слов не относится к остальным: кошка, книга, собака, рыба?', answers:[{text:'Кошка',value:0},{text:'Книга',value:1},{text:'Рыба',value:0}]},
  {id:10, text:'Наступил понедельник — какой день будет через 3 дня?', answers:[{text:'Четверг',value:1},{text:'Среда',value:0},{text:'Пятница',value:0}]},
  {id:11, text:'Гвоздь относится к молотку, как шуруп к...', answers:[{text:'Деревяшке',value:0},{text:'Отвёртке',value:1},{text:'Гайке',value:0}]},
  {id:12, text:'Что идёт первым: яйцо или курица? (С точки зрения эволюции)', answers:[{text:'Яйцо',value:1},{text:'Курица',value:0},{text:'Одновременно',value:0}]},
  {id:13, text:'Продолжите ряд: 2, 4, 8, 16, ...', answers:[{text:'24',value:0},{text:'32',value:1},{text:'20',value:0}]},
  // Фактор C (устойчивость)
  {id:14, text:'Мелкие неудачи в течение дня обычно...', answers:[{text:'Сильно расстраивают меня',value:0},{text:'По-разному',value:1},{text:'Не выбивают меня из колеи',value:2}]},
  {id:15, text:'Я чувствую себя уравновешенным и спокойным', answers:[{text:'Редко',value:2},{text:'Иногда',value:1},{text:'Обычно',value:0}]},
  {id:16, text:'Мне трудно принимать решения в напряжённых ситуациях', answers:[{text:'Да',value:0},{text:'Иногда',value:1},{text:'Нет',value:2}]},
  {id:17, text:'Я справляюсь с трудными ситуациями спокойно', answers:[{text:'Нет',value:2},{text:'Не всегда',value:1},{text:'Да',value:0}]},
  {id:18, text:'Мои эмоции влияют на мою работоспособность', answers:[{text:'Сильно',value:0},{text:'Умеренно',value:1},{text:'Мало',value:2}]},
  {id:19, text:'Неожиданные трудности выводят меня из равновесия', answers:[{text:'Часто',value:2},{text:'Иногда',value:1},{text:'Редко',value:0}]},
  {id:20, text:'Я чувствую себя стабильно и надёжно', answers:[{text:'Не очень',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  // Фактор E (доминантность)
  {id:21, text:'Я предпочитаю самостоятельно принимать решения, не советуясь', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:22, text:'В группе я обычно соглашаюсь с большинством', answers:[{text:'Да',value:2},{text:'Иногда',value:1},{text:'Нет',value:0}]},
  {id:23, text:'Я не стесняюсь высказывать своё мнение, даже если оно непопулярно', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:24, text:'Мне трудно настоять на своём', answers:[{text:'Редко',value:2},{text:'Иногда',value:1},{text:'Часто',value:0}]},
  {id:25, text:'В спорах я обычно отстаиваю свою позицию', answers:[{text:'Нет',value:0},{text:'Не всегда',value:1},{text:'Да',value:2}]},
  {id:26, text:'Я склонен подчиняться авторитетам', answers:[{text:'Да',value:2},{text:'Иногда',value:1},{text:'Нет',value:0}]},
  // Фактор F (беспечность)
  {id:27, text:'Я считаю себя жизнерадостным и беспечным', answers:[{text:'Нет',value:0},{text:'Не уверен',value:1},{text:'Да',value:2}]},
  {id:28, text:'Перед любым делом я тщательно всё обдумываю', answers:[{text:'Всегда',value:2},{text:'Обычно',value:1},{text:'Редко',value:0}]},
  {id:29, text:'Мне нравится веселиться и развлекаться', answers:[{text:'Нет',value:0},{text:'Умеренно',value:1},{text:'Да',value:2}]},
  {id:30, text:'Я всегда серьёзно подхожу к делу', answers:[{text:'Нет',value:2},{text:'Обычно',value:1},{text:'Всегда',value:0}]},
  {id:31, text:'Я живу сегодняшним днём, не слишком беспокоясь о будущем', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:32, text:'Мне свойственна осторожность и предусмотрительность', answers:[{text:'Да',value:2},{text:'Умеренно',value:1},{text:'Нет',value:0}]},
  // Фактор G (нормативность)
  {id:33, text:'Я выполняю свои обязательства, даже если это невыгодно', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:34, text:'Мне кажется, правила существуют для того, чтобы их нарушали', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:35, text:'Я придерживаюсь принятых норм поведения', answers:[{text:'Нет',value:0},{text:'Обычно',value:1},{text:'Всегда',value:2}]},
  {id:36, text:'Иногда я немного обманываю ради собственной выгоды', answers:[{text:'Да',value:2},{text:'Иногда',value:1},{text:'Нет',value:0}]},
  {id:37, text:'Я считаю важным выполнять свой долг', answers:[{text:'Нет',value:0},{text:'Обычно',value:1},{text:'Да',value:2}]},
  {id:38, text:'Я нарушаю правила, если никто не смотрит', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  // Фактор H (смелость)
  {id:39, text:'Я легко выступаю перед большой аудиторией', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:40, text:'В незнакомой обстановке я чувствую себя неловко', answers:[{text:'Да',value:2},{text:'Иногда',value:1},{text:'Нет',value:0}]},
  {id:41, text:'Я легко вступаю в разговор с незнакомцами', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:42, text:'В рискованных ситуациях я теряюсь', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:43, text:'Я решителен и не теряюсь в трудных ситуациях', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:44, text:'Меня легко запугать или смутить', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  // Фактор I (чувствительность)
  {id:45, text:'Я человек чувствительный и впечатлительный', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:46, text:'Искусство и красота не слишком важны для меня', answers:[{text:'Да',value:2},{text:'Иногда',value:1},{text:'Нет',value:0}]},
  {id:47, text:'Я легко трогаюсь и волнуюсь', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:48, text:'Я предпочитаю практичность эстетике', answers:[{text:'Нет',value:2},{text:'По-разному',value:1},{text:'Да',value:0}]},
  {id:49, text:'Я часто мечтаю и предаюсь фантазиям', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:50, text:'Я мало думаю о чувствах других людей', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  // Фактор L (подозрительность)
  {id:51, text:'Я часто думаю, что люди завидуют мне или желают зла', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:52, text:'Я доверяю людям в целом', answers:[{text:'Нет',value:2},{text:'С осторожностью',value:1},{text:'Да',value:0}]},
  {id:53, text:'Мне кажется, что за мной наблюдают или обсуждают меня', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:54, text:'Я хорошо отношусь к людям и не жду подвоха', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:55, text:'Я скептически отношусь к мотивам других людей', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:56, text:'Я принимаю людей такими, какие они есть', answers:[{text:'Нет',value:2},{text:'Обычно',value:1},{text:'Да',value:0}]},
  // Фактор M (мечтательность)
  {id:57, text:'Меня больше интересуют идеи, чем практические дела', answers:[{text:'Нет',value:0},{text:'По-разному',value:1},{text:'Да',value:2}]},
  {id:58, text:'Я человек практического склада', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:59, text:'Я часто уходю в себя и погружаюсь в мысли', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:60, text:'Мне ближе конкретные факты, чем теоретические концепции', answers:[{text:'Нет',value:2},{text:'По-разному',value:1},{text:'Да',value:0}]},
  {id:61, text:'У меня богатое воображение', answers:[{text:'Нет',value:0},{text:'Умеренное',value:1},{text:'Да',value:2}]},
  {id:62, text:'Меня интересуют реальные, ощутимые результаты', answers:[{text:'Нет',value:2},{text:'Да',value:0},{text:'По-разному',value:1}]},
  // Фактор N (дипломатичность)
  {id:63, text:'Я умею держать свои чувства при себе', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:64, text:'Я говорю то, что думаю, не церемонясь', answers:[{text:'Да',value:2},{text:'Иногда',value:1},{text:'Нет',value:0}]},
  {id:65, text:'Я осторожно выбираю слова в разговоре', answers:[{text:'Нет',value:0},{text:'Обычно',value:1},{text:'Да',value:2}]},
  {id:66, text:'Я высказываю своё мнение прямо и резко', answers:[{text:'Да',value:2},{text:'Иногда',value:1},{text:'Нет',value:0}]},
  {id:67, text:'Я хорошо понимаю мотивы и скрытые намерения людей', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:68, text:'Я не очень разбираюсь в тонкостях человеческих отношений', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  // Фактор O (тревожность)
  {id:69, text:'Я часто беспокоюсь о том, что могло пойти не так', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:70, text:'Меня редко мучает чувство вины', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:71, text:'Я часто чувствую неудовлетворённость собой', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:72, text:'Я уверен в себе и своих действиях', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:73, text:'Меня часто беспокоит чувство вины', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Часто',value:2}]},
  {id:74, text:'Я редко сомневаюсь в правильности своих решений', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  // Фактор Q1 (радикализм)
  {id:75, text:'Мне интересны новые идеи, даже если они противоречат традициям', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:76, text:'Мне нравятся традиции и устоявшийся порядок вещей', answers:[{text:'Нет',value:2},{text:'По-разному',value:1},{text:'Да',value:0}]},
  {id:77, text:'Я считаю, что многое нужно менять в нашем обществе', answers:[{text:'Нет',value:0},{text:'Отчасти',value:1},{text:'Да',value:2}]},
  {id:78, text:'Проверенные методы лучше экспериментов', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:79, text:'Мне нравится экспериментировать и пробовать новое', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:80, text:'Я придерживаюсь традиционных ценностей', answers:[{text:'Нет',value:2},{text:'Умеренно',value:1},{text:'Да',value:0}]},
  // Фактор Q2 (самодостаточность)
  {id:81, text:'Я предпочитаю принимать решения самостоятельно', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:82, text:'Мне важно мнение группы при принятии решений', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:83, text:'Я не нуждаюсь в поддержке и одобрении других', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:84, text:'Я сверяюсь с другими, прежде чем действовать', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:85, text:'Я могу комфортно работать без команды', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:86, text:'Мне нравится, когда группа вместе решает проблемы', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  // Фактор Q3 (самоконтроль)
  {id:87, text:'Я контролирую свои эмоции и поведение', answers:[{text:'Нет',value:0},{text:'Обычно',value:1},{text:'Да',value:2}]},
  {id:88, text:'Я действую импульсивно, не продумывая последствий', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Часто',value:0}]},
  {id:89, text:'Я придерживаюсь своих целей и планов', answers:[{text:'Нет',value:0},{text:'Обычно',value:1},{text:'Да',value:2}]},
  {id:90, text:'Мне трудно соблюдать распорядок дня', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:91, text:'Я организован и методичен', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:92, text:'Я не слежу за своим имиджем и репутацией', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  // Фактор Q4 (напряжённость)
  {id:93,  text:'Я часто чувствую внутреннее напряжение или беспокойство', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:94,  text:'Я чувствую себя расслабленным и умиротворённым', answers:[{text:'Редко',value:2},{text:'Иногда',value:1},{text:'Обычно',value:0}]},
  {id:95,  text:'Мне трудно успокоиться в конце дня', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Часто',value:2}]},
  {id:96,  text:'Я чувствую себя спокойно и уверенно', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:97,  text:'Я нервничаю, когда долго не могу решить задачу', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:98,  text:'У меня нет проблем со сном', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:99,  text:'Я легко раздражаюсь', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:100, text:'Я спокойно жду, когда это необходимо', answers:[{text:'Нет',value:2},{text:'Обычно',value:1},{text:'Да',value:0}]},
  {id:101, text:'Я часто чувствую усталость и опустошённость', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:102, text:'У меня много энергии', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:103, text:'Я ощущаю нехватку сил для выполнения задач', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Да',value:2}]},
  {id:104, text:'Я доволен своей жизнью в целом', answers:[{text:'Нет',value:2},{text:'Иногда',value:1},{text:'Да',value:0}]},
  {id:105, text:'Я часто нервничаю без серьёзной причины', answers:[{text:'Нет',value:0},{text:'Иногда',value:1},{text:'Часто',value:2}]},
];

// ── Таблица перевода сырых баллов в стены ─────────────────────
function rawToSten(factor, rawScore, maxScore) {
  const percent = rawScore / maxScore;
  if      (percent < 0.11) return 1;
  else if (percent < 0.22) return 2;
  else if (percent < 0.33) return 3;
  else if (percent < 0.44) return 4;
  else if (percent < 0.55) return 5;
  else if (percent < 0.66) return 6;
  else if (percent < 0.77) return 7;
  else if (percent < 0.88) return 8;
  else if (percent < 0.95) return 9;
  else                     return 10;
}

// ── Алгоритм подсчёта ─────────────────────────────────────────
function calculate(answers) {
  const rawScores = {};
  const stens     = {};

  Object.entries(FACTOR_KEYS).forEach(([factor, key]) => {
    let raw = 0;
    key.q.forEach(qId => {
      const answerVal = answers[qId];
      if (answerVal === undefined || answerVal === null) return;
      const answerKey = ['a','b','c'][answerVal];
      const scoreMap  = key.map[qId] || {};
      raw += scoreMap[answerKey] || 0;
    });
    const maxPossible = key.q.length * 2;
    rawScores[factor] = raw;
    stens[factor]     = rawToSten(factor, raw, maxPossible);
  });

  return { stens, rawScores };
}

// ── Описание фактора по стену ─────────────────────────────────
export function getFactorDescription(factor, sten) {
  const desc = FACTOR_DESCRIPTIONS[factor];
  if (!desc) return '';
  if      (sten <= 3)  return `Низкий: ${desc.low}`;
  else if (sten <= 7)  return `Средний`;
  else                 return `Высокий: ${desc.high}`;
}

// ── Экспорт конфига ───────────────────────────────────────────
export const cattellConfig = {
  id: 'cattell', name: '16PF Кеттела', shortName: '16PF',
  description: '16 факторов личности по биполярным шкалам (стены 1–10)',
  timeMinutes: 30, questionCount: 105,
  categories: ['личность'], difficulty: 'hard',
  questions, calculate,
};
