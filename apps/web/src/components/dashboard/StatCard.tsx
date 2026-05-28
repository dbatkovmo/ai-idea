type StatCardProps = {
  label: string;
  value: string;
  delta: string;
};

export function StatCard({label, value, delta}: StatCardProps) {
  return (
    <article className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      <span className="stat-card__delta">{delta}</span>
    </article>
  );
}
