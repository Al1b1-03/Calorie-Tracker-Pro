export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <header className="page__hero">
      {eyebrow && <p className="page__eyebrow">{eyebrow}</p>}
      <h1 className="page__title">{title}</h1>
      {subtitle && <p className="page__subtitle">{subtitle}</p>}
    </header>
  );
}
