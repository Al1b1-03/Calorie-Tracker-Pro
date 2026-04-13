import { useEffect, useRef, useState } from 'react';
import { supportApi } from '../api/support';
import './AiAssistant.css';

const INITIAL_MESSAGES = [
  {
    id: 1,
    from: 'bot',
    text: 'Привет! Я помощник Calorie Tracker Pro. Могу подсказать по тренировкам, покупкам и примерной калорийности продуктов (например: «Сколько калорий в банане?»).',
  },
];

const POPULAR_QUESTIONS = [
  'Как найти тренировку на пресс?',
  'Как оформить заказ в магазине?',
  'Сколько калорий в банане?',
  'Как рассчитать БЖУ?',
  'Какой дефицит калорий выбрать для похудения?',
];

const ChatIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M8 10h8M8 14h5M7.2 19.2l-2.4 1.2V6.8A2.8 2.8 0 017.6 4h8.8a2.8 2.8 0 012.8 2.8v8.4a2.8 2.8 0 01-2.8 2.8H9.2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

let nextId = INITIAL_MESSAGES.length + 1;
const SEEN_REPLIES_STORAGE_KEY = 'ctp_seen_support_replies';
const SUPPORT_POLL_MS = 2000;

function buildAnswer(question) {
  const q = question.toLowerCase();
  const normalized = q.replace(/ё/g, 'е');
  const numbers = normalized.match(/\d+(?:[.,]\d+)?/g)?.map((n) => Number(n.replace(',', '.'))) || [];

  const hasAny = (parts) => parts.some((p) => normalized.includes(p));

  const format = (n) => (Number.isFinite(n) ? Math.round(n) : 0);

  const bmiFromText = () => {
    if (!hasAny(['имт', 'bmi'])) return null;
    if (numbers.length < 2) return 'Для расчета ИМТ напиши вес и рост, например: "ИМТ 72 175".';
    const [weight, heightCm] = numbers;
    const h = heightCm / 100;
    if (h <= 0 || weight <= 0) return 'Проверь данные: вес и рост должны быть больше нуля.';
    const bmi = weight / (h * h);
    let label = 'норма';
    if (bmi < 18.5) label = 'дефицит массы';
    else if (bmi >= 25 && bmi < 30) label = 'избыточный вес';
    else if (bmi >= 30) label = 'ожирение';
    return `Твой ИМТ примерно ${bmi.toFixed(1)} — ${label}. Это ориентир, не медицинский диагноз.`;
  };

  const macrosHelp = () => {
    if (!hasAny(['бжу', 'макро', 'macros'])) return null;
    if (numbers.length < 1) {
      return 'Могу быстро посчитать БЖУ по калориям. Напиши, например: "БЖУ 2000".';
    }
    const kcal = numbers[0];
    const protein = (kcal * 0.3) / 4;
    const fat = (kcal * 0.3) / 9;
    const carbs = (kcal * 0.4) / 4;
    return `Для ${format(kcal)} ккал ориентир: Белки ${format(protein)} г, Жиры ${format(fat)} г, Углеводы ${format(carbs)} г.`;
  };

  // Приветствия
  if (/(^|\s)(привет|здравствуй|здравствуйте|hi|hello)(\s|!|\.|$)/i.test(q)) {
    return 'Привет! Я помогу с питанием, тренировками, БЖУ, ИМТ и магазином. Например: "БЖУ 2000" или "как оформить заказ".';
  }

  const bmiAnswer = bmiFromText();
  if (bmiAnswer) return bmiAnswer;

  const macrosAnswer = macrosHelp();
  if (macrosAnswer) return macrosAnswer;

  if (hasAny(['похуд', 'дефицит'])) {
    return 'Для снижения веса обычно используют дефицит 10-20% от поддержки. Начни с ~15%, держи белок 1.6-2.2 г/кг и следи за динамикой 2-3 недели.';
  }
  if (hasAny(['набор', 'масса', 'профицит'])) {
    return 'Для набора массы обычно делают профицит 5-12% от поддержки, белок 1.6-2.2 г/кг, силовые 3-4 раза в неделю и контроль набора +0.2-0.4 кг/нед.';
  }
  if (hasAny(['поддерж', 'maintenance'])) {
    return 'Поддержка — это калории, при которых вес стабильный. Отслеживай вес 10-14 дней и корректируй дневную норму на ±100-150 ккал при необходимости.';
  }

  // Простые ответы про калорийность продуктов
  if (q.includes('калор') || q.includes('ккал')) {
    const foods = [
      { key: 'банан', answer: 'Примерно 89 ккал на 100 г (средний банан — около 100–120 ккал).' },
      { key: 'яблок', answer: 'Примерно 52 ккал на 100 г (одно среднее яблоко — около 80–90 ккал).' },
      { key: 'апельсин', answer: 'Примерно 43 ккал на 100 г (один апельсин — около 60–80 ккал).' },
      { key: 'куриц', answer: 'В варёной куриной грудке без кожи примерно 165 ккал на 100 г.' },
      { key: 'рис', answer: 'В отварном белом рисе примерно 130 ккал на 100 г.' },
      { key: 'яйц', answer: 'В одном курином яйце среднего размера примерно 70–80 ккал.' },
      { key: 'овсян', answer: 'В сухих овсяных хлопьях около 360 ккал на 100 г, в готовой каше на воде — меньше, около 90–110 ккал на порцию.' },
      { key: 'творог', answer: 'В обезжиренном твороге примерно 80–90 ккал на 100 г, в жирном — 150–170 ккал.' },
    ];

    const found = foods.find((f) => q.includes(f.key));
    if (found) {
      return `По приблизительным данным: ${found.answer} Помни, что точное значение зависит от производителя и порции.`;
    }

    return 'Могу подсказать калорийность базовых продуктов. Попробуй: "калории в банане", "калории в курице", "калории в рисе".';
  }

  if (hasAny(['трениров', 'пресс', 'спина', 'ног', 'кардио', 'рук'])) {
    return 'Тренировки находятся в разделе «Тренировки». Выбери категорию (руки, пресс/кор, спина, ноги, кардио, всё тело) и открой карточку для подробной техники и режима.';
  }
  if (hasAny(['товар', 'магазин', 'каталог', 'покупк', 'витамин'])) {
    return 'Каталог находится в разделе «Покупка продуктов»: выбери товар, добавь в корзину и перейди к оплате.';
  }
  if (hasAny(['заказ', 'доставк', 'оплат', 'корзин'])) {
    return 'Оформление: «Покупка продуктов» → «Корзина» → адрес и карта → оплата. После этого заказ уходит в обработку администратору.';
  }
  if (hasAny(['профил', 'анкета', 'данные', 'рост', 'вес', 'возраст'])) {
    return 'В разделе «Профиль» заполни рост, вес, возраст и активность — это помогает точнее ориентироваться по калориям и БЖУ.';
  }
  if (hasAny(['ошибк', 'не работа', 'проблем', 'баг', 'оператор', 'гид'])) {
    return 'Если нужна помощь человека, нажми «Связаться с гидом» в чате и опиши проблему. Гид обработает запрос и ответит здесь.';
  }
  if (hasAny(['спасибо', 'благодар'])) {
    return 'Всегда пожалуйста! Если хочешь, могу помочь составить простой план питания или тренировок на неделю.';
  }

  return 'Могу помочь с: калориями, БЖУ, ИМТ, тренировками, заказами и профилем. Примеры: "БЖУ 2000", "ИМТ 72 175", "как оформить заказ", "тренировка на пресс".';
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [position, setPosition] = useState({ right: 24, bottom: 128 });
  const [isOperatorFormOpen, setIsOperatorFormOpen] = useState(false);
  const [operatorMessage, setOperatorMessage] = useState('');
  const [operatorSending, setOperatorSending] = useState(false);
  const [isPopularOpen, setIsPopularOpen] = useState(false);

  const dragStateRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startRight: 24,
    startBottom: 128,
  });
  const messagesRef = useRef(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const askPopularQuestion = (question) => {
    const userMsg = { id: nextId++, from: 'user', text: question };
    const botMsg = { id: nextId++, from: 'bot', text: buildAnswer(question) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const getReplySignature = (message) =>
    `${message?.id}:${message?.repliedAt || message?.updatedAt || message?.adminReply || ''}`;

  const markReplyAsSeen = (message) => {
    const key = getReplySignature(message);
    let seen = [];
    try {
      const raw = localStorage.getItem(SEEN_REPLIES_STORAGE_KEY);
      seen = raw ? JSON.parse(raw) : [];
    } catch {
      seen = [];
    }
    if (!Array.isArray(seen) || seen.includes(key)) return;
    const next = [...seen, key];
    localStorage.setItem(SEEN_REPLIES_STORAGE_KEY, JSON.stringify(next));
  };

  const isReplySeen = (message) => {
    const key = getReplySignature(message);
    try {
      const raw = localStorage.getItem(SEEN_REPLIES_STORAGE_KEY);
      const seen = raw ? JSON.parse(raw) : [];
      return Array.isArray(seen) ? seen.includes(key) : false;
    } catch {
      return false;
    }
  };

  const handleOperatorSend = async () => {
    const text = operatorMessage.trim();
    if (!text) return;
    if (!localStorage.getItem('token')) {
      const botMsg = { id: nextId++, from: 'bot', text: 'Чтобы написать гиду, сначала войдите в аккаунт.' };
      setMessages((prev) => [...prev, botMsg]);
      setIsOperatorFormOpen(false);
      setOperatorMessage('');
      return;
    }
    setOperatorSending(true);
    try {
      await supportApi.createMessage({
        subject: 'Сообщение из чата',
        message: text,
      });
      const userMsg = { id: nextId++, from: 'user', text: `Гиду: ${text}` };
      const botMsg = {
        id: nextId++,
        from: 'bot',
        text: 'Спасибо за обращение! Наш гид лично обработает ваш запрос и скоро даст ответ.',
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setOperatorMessage('');
      setIsOperatorFormOpen(false);
    } catch (err) {
      const botMsg = { id: nextId++, from: 'bot', text: err.message || 'Не удалось отправить сообщение гиду.' };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setOperatorSending(false);
    }
  };

  useEffect(() => {
    let stopped = false;

    const pollReplies = async () => {
      if (!localStorage.getItem('token')) return;
      try {
        const { messages: list } = await supportApi.listMyMessages();
        const items = Array.isArray(list) ? list : [];
        const newReplies = items
          .filter((m) => m?.adminReply && m?.id != null && !isReplySeen(m))
          .sort((a, b) => new Date(a.repliedAt || a.updatedAt || 0) - new Date(b.repliedAt || b.updatedAt || 0));

        if (newReplies.length > 0) {
          setMessages((prev) => {
            const appended = newReplies.map((m) => ({
              id: nextId++,
              from: 'bot',
              text: `Ответ гида: ${m.adminReply}`,
            }));
            return [...prev, ...appended];
          });
          newReplies.forEach((m) => markReplyAsSeen(m));
        }
      } catch {
        // silent polling errors
      }
    };

    pollReplies();
    const onFocus = () => pollReplies();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') pollReplies();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    const timer = window.setInterval(() => {
      if (!stopped) pollReplies();
    }, SUPPORT_POLL_MS);

    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: nextId++, from: 'user', text };
    const botMsg = { id: nextId++, from: 'bot', text: buildAnswer(text) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  // Автопрокрутка сообщений к последнему
  useEffect(() => {
    if (!messagesRef.current) return;
    const el = messagesRef.current;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleDragStart = (event) => {
    const e = event.touches ? event.touches[0] : event;
    dragStateRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startRight: position.right,
      startBottom: position.bottom,
    };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (event) => {
    const state = dragStateRef.current;
    if (!state.dragging) return;
    const e = event.touches ? event.touches[0] : event;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    setPosition(() => {
      const nextRight = Math.max(8, state.startRight - dx);
      // Минимальный отступ от низа, чтобы поле ввода всегда было кликабельно,
      // и максимальный — чтобы окно не уезжало слишком высоко.
      const viewportH = window.innerHeight || 800;
      const minBottom = Math.min(160, Math.max(80, viewportH * 0.18));
      const maxBottom = Math.max(minBottom, viewportH - 260);
      const rawBottom = state.startBottom - dy;
      const nextBottom = Math.min(Math.max(minBottom, rawBottom), maxBottom);
      return { right: nextRight, bottom: nextBottom };
    });

    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const handleDragEnd = () => {
    dragStateRef.current.dragging = false;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleDragMove);
    window.removeEventListener('touchend', handleDragEnd);
  };

  useEffect(
    () => () => {
      // cleanup при размонтировании
      handleDragEnd();
    },
    []
  );

  // Не показываем помощника на страницах входа и регистрации
  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '';
    if (path.startsWith('/login') || path.startsWith('/registration')) {
      return null;
    }
  }

  return (
    <div
      className="ai-assistant"
      style={{ right: `${position.right}px`, bottom: `${position.bottom}px` }}
    >
      {isOpen && (
        <div className="ai-assistant__panel">
          <div
            className="ai-assistant__header"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <span className="ai-assistant__title">Чат</span>
            <button
              type="button"
              className="ai-assistant__close"
              onClick={toggleOpen}
              aria-label="Свернуть помощника"
            >
              ×
            </button>
          </div>
          <div className="ai-assistant__body">
            <div className="ai-assistant__messages" ref={messagesRef}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`ai-assistant__message ai-assistant__message--${m.from}`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="ai-assistant__hint ai-assistant__hint-btn"
              onClick={() => setIsPopularOpen((prev) => !prev)}
            >
              {isPopularOpen ? 'Скрыть популярные вопросы' : 'Показать популярные вопросы'}
            </button>
            {isPopularOpen && (
              <div className="ai-assistant__popular">
                {POPULAR_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="ai-assistant__popular-btn"
                    onClick={() => askPopularQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className="ai-assistant__operator-btn"
              onClick={() => setIsOperatorFormOpen((prev) => !prev)}
            >
              Связаться с гидом
            </button>
            {isOperatorFormOpen && (
              <div className="ai-assistant__operator">
                <textarea
                  className="ai-assistant__operator-input"
                  rows={3}
                  placeholder="Напишите сообщение гиду..."
                  value={operatorMessage}
                  onChange={(e) => setOperatorMessage(e.target.value)}
                />
                <button
                  type="button"
                  className="ai-assistant__operator-send"
                  disabled={operatorSending || !operatorMessage.trim()}
                  onClick={handleOperatorSend}
                >
                  {operatorSending ? 'Отправка...' : 'Отправить гиду'}
                </button>
              </div>
            )}
            <form className="ai-assistant__form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="ai-assistant__input"
                placeholder="Напишите вопрос…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="ai-assistant__send">
                Отправить
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        type="button"
        className="ai-assistant__toggle"
        onClick={toggleOpen}
        aria-label={isOpen ? 'Скрыть помощника' : 'Открыть помощника'}
      >
        <span className="ai-assistant__toggle-icon">
          <ChatIcon />
        </span>
      </button>
    </div>
  );
}

