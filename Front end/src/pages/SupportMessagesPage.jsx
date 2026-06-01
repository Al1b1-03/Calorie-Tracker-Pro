/**
 * ФАЙЛ: SupportMessagesPage.jsx
 * ЧТО ЭТО: Страница: обращения ADMIN.
 * ЗА ЧТО ОТВЕЧАЕТ: поддержка, статусы, ответ.
 */
import { useEffect, useRef, useState } from 'react';
import { supportApi } from '../api/support';
import { markSupportSeen, notifyAdminCountsChanged } from '../utils/adminNotifications';
import './SupportMessagesPage.css';

const STATUS_LABELS = {
  new: 'Новый',
  in_progress: 'В работе',
  done: 'Обработан',
};

export default function SupportMessagesPage() {
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [replyById, setReplyById] = useState({});

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const { messages: data } = await supportApi.listMessages();
      const list = Array.isArray(data) ? data : [];
      messagesRef.current = list;
      setMessages(list);
      notifyAdminCountsChanged();
    } catch (err) {
      setError(err.message || 'Ошибка загрузки обращений');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    return () => {
      const maxId = messagesRef.current.reduce(
        (max, msg) => Math.max(max, Number(msg.id) || 0),
        0
      );
      if (maxId > 0) markSupportSeen(maxId);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      load(true);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const onChangeStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await supportApi.updateStatus(id, status);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      notifyAdminCountsChanged();
    } catch (err) {
      setError(err.message || 'Ошибка обновления статуса');
    } finally {
      setUpdatingId(null);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Удалить это обращение?')) return;
    setUpdatingId(id);
    try {
      await supportApi.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      notifyAdminCountsChanged();
    } catch (err) {
      setError(err.message || 'Ошибка удаления обращения');
    } finally {
      setUpdatingId(null);
    }
  };

  const onReply = async (id) => {
    const reply = String(replyById[id] || '').trim();
    if (!reply) {
      setError('Введите текст ответа');
      return;
    }
    setUpdatingId(id);
    setError('');
    try {
      const { message } = await supportApi.replyMessage(id, reply);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, adminReply: message?.adminReply || reply, repliedAt: message?.repliedAt || new Date().toISOString(), status: message?.status || m.status }
            : m
        )
      );
      setReplyById((prev) => ({ ...prev, [id]: '' }));
      notifyAdminCountsChanged();
    } catch (err) {
      setError(err.message || 'Ошибка отправки ответа');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="support-page"><p>Загрузка...</p></div>;

  return (
    <div className="support-page">
      <h1 className="support-page__title">Обращения пользователей</h1>
      {error && <p className="support-page__error">{error}</p>}
      {messages.length === 0 ? (
        <p className="support-page__empty">Пока нет обращений</p>
      ) : (
        <div className="support-list">
          {messages.map((m) => (
            <article key={m.id} className="support-card">
              <div className="support-card__top">
                <h3 className="support-card__subject">{m.subject}</h3>
                <span className={`support-card__status support-card__status--${m.status}`}>
                  {STATUS_LABELS[m.status] || m.status}
                </span>
              </div>
              <p className="support-card__meta">{m.userName} ({m.userEmail})</p>
              <p className="support-card__message">{m.message}</p>
              {m.adminReply && (
                <div className="support-card__reply">
                  <strong>Ответ администратора:</strong>
                  <p>{m.adminReply}</p>
                </div>
              )}
              <div className="support-card__reply-form">
                <textarea
                  className="support-card__reply-input"
                  rows={3}
                  placeholder="Написать ответ пользователю..."
                  value={replyById[m.id] || ''}
                  onChange={(e) => setReplyById((prev) => ({ ...prev, [m.id]: e.target.value }))}
                />
                <button
                  type="button"
                  className="support-card__btn support-card__btn--primary"
                  onClick={() => onReply(m.id)}
                  disabled={updatingId === m.id}
                >
                  Ответить
                </button>
              </div>
              <div className="support-card__actions">
                <button
                  type="button"
                  className="support-card__btn support-card__btn--primary"
                  onClick={() => onChangeStatus(m.id, 'in_progress')}
                  disabled={updatingId === m.id || m.status === 'in_progress'}
                >
                  В работу
                </button>
                <button
                  type="button"
                  className="support-card__btn support-card__btn--primary"
                  onClick={() => onChangeStatus(m.id, 'done')}
                  disabled={updatingId === m.id || m.status === 'done'}
                >
                  Отметить обработанным
                </button>
                <button
                  type="button"
                  className="support-card__btn support-card__btn--danger"
                  onClick={() => onDelete(m.id)}
                  disabled={updatingId === m.id}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
