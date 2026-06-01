/**
 * ФАЙЛ: EmptyState.jsx
 * ЧТО ЭТО: UI: пустой список.
 * ЗА ЧТО ОТВЕЧАЕТ: заглушка «нет данных».
 */
export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="ui-empty" role="status">
      {icon && <span className="ui-empty__icon" aria-hidden>{icon}</span>}
      {title && <h3 className="ui-empty__title">{title}</h3>}
      {description && <p className="ui-empty__text">{description}</p>}
      {action}
    </div>
  );
}
