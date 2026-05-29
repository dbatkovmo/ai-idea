import {Card, Statistic, Tag, Typography} from 'antd';

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
};

export function StatCard({label, value, delta}: StatCardProps) {
  return (
    <Card hoverable bordered={false} styles={{body: {padding: 20}}}>
      <Tag style={{marginBottom: 16}}>1X2</Tag>
      <Statistic title={label} value={value} />
      <Typography.Text type="secondary" style={{display: 'block', marginTop: 12, fontSize: 13}}>
        {delta}
      </Typography.Text>
    </Card>
  );
}
