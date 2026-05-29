import {Card, Statistic, Typography} from 'antd';

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
};

export function StatCard({label, value, delta}: StatCardProps) {
  return (
    <Card className="kpi-card" variant="borderless">
      <span className="kpi-card__chip" aria-hidden="true">
        1X2
      </span>
      <Statistic className="kpi-card__stat" title={label} value={value} />
      <Typography.Text className="kpi-card__delta">{delta}</Typography.Text>
    </Card>
  );
}
