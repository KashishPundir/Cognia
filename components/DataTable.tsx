
import React from 'react';

interface DataTableProps {
  data: any[];
  columns: string[];
  visibleRows: number;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, visibleRows }) => {
  const displayData = data.slice(0, visibleRows);

  if (!data || data.length === 0) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-100 border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              {columns.map((col) => (
                <th 
                  key={col} 
                  className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100 whitespace-nowrap bg-slate-50"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {displayData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                {columns.map((col) => (
                  <td key={`${i}-${col}`} className="px-6 py-4 text-[11px] font-bold text-slate-600 whitespace-nowrap group-hover:text-indigo-600 transition-colors">
                    {row[col]?.toString() ?? <span className="text-slate-200 italic font-medium">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > visibleRows && (
        <div className="bg-slate-50/50 p-2 text-center border-t border-slate-100 shrink-0">
          <span className="text-[8px] text-slate-400 uppercase font-black tracking-[0.3em]">
            + { (data.length - visibleRows).toLocaleString() } Additional Contextual Records Indexed
          </span>
        </div>
      )}
    </div>
  );
};

export default DataTable;
