/**
 * ФАЙЛ: AiAssistant.jsx
 * ЧТО ЭТО: Чат-помощник.
 * ЗА ЧТО ОТВЕЧАЕТ: подсказки + отправка в поддержку.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supportApi } from '../api/support';
import { authApi } from '../api/auth';
import { entriesApi } from '../api/entries';
import { waterApi } from '../api/water';
import { useLanguage } from '../i18n/LanguageContext';
import {
  ASSISTANT_TOPICS,
  buildAssistantReply,
  getWelcomeMessage,
} from '../utils/assistantEngine';
import './AiAssistant.css';

const SEEN_REPLIES_KEY = 'ctp_seen_support_replies';
const MESSAGES_KEY = 'ctp_assistant_messages';
const SUPPORT_POLL_MS = 8000;

let nextId = 1;

function loadStoredMessages() {
  try {
    const raw = sessionStorage.getItem(MESSAGES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      nextId = Math.max(...parsed.map((m) => m.id), 0) + 1;
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tpl(str, vars = {}) {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val ?? '')),
    str
  );
}

const ChatIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M8 10h8M8 14h5M7.2 19.2l-2.4 1.2V6.8A2.8 2.8 0 017.6 4h8.8a2.8 2.8 0 012.8 2.8v8.4a2.8 2.8 0 01-2.8 2.8H9.2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AiAssistant() {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState('assistant');
  const [messages, setMessages] = useState(() => loadStoredMessages() || []);
  const [input, setInput] = useState('');
  const [supportText, setSupportText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supportSending, setSupportSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [context, setContext] = useState({ isLoggedIn: false });

  const messagesRef = useRef(null);
  const initializedRef = useRef(false);

  const isLoggedIn = !!localStorage.getItem('token');

  const persistMessages = useCallback((list) => {
    try {
      sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(list.slice(-40)));
    } catch {
      /* ignore */
    }
  }, []);

  const appendMessage = useCallback(
    (msg) => {
      setMessages((prev) => {
        const next = [...prev, { ...msg, id: nextId++ }];
        persistMessages(next);
        return next;
      });
    },
    [persistMessages]
  );

  const loadContext = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setContext({ isLoggedIn: false });
      return;
    }
    try {
      const today = getLocalDateString();
      const [profileRes, statsRes, waterRes] = await Promise.allSettled([
        authApi.getProfile(),
        entriesApi.getStats(today),
        waterApi.getToday(today),
      ]);

      const profile = profileRes.status === 'fulfilled' ? profileRes.value?.user : null;
      const stats = statsRes.status === 'fulfilled' ? statsRes.value : null;
      const water = waterRes.status === 'fulfilled' ? waterRes.value : null;

      setContext({
        isLoggedIn: true,
        userName: profile?.firstName || '',
        calorieNorm: Number(profile?.calorieNorm ?? stats?.norm ?? 0) || 0,
        protein: Number(profile?.protein ?? stats?.macros?.protein ?? 0) || 0,
        fat: Number(profile?.fat ?? stats?.macros?.fat ?? 0) || 0,
        carbs: Number(profile?.carbs ?? stats?.macros?.carbs ?? 0) || 0,
        todayCalories: Number(stats?.today?.calories ?? 0) || 0,
        todayProtein: Number(stats?.today?.protein ?? 0) || 0,
        todayFat: Number(stats?.today?.fat ?? 0) || 0,
        todayCarbs: Number(stats?.today?.carbs ?? 0) || 0,
        waterMl: Number(water?.totalMl ?? 0) || 0,
        waterGoal: Number(water?.goalMl ?? 2000) || 2000,
      });
    } catch {
      setContext({ isLoggedIn: true });
    }
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (!loadStoredMessages()) {
        appendMessage({
          from: 'bot',
          text: getWelcomeMessage(t, { isLoggedIn }),
        });
      }
    }
  }, [appendMessage, isLoggedIn, t]);

  useEffect(() => {
    if (isOpen) loadContext();
  }, [isOpen, loadContext]);

  useEffect(() => {
    if (!isOpen || !context.isLoggedIn) return;
    const welcome = getWelcomeMessage(t, context);
    setMessages((prev) => {
      if (!prev.length || prev[0].from !== 'bot') return prev;
      if (prev[0].text === welcome) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], text: welcome };
      persistMessages(updated);
      return updated;
    });
  }, [context, isOpen, t, persistMessages]);

  const getReplySignature = (message) =>
    `${message?.id}:${message?.repliedAt || message?.updatedAt || message?.adminReply || ''}`;

  const markReplySeen = (message) => {
    const key = getReplySignature(message);
    try {
      const raw = localStorage.getItem(SEEN_REPLIES_KEY);
      const seen = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(seen) || seen.includes(key)) return;
      localStorage.setItem(SEEN_REPLIES_KEY, JSON.stringify([...seen, key]));
    } catch {
      /* ignore */
    }
  };

  const isReplySeen = (message) => {
    try {
      const raw = localStorage.getItem(SEEN_REPLIES_KEY);
      const seen = raw ? JSON.parse(raw) : [];
      return Array.isArray(seen) ? seen.includes(getReplySignature(message)) : false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    const pollReplies = async () => {
      try {
        const { messages: list } = await supportApi.listMyMessages();
        const items = Array.isArray(list) ? list : [];
        const newReplies = items.filter((m) => m?.adminReply && m?.id != null && !isReplySeen(m));

        if (newReplies.length > 0) {
          newReplies.forEach((m) => {
            appendMessage({
              from: 'guide',
              text: tpl(t('assistant.guideReply'), { text: m.adminReply }),
            });
            markReplySeen(m);
          });
          if (!isOpen) setUnreadCount((c) => c + newReplies.length);
        }
      } catch {
        /* silent */
      }
    };

    pollReplies();
    const timer = window.setInterval(pollReplies, SUPPORT_POLL_MS);
    return () => window.clearInterval(timer);
  }, [appendMessage, isLoggedIn, isOpen, t]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isTyping]);

  const respondToQuestion = async (question) => {
    const text = question.trim();
    if (!text) return;

    appendMessage({ from: 'user', text });
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 350 + Math.random() * 400));

    const reply = buildAssistantReply(text, t, context, lang);
    appendMessage({
      from: 'bot',
      text: reply.text,
      actions: reply.actions,
      chips: reply.chips,
    });
    setIsTyping(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    respondToQuestion(text);
  };

  const handleSupportSend = async () => {
    const text = supportText.trim();
    if (!text || supportSending) return;

    if (!isLoggedIn) {
      appendMessage({ from: 'bot', text: t('assistant.supportNeedLogin') });
      return;
    }

    setSupportSending(true);
    try {
      await supportApi.createMessage({ subject: 'Chat support', message: text });
      window.dispatchEvent(new CustomEvent('adminNotificationsUpdated'));
      appendMessage({ from: 'user', text });
      appendMessage({ from: 'bot', text: t('assistant.supportSent') });
      setSupportText('');
      setTab('assistant');
    } catch (err) {
      appendMessage({ from: 'bot', text: err.message || t('assistant.supportNeedLogin') });
    } finally {
      setSupportSending(false);
    }
  };

  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/registration')) {
    return null;
  }

  const displayMessages = messages;

  return (
    <div className="ai-assistant">
      {isOpen && (
        <div className="ai-assistant__panel glass-card" role="dialog" aria-label={t('assistant.title')}>
          <header className="ai-assistant__header">
            <div>
              <p className="ai-assistant__title">{t('assistant.title')}</p>
              {context.isLoggedIn && context.userName && (
                <p className="ai-assistant__subtitle">{context.userName}</p>
              )}
            </div>
            <button
              type="button"
              className="ai-assistant__close"
              onClick={() => setIsOpen(false)}
              aria-label={t('assistant.close')}
            >
              ×
            </button>
          </header>

          <div className="ai-assistant__tabs">
            <button
              type="button"
              className={`ai-assistant__tab ${tab === 'assistant' ? 'ai-assistant__tab--active' : ''}`}
              onClick={() => setTab('assistant')}
            >
              {t('assistant.tabAssistant')}
            </button>
            <button
              type="button"
              className={`ai-assistant__tab ${tab === 'support' ? 'ai-assistant__tab--active' : ''}`}
              onClick={() => setTab('support')}
            >
              {t('assistant.tabSupport')}
            </button>
          </div>

          <div className="ai-assistant__body">
            {tab === 'assistant' ? (
              <>
                <div className="ai-assistant__topics">
                  {ASSISTANT_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      className="ai-assistant__topic"
                      onClick={() => respondToQuestion(t(topic.questionKey))}
                    >
                      {t(`assistant.topics.${topic.id}.label`)}
                    </button>
                  ))}
                </div>

                <div className="ai-assistant__messages" ref={messagesRef}>
                  {displayMessages.map((m) => (
                    <div key={m.id} className={`ai-assistant__bubble ai-assistant__bubble--${m.from}`}>
                      <p className="ai-assistant__bubble-text">{m.text}</p>
                      {m.actions?.length > 0 && (
                        <div className="ai-assistant__actions">
                          {m.actions.map((action) => (
                            <Link
                              key={action.to + action.label}
                              to={action.to}
                              className="ai-assistant__action"
                              onClick={() => setIsOpen(false)}
                            >
                              {action.label}
                            </Link>
                          ))}
                        </div>
                      )}
                      {m.chips?.length > 0 && (
                        <div className="ai-assistant__chips">
                          {m.chips.map((chip) => (
                            <button
                              key={chip.question}
                              type="button"
                              className="ai-assistant__chip"
                              onClick={() => respondToQuestion(chip.question)}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="ai-assistant__bubble ai-assistant__bubble--bot ai-assistant__bubble--typing">
                      <span className="ai-assistant__dots" aria-hidden>
                        <span /><span /><span />
                      </span>
                      <span className="ai-assistant__typing-label">{t('assistant.typing')}</span>
                    </div>
                  )}
                </div>

                <form className="ai-assistant__form" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    className="ai-assistant__input"
                    placeholder={t('assistant.placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isTyping}
                  />
                  <button type="submit" className="ai-assistant__send" disabled={isTyping || !input.trim()}>
                    {t('assistant.send')}
                  </button>
                </form>
              </>
            ) : (
              <div className="ai-assistant__support">
                <p className="ai-assistant__support-hint">{t('assistant.supportHint')}</p>
                <textarea
                  className="ai-assistant__support-input"
                  rows={4}
                  placeholder={t('assistant.supportPlaceholder')}
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                />
                <button
                  type="button"
                  className="ai-assistant__support-send"
                  disabled={supportSending || !supportText.trim()}
                  onClick={handleSupportSend}
                >
                  {supportSending ? t('assistant.supportSending') : t('assistant.supportSend')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className="ai-assistant__toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? t('assistant.close') : t('assistant.open')}
      >
        <ChatIcon />
        {!isOpen && unreadCount > 0 && (
          <span className="ai-assistant__badge" aria-label={t('assistant.unreadBadge')}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
