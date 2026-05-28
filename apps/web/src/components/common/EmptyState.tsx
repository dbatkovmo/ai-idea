import {Empty} from 'antd';

type EmptyStateProps = {
  title?: string;
};

export function EmptyState({title = 'No rows match current filters'}: EmptyStateProps) {
  return <Empty className="empty-state" description={title} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
}
