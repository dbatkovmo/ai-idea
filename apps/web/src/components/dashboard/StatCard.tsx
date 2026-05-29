type StatCardProps = {
  label: string;
  value: string;
  delta: string;
};

export function StatCard({label, value, delta}: StatCardProps) {
  return (
    <article className="stat-card">
      <span className="stat-card__icon" aria-hidden="true">
        1X2
      </span>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      <span className="stat-card__delta">{delta}</span>
    </article>
  );
}
