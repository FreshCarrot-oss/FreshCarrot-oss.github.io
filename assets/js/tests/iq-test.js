/* Файл: assets/js/tests/iq-test.js */
/* IQ-тест: 40 задач (числовые, словесные, пространственные, логические) + таймер */

// ── Нормальное распределение (CDF) ────────────────────────────
export function normalCDF(z) {
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + p * x);
  const poly = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  return 0.5 * (1 + sign * (1 - poly * Math.exp(-x * x)));
}

// ── Категория IQ ──────────────────────────────────────────────
export function getIQCategory(iq) {
  if (iq >= 130) return 'Очень высокий интеллект';
  if (iq >= 120) return 'Высокий интеллект';
  if (iq >= 110) return 'Выше среднего';
  if (iq >= 90)  return 'Средний интеллект';
  if (iq >= 80)  return 'Ниже среднего';
  return 'Низкий результат';
}

// ── 40 задач ─────────────────────────────────────────────────
const questions = [
  // ── ЧИСЛОВЫЕ (1–10) ──────────────────────────────────────────
  {
    id:1, text:'Найдите следующее число в ряду: 2, 4, 8, 16, __', type:'choice',
    answers:[{text:'24',value:0},{text:'32',value:1},{text:'28',value:0},{text:'36',value:0}],
    correctIndex:1, category:'числовые'
  },
  {
    id:2, text:'Найдите следующее число: 3, 6, 12, 24, __', type:'choice',
    answers:[{text:'36',value:0},{text:'42',value:0},{text:'48',value:1},{text:'30',value:0}],
    correctIndex:2, category:'числовые'
  },
  {
    id:3, text:'Продолжите ряд: 1, 4, 9, 16, 25, __', type:'choice',
    answers:[{text:'30',value:0},{text:'36',value:1},{text:'35',value:0},{text:'49',value:0}],
    correctIndex:1, category:'числовые'
  },
  {
    id:4, text:'Найдите закономерность: 100, 50, 25, 12.5, __', type:'choice',
    answers:[{text:'6.25',value:1},{text:'10',value:0},{text:'5',value:0},{text:'6',value:0}],
    correctIndex:0, category:'числовые'
  },
  {
    id:5, text:'Какое число пропущено: 5, 10, __, 20, 25?', type:'choice',
    answers:[{text:'12',value:0},{text:'14',value:0},{text:'15',value:1},{text:'16',value:0}],
    correctIndex:2, category:'числовые'
  },
  {
    id:6, text:'Продолжите: 1, 1, 2, 3, 5, 8, __', type:'choice',
    answers:[{text:'12',value:0},{text:'13',value:1},{text:'11',value:0},{text:'14',value:0}],
    correctIndex:1, category:'числовые'
  },
  {
    id:7, text:'Найдите следующее: 2, 6, 18, 54, __', type:'choice',
    answers:[{text:'108',value:0},{text:'162',value:1},{text:'120',value:0},{text:'180',value:0}],
    correctIndex:1, category:'числовые'
  },
  {
    id:8, text:'Закономерность: 7, 14, 21, 28, __', type:'choice',
    answers:[{text:'34',value:0},{text:'35',value:1},{text:'42',value:0},{text:'36',value:0}],
    correctIndex:1, category:'числовые'
  },
  {
    id:9, text:'Найдите пропущенное: 81, 27, 9, 3, __', type:'choice',
    answers:[{text:'2',value:0},{text:'0',value:0},{text:'1',value:1},{text:'0.5',value:0}],
    correctIndex:2, category:'числовые'
  },
  {
    id:10, text:'Продолжите ряд: 2, 3, 5, 7, 11, 13, __', type:'choice',
    answers:[{text:'15',value:0},{text:'16',value:0},{text:'17',value:1},{text:'14',value:0}],
    correctIndex:2, category:'числовые'
  },

  // ── СЛОВЕСНЫЕ (11–20) ─────────────────────────────────────────
  {
    id:11, text:'Слово «кошка» относится к «животному», как слово «роза» относится к...', type:'choice',
    answers:[{text:'Цвету',value:0},{text:'Растению',value:1},{text:'Шипу',value:0},{text:'Саду',value:0}],
    correctIndex:1, category:'словесные'
  },
  {
    id:12, text:'Найдите лишнее слово: яблоко, груша, морковь, слива, апельсин', type:'choice',
    answers:[{text:'Яблоко',value:0},{text:'Апельсин',value:0},{text:'Морковь',value:1},{text:'Груша',value:0}],
    correctIndex:2, category:'словесные'
  },
  {
    id:13, text:'Антоним слова «бодрый»...', type:'choice',
    answers:[{text:'Быстрый',value:0},{text:'Вялый',value:1},{text:'Сонный',value:0},{text:'Тихий',value:0}],
    correctIndex:1, category:'словесные'
  },
  {
    id:14, text:'«Нож» → «резать», «кисть» → ...', type:'choice',
    answers:[{text:'Красить',value:1},{text:'Рисовать',value:0},{text:'Смешивать',value:0},{text:'Чистить',value:0}],
    correctIndex:0, category:'словесные'
  },
  {
    id:15, text:'Найдите лишнее: Москва, Лондон, Берлин, Луна, Токио', type:'choice',
    answers:[{text:'Москва',value:0},{text:'Берлин',value:0},{text:'Луна',value:1},{text:'Токио',value:0}],
    correctIndex:2, category:'словесные'
  },
  {
    id:16, text:'«Врач» лечит «болезнь», «учитель» ...', type:'choice',
    answers:[{text:'Работает',value:0},{text:'Преподаёт знания',value:1},{text:'Воспитывает детей',value:0},{text:'Проводит уроки',value:0}],
    correctIndex:1, category:'словесные'
  },
  {
    id:17, text:'Найдите лишнее: треугольник, квадрат, круг, прямоугольник, куб', type:'choice',
    answers:[{text:'Треугольник',value:0},{text:'Круг',value:0},{text:'Куб',value:1},{text:'Квадрат',value:0}],
    correctIndex:2, category:'словесные'
  },
  {
    id:18, text:'«День» относится к «неделе», как «месяц» относится к...', type:'choice',
    answers:[{text:'Дням',value:0},{text:'Году',value:1},{text:'Времени',value:0},{text:'Кварталу',value:0}],
    correctIndex:1, category:'словесные'
  },
  {
    id:19, text:'Синоним слова «необъятный»...', type:'choice',
    answers:[{text:'Далёкий',value:0},{text:'Громкий',value:0},{text:'Безграничный',value:1},{text:'Высокий',value:0}],
    correctIndex:2, category:'словесные'
  },
  {
    id:20, text:'Найдите лишнее: пианино, скрипка, гитара, барабан, кисть', type:'choice',
    answers:[{text:'Пианино',value:0},{text:'Барабан',value:0},{text:'Кисть',value:1},{text:'Скрипка',value:0}],
    correctIndex:2, category:'словесные'
  },

  // ── ПРОСТРАНСТВЕННЫЕ (21–30) ──────────────────────────────────
  {
    id:21, text:'Сколько граней у куба?', type:'choice',
    answers:[{text:'4',value:0},{text:'8',value:0},{text:'6',value:1},{text:'12',value:0}],
    correctIndex:2, category:'пространственные'
  },
  {
    id:22, text:'Если повернуть букву «Р» на 180° вокруг горизонтальной оси, что получится?', type:'choice',
    answers:[{text:'«d»',value:0},{text:'«Ч» перевёрнутое',value:1},{text:'«b»',value:0},{text:'«q»',value:0}],
    correctIndex:1, category:'пространственные'
  },
  {
    id:23, text:'В ряду фигур: ○ □ △ ○ □ △ ○ — что идёт следующим?', type:'choice',
    answers:[{text:'○',value:0},{text:'□',value:1},{text:'△',value:0},{text:'◇',value:0}],
    correctIndex:1, category:'пространственные'
  },
  {
    id:24, text:'Сколько треугольников в квадрате, разделённом двумя диагоналями?', type:'choice',
    answers:[{text:'2',value:0},{text:'3',value:0},{text:'4',value:1},{text:'6',value:0}],
    correctIndex:2, category:'пространственные'
  },
  {
    id:25, text:'Зеркальное отражение числа «12» — это...', type:'choice',
    answers:[{text:'21',value:0},{text:'12 с инвертированными цифрами',value:1},{text:'21 перевёрнутое',value:0},{text:'Нет изменений',value:0}],
    correctIndex:1, category:'пространственные'
  },
  {
    id:26, text:'Если сложить лист бумаги пополам дважды и проколоть — сколько отверстий получится при развёртывании?', type:'choice',
    answers:[{text:'2',value:0},{text:'4',value:1},{text:'8',value:0},{text:'1',value:0}],
    correctIndex:1, category:'пространственные'
  },
  {
    id:27, text:'Сколько осей симметрии у правильного шестиугольника?', type:'choice',
    answers:[{text:'3',value:0},{text:'6',value:1},{text:'4',value:0},{text:'12',value:0}],
    correctIndex:1, category:'пространственные'
  },
  {
    id:28, text:'Фигура: ▲ ▲ ▲ / ▲ ▲ / ▲ — сколько треугольников?', type:'choice',
    answers:[{text:'6',value:1},{text:'7',value:0},{text:'9',value:0},{text:'10',value:0}],
    correctIndex:0, category:'пространственные'
  },
  {
    id:29, text:'Если развернуть куб, сколько квадратов получится?', type:'choice',
    answers:[{text:'4',value:0},{text:'5',value:0},{text:'6',value:1},{text:'8',value:0}],
    correctIndex:2, category:'пространственные'
  },
  {
    id:30, text:'Паттерн: ● ○ ○ ● ○ ○ ● ○ — что следует?', type:'choice',
    answers:[{text:'●',value:0},{text:'○',value:1},{text:'●○',value:0},{text:'○○',value:0}],
    correctIndex:1, category:'пространственные'
  },

  // ── ЛОГИЧЕСКИЕ (31–40) ────────────────────────────────────────
  {
    id:31, text:'Все кошки — животные. Барсик — кошка. Следовательно...', type:'choice',
    answers:[{text:'Барсик — не животное',value:0},{text:'Барсик — животное',value:1},{text:'Все животные — кошки',value:0},{text:'Нельзя сказать',value:0}],
    correctIndex:1, category:'логические'
  },
  {
    id:32, text:'Если А > Б и Б > В, то...', type:'choice',
    answers:[{text:'А < В',value:0},{text:'А = В',value:0},{text:'А > В',value:1},{text:'Нельзя сказать',value:0}],
    correctIndex:2, category:'логические'
  },
  {
    id:33, text:'Мария выше Ивана. Иван выше Петра. Кто самый низкий?', type:'choice',
    answers:[{text:'Мария',value:0},{text:'Иван',value:0},{text:'Пётр',value:1},{text:'Нельзя определить',value:0}],
    correctIndex:2, category:'логические'
  },
  {
    id:34, text:'Некоторые птицы не умеют летать. Пингвин — птица. Значит...', type:'choice',
    answers:[{text:'Пингвин летает',value:0},{text:'Пингвин не летает',value:0},{text:'Пингвин может не уметь летать',value:1},{text:'Пингвин — не птица',value:0}],
    correctIndex:2, category:'логические'
  },
  {
    id:35, text:'Если сегодня вторник, то послезавтра будет...', type:'choice',
    answers:[{text:'Среда',value:0},{text:'Пятница',value:0},{text:'Четверг',value:1},{text:'Суббота',value:0}],
    correctIndex:2, category:'логические'
  },
  {
    id:36, text:'Все студенты учатся. Никита учится. Следовательно...', type:'choice',
    answers:[{text:'Никита — студент',value:0},{text:'Никита может быть студентом',value:1},{text:'Никита — не студент',value:0},{text:'Все учащиеся — студенты',value:0}],
    correctIndex:1, category:'логические'
  },
  {
    id:37, text:'Завтра Анна пойдёт в кино, если не будет дождя. Дождь был вчера. Пойдёт ли Анна в кино?', type:'choice',
    answers:[{text:'Да',value:0},{text:'Нет',value:0},{text:'Нельзя определить однозначно',value:1},{text:'Скорее всего нет',value:0}],
    correctIndex:2, category:'логические'
  },
  {
    id:38, text:'Если все А есть Б, и все Б есть В, то...', type:'choice',
    answers:[{text:'Некоторые В есть А',value:0},{text:'Все В есть А',value:0},{text:'Все А есть В',value:1},{text:'Нет связи между А и В',value:0}],
    correctIndex:2, category:'логические'
  },
  {
    id:39, text:'3 рабочих копают канаву за 6 часов. Сколько рабочих нужно, чтобы выкопать за 2 часа?', type:'choice',
    answers:[{text:'6',value:0},{text:'9',value:1},{text:'12',value:0},{text:'4',value:0}],
    correctIndex:1, category:'логические'
  },
  {
    id:40, text:'В коробке 10 красных и 10 синих шаров. Сколько нужно достать (вслепую), чтобы гарантированно получить 2 шара одного цвета?', type:'choice',
    answers:[{text:'2',value:0},{text:'3',value:1},{text:'4',value:0},{text:'11',value:0}],
    correctIndex:1, category:'логические'
  },
];

// ── Алгоритм подсчёта IQ ─────────────────────────────────────
function calculate(answers, timeSpent = 1800) {
  let correct = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correctIndex) correct++;
  });

  // Базовый IQ (70–145)
  const baseIQ = 70 + Math.round((correct / 40) * 75);

  // Бонус за скорость (до +5)
  const timeBonus = timeSpent < 900 ? 5 : timeSpent < 1200 ? 3 : timeSpent < 1500 ? 1 : 0;

  const iq = Math.min(145, baseIQ + timeBonus);

  // Процентиль (μ=100, σ=15)
  const percentile = Math.round(normalCDF((iq - 100) / 15) * 100);

  return {
    iq,
    percentile,
    category: getIQCategory(iq),
    correct,
    total: 40,
    timeSpent,
  };
}

// ── Экспорт конфига ───────────────────────────────────────────
export const iqConfig = {
  id: 'iq', name: 'Тест интеллекта (IQ)', shortName: 'IQ',
  description: 'Числовые, словесные, пространственные и логические задачи. Таймер 30 минут.',
  timeMinutes: 30, questionCount: 40,
  categories: ['интеллект'], difficulty: 'hard',
  questions, calculate,
};
