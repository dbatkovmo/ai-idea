import {Empty} from 'antd';

type EmptyStateProps = {
  title?: string;
};

export function EmptyState({title = 'Нет строк под текущие фильтры'}: EmptyStateProps) {
  return <Empty description={title} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
}
