/* Файл: assets/js/tests/big-five.js */
/* Big Five OCEAN: 50 вопросов по шкале Ликерта + факторный анализ */

// ── 50 вопросов Big Five ──────────────────────────────────────
// factor: O/C/E/A/N | reversed: true — обратное кодирование
const questions = [
  // Открытость опыту (Openness) — 10 вопросов
  { id:1,  text:'Я обладаю богатым воображением',                              type:'likert', factor:'O', reversed:false },
  { id:2,  text:'Меня интересуют абстрактные идеи и теории',                   type:'likert', factor:'O', reversed:false },
  { id:3,  text:'Я легко замечаю красоту в обыденных вещах',                   type:'likert', factor:'O', reversed:false },
  { id:4,  text:'Мне нравится исследовать новые идеи',                         type:'likert', factor:'O', reversed:false },
  { id:5,  text:'Я редко замечаю своё эмоциональное состояние',                type:'likert', factor:'O', reversed:true  },
  { id:6,  text:'Я нахожу философские дискуссии интересными',                  type:'likert', factor:'O', reversed:false },
  { id:7,  text:'Мне трудно понять абстрактные идеи',                          type:'likert', factor:'O', reversed:true  },
  { id:8,  text:'Я люблю экспериментировать с новым и разным',                 type:'likert', factor:'O', reversed:false },
  { id:9,  text:'Я предпочитаю разнообразие рутине',                           type:'likert', factor:'O', reversed:false },
  { id:10, text:'Я не очень люблю поэзию',                                     type:'likert', factor:'O', reversed:true  },

  // Добросовестность (Conscientiousness) — 10 вопросов
  { id:11, text:'Я всегда хорошо подготовлен',                                 type:'likert', factor:'C', reversed:false },
  { id:12, text:'Я уделяю внимание деталям',                                   type:'likert', factor:'C', reversed:false },
  { id:13, text:'Я часто забываю положить вещи на место',                      type:'likert', factor:'C', reversed:true  },
  { id:14, text:'Я следую расписанию',                                          type:'likert', factor:'C', reversed:false },
  { id:15, text:'Я делаю беспорядок в своих вещах',                            type:'likert', factor:'C', reversed:true  },
  { id:16, text:'Я выполняю свои обязанности',                                  type:'likert', factor:'C', reversed:false },
  { id:17, text:'Я всегда знаю, что делаю',                                    type:'likert', factor:'C', reversed:false },
  { id:18, text:'Я часто откладываю дела',                                      type:'likert', factor:'C', reversed:true  },
  { id:19, text:'Я трудолюбивый и надёжный',                                   type:'likert', factor:'C', reversed:false },
  { id:20, text:'Я много работаю',                                              type:'likert', factor:'C', reversed:false },

  // Экстраверсия (Extraversion) — 10 вопросов
  { id:21, text:'Я легко вступаю в контакт с новыми людьми',                   type:'likert', factor:'E', reversed:false },
  { id:22, text:'Я чувствую себя хорошо в компании других',                    type:'likert', factor:'E', reversed:false },
  { id:23, text:'Я немногословен',                                              type:'likert', factor:'E', reversed:true  },
  { id:24, text:'Я люблю быть в центре внимания',                              type:'likert', factor:'E', reversed:false },
  { id:25, text:'Предпочитаю держаться в тени',                                type:'likert', factor:'E', reversed:true  },
  { id:26, text:'Я начинаю разговор первым',                                   type:'likert', factor:'E', reversed:false },
  { id:27, text:'В компании я чаще молчу',                                     type:'likert', factor:'E', reversed:true  },
  { id:28, text:'Я умею поднять настроение окружающим',                        type:'likert', factor:'E', reversed:false },
  { id:29, text:'Я полон энергии',                                              type:'likert', factor:'E', reversed:false },
  { id:30, text:'Я предпочитаю уединение шумным собраниям',                    type:'likert', factor:'E', reversed:true  },

  // Доброжелательность (Agreeableness) — 10 вопросов
  { id:31, text:'Меня интересуют люди',                                         type:'likert', factor:'A', reversed:false },
  { id:32, text:'Я сочувствую другим',                                          type:'likert', factor:'A', reversed:false },
  { id:33, text:'Я не очень интересуюсь проблемами других',                    type:'likert', factor:'A', reversed:true  },
  { id:34, text:'Я создаю людям удобства',                                      type:'likert', factor:'A', reversed:false },
  { id:35, text:'Я оскорбляю людей',                                            type:'likert', factor:'A', reversed:true  },
  { id:36, text:'Я умею найти время для других',                                type:'likert', factor:'A', reversed:false },
  { id:37, text:'Я чувствую чужую боль',                                        type:'likert', factor:'A', reversed:false },
  { id:38, text:'Мне безразличны чужие проблемы',                              type:'likert', factor:'A', reversed:true  },
  { id:39, text:'Я стараюсь понять точку зрения другого человека',             type:'likert', factor:'A', reversed:false },
  { id:40, text:'Я думаю только о себе',                                        type:'likert', factor:'A', reversed:true  },

  // Нейротизм (Neuroticism) — 10 вопросов
  { id:41, text:'Я легко расстраиваюсь',                                        type:'likert', factor:'N', reversed:false },
  { id:42, text:'Перемены в настроении происходят у меня часто',               type:'likert', factor:'N', reversed:false },
  { id:43, text:'Я почти всегда спокоен',                                       type:'likert', factor:'N', reversed:true  },
  { id:44, text:'Я часто испытываю беспокойство',                              type:'likert', factor:'N', reversed:false },
  { id:45, text:'Стресс мало на меня влияет',                                  type:'likert', factor:'N', reversed:true  },
  { id:46, text:'Меня легко вывести из равновесия',                            type:'likert', factor:'N', reversed:false },
  { id:47, text:'Я редко чувствую тревогу',                                    type:'likert', factor:'N', reversed:true  },
  { id:48, text:'Я часто чувствую себя подавленным',                           type:'likert', factor:'N', reversed:false },
  { id:49, text:'Эмоции не захлёстывают меня',                                 type:'likert', factor:'N', reversed:true  },
  { id:50, text:'Я часто чувствую себя несчастным',                            type:'likert', factor:'N', reversed:false },
];

// ── Алгоритм подсчёта ─────────────────────────────────────────
function calculate(answers) {
  const factors   = { O:0, C:0, E:0, A:0, N:0 };
  const counts    = { O:0, C:0, E:0, A:0, N:0 };

  questions.forEach(q => {
    const raw = answers[q.id];
    if (raw === undefined || raw === null) return;
    const score = q.reversed ? (6 - raw) : raw;
    factors[q.factor] += score;
    counts[q.factor]++;
  });

  // Нормализация в проценты (10 вопросов × макс.5 = 50)
  const percentages = {};
  Object.entries(factors).forEach(([f, sum]) => {
    const maxScore = (counts[f] || 10) * 5;
    percentages[f] = Math.round((sum / maxScore) * 100);
  });

  return { factors, percentages };
}

// ── Экспорт конфига ───────────────────────────────────────────
export const bigFiveConfig = {
  id: 'bigfive', name: 'Big Five — OCEAN', shortName: 'Big Five',
  description: 'Пятифакторная модель личности: Открытость, Добросовестность, Экстраверсия, Доброжелательность, Нейротизм',
  timeMinutes: 12, questionCount: 50,
  categories: ['личность'], difficulty: 'easy',
  questions, calculate,
};
