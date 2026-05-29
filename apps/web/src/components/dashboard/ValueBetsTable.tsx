'use client';

import {flexRender, getCoreRowModel, useReactTable, type ColumnDef} from '@tanstack/react-table';
import {Tag} from 'antd';
import {useLocale} from 'next-intl';
import type {ValueBet} from '@/types/analytics';

function getColumns(isRu: boolean): ColumnDef<ValueBet>[] {
  return [
    {
      accessorKey: 'match',
      header: isRu ? 'Матч' : 'Match',
      cell: ({row}) => (
        <span className="value-table__match">
          {row.original.homeTeam} - {row.original.awayTeam}
          <span className="value-table__muted">
            {row.original.league} · {row.original.kickoff}
          </span>
        </span>
      )
    },
    {
      accessorKey: 'selection',
      header: isRu ? 'Выбор' : 'Pick',
      cell: ({row}) => {
        const selectionMap = {
          Home: isRu ? 'П1' : 'Home',
          Draw: isRu ? 'X' : 'Draw',
          Away: isRu ? 'П2' : 'Away'
        };

        return <Tag color="cyan">{selectionMap[row.original.selection]}</Tag>;
      }
    },
    {
      accessorKey: 'modelProbability',
      header: isRu ? 'Модель' : 'Model',
      cell: ({row}) => `${(row.original.modelProbability * 100).toFixed(1)}%`
    },
    {
      accessorKey: 'bookmakerOdds',
      header: isRu ? 'Коэф.' : 'Odds',
      cell: ({row}) => row.original.bookmakerOdds.toFixed(2)
    },
    {
      accessorKey: 'fairOdds',
      header: isRu ? 'Справедл.' : 'Fair',
      cell: ({row}) => row.original.fairOdds.toFixed(2)
    },
    {
      accessorKey: 'ev',
      header: 'EV',
      cell: ({row}) => <span className="value-table__positive">{(row.original.ev * 100).toFixed(1)}%</span>
    },
    {
      accessorKey: 'bookmaker',
      header: isRu ? 'Букмекер' : 'Book',
      cell: ({row}) => row.original.bookmaker
    }
  ];
}

type ValueBetsTableProps = {
  bets: ValueBet[];
};

export function ValueBetsTable({bets}: ValueBetsTableProps) {
  const locale = useLocale();
  const columns = getColumns(locale !== 'en');
  const table = useReactTable({
    data: bets,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div style={{overflowX: 'auto'}}>
      <table className="value-table">
        <thead className="value-table__head">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className="value-table__cell" key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="value-table__row" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td className="value-table__cell" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
