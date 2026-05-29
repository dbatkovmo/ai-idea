'use client';

import {Table, Tag, Typography, type TableColumnsType} from 'antd';
import {ChevronRight} from 'lucide-react';
import {useLocale} from 'next-intl';
import type {ValueBet} from '@/types/analytics';

const {Text} = Typography;

function getColumns(isRu: boolean): TableColumnsType<ValueBet> {
  return [
    {
      title: isRu ? '\u041c\u0430\u0442\u0447' : 'Match',
      key: 'match',
      render: (_, row) => (
        <Typography.Text strong className="table-match">
          {row.homeTeam} - {row.awayTeam}
          <Text type="secondary" className="table-muted">
            {row.league} · {row.kickoff}
          </Text>
        </Typography.Text>
      )
    },
    {
      title: isRu ? '\u041f\u0438\u043a' : 'Pick',
      dataIndex: 'selection',
      key: 'selection',
      render: (selection: ValueBet['selection']) => {
        const selectionMap = {
          Home: isRu ? '\u041f1' : 'Home',
          Draw: 'X',
          Away: isRu ? '\u041f2' : 'Away'
        };

        return <Tag className="tag-pick">{selectionMap[selection]}</Tag>;
      }
    },
    {
      title: isRu ? '\u041c\u043e\u0434\u0435\u043b\u044c' : 'Model',
      dataIndex: 'modelProbability',
      key: 'modelProbability',
      render: (value: number) => `${(value * 100).toFixed(1)}%`
    },
    {
      title: 'Odds',
      dataIndex: 'bookmakerOdds',
      key: 'bookmakerOdds',
      render: (value: number) => value.toFixed(2)
    },
    {
      title: 'Fair',
      dataIndex: 'fairOdds',
      key: 'fairOdds',
      render: (value: number) => value.toFixed(2)
    },
    {
      title: 'EV',
      dataIndex: 'ev',
      key: 'ev',
      render: (value: number) => <Tag className="tag-ev">{(value * 100).toFixed(1)}%</Tag>
    },
    {
      title: isRu ? '\u0411\u0443\u043a' : 'Book',
      dataIndex: 'bookmaker',
      key: 'bookmaker'
    },
    {
      title: '',
      key: 'open',
      width: 42,
      render: () => <ChevronRight className="table-chevron" size={16} aria-hidden="true" />
    }
  ];
}

type ValueBetsTableProps = {
  bets: ValueBet[];
};

export function ValueBetsTable({bets}: ValueBetsTableProps) {
  const locale = useLocale();

  return (
    <Table<ValueBet>
      className="premium-table"
      columns={getColumns(locale !== 'en')}
      dataSource={bets}
      pagination={false}
      rowKey="id"
      scroll={{x: true}}
    />
  );
}
