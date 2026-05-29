'use client';

import {RightOutlined} from '@ant-design/icons';
import {Flex, Table, Tag, Typography, type TableColumnsType} from 'antd';
import {useLocale} from 'next-intl';
import type {ValueBet} from '@/types/analytics';

const {Text} = Typography;

function getColumns(isRu: boolean): TableColumnsType<ValueBet> {
  return [
    {
      title: isRu ? 'Матч' : 'Match',
      key: 'match',
      render: (_, row) => (
        <Flex vertical gap={4}>
          <Text strong>
            {row.homeTeam} - {row.awayTeam}
          </Text>
          <Text type="secondary" style={{fontSize: 12}}>
            {row.league} · {row.kickoff}
          </Text>
        </Flex>
      )
    },
    {
      title: isRu ? 'Пик' : 'Pick',
      dataIndex: 'selection',
      key: 'selection',
      render: (selection: ValueBet['selection']) => {
        const selectionMap = {
          Home: isRu ? 'П1' : 'Home',
          Draw: 'X',
          Away: isRu ? 'П2' : 'Away'
        };

        return <Tag style={{minWidth: 34, textAlign: 'center'}}>{selectionMap[selection]}</Tag>;
      }
    },
    {
      title: isRu ? 'Модель' : 'Model',
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
      render: (value: number) => <Tag color="success">{(value * 100).toFixed(1)}%</Tag>
    },
    {
      title: isRu ? 'Бук' : 'Book',
      dataIndex: 'bookmaker',
      key: 'bookmaker'
    },
    {
      title: '',
      key: 'open',
      width: 42,
      render: () => <RightOutlined style={{color: '#71717A'}} />
    }
  ];
}

type ValueBetsTableProps = {
  bets: ValueBet[];
  scrollY?: number | string;
};

export function ValueBetsTable({bets, scrollY}: ValueBetsTableProps) {
  const locale = useLocale();

  return (
    <Table<ValueBet>
      columns={getColumns(locale !== 'en')}
      dataSource={bets}
      pagination={false}
      rowKey="id"
      scroll={{x: true, y: scrollY}}
      size="middle"
    />
  );
}
