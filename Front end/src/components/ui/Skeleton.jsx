/**
 * ФАЙЛ: Skeleton.jsx
 * ЧТО ЭТО: UI: скелетон загрузки.
 * ЗА ЧТО ОТВЕЧАЕТ: placeholder при lazy routes.
 */
export function Skeleton({ className = '', variant = 'text', style }) {
  return (
    <div
      className={`ui-skeleton ui-skeleton--${variant} ${className}`.trim()}
      style={style}
      aria-hidden
    />
  );
}

export function SkeletonCardList({ count = 3 }) {
  return (
    <div className="ui-stack" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
