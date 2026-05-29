'use client';

import {flexRender, getCoreRowModel, useReactTable, type ColumnDef} from '@tanstack/react-table';
import {ChevronRight} from 'lucide-react';
import {useLocale} from 'next-intl';
import type {ValueBet} from '@/types/analytics';

function getColumns(isRu: boolean): ColumnDef<ValueBet>[] {
  return [
    {
      accessorKey: 'match',
      header: isRu ? '\u041c\u0430\u0442\u0447' : 'Match',
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
      header: isRu ? '\u041f\u0438\u043a' : 'Pick',
      cell: ({row}) => {
        const selectionMap = {
          Home: isRu ? '\u041f1' : 'Home',
          Draw: 'X',
          Away: isRu ? '\u041f2' : 'Away'
        };

        return <span className="value-table__pick">{selectionMap[row.original.selection]}</span>;
      }
    },
    {
      accessorKey: 'modelProbability',
      header: isRu ? '\u041c\u043e\u0434\u0435\u043b\u044c' : 'Model',
      cell: ({row}) => `${(row.original.modelProbability * 100).toFixed(1)}%`
    },
    {
      accessorKey: 'bookmakerOdds',
      header: 'Odds',
      cell: ({row}) => row.original.bookmakerOdds.toFixed(2)
    },
    {
      accessorKey: 'fairOdds',
      header: 'Fair',
      cell: ({row}) => row.original.fairOdds.toFixed(2)
    },
    {
      accessorKey: 'ev',
      header: 'EV',
      cell: ({row}) => <span className="value-table__positive">{(row.original.ev * 100).toFixed(1)}%</span>
    },
    {
      accessorKey: 'bookmaker',
      header: isRu ? '\u0411\u0443\u043a' : 'Book',
      cell: ({row}) => row.original.bookmaker
    },
    {
      id: 'open',
      header: '',
      cell: () => <ChevronRight className="value-table__chevron" size={16} aria-hidden="true" />
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
    <div className="table-scroll">
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
