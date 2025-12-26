
import React from 'react';
import { Database, PlusCircle, RefreshCw, FileText, Layout as LayoutIcon, BrainCircuit, Download } from 'lucide-react';

interface ControlPanelProps {
  onReplace: () => void;
  onAddData: () => void;
  onReset: () => void;
  onDownload: () => void;
  hasData: boolean;
  showNotes: boolean;
  setShowNotes: (val: boolean) => void;
  showData: boolean;
  setShowData: (val: boolean) => void;
  width: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onReplace,
  onAddData,
  onReset,
  onDownload,
  hasData,
  showNotes,
  setShowNotes,
  showData,
  setShowData,
  width
}) => {
  const items = [
    { id: 'add', label: 'Add data', onClick: onAddData, icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'replace', label: 'Replace data', onClick: onReplace, icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'notes', label: 'Add notes', onClick: () => setShowNotes(!showNotes), icon: <FileText className="w-4 h-4" />, active: showNotes },
    { id: 'data', label: 'Show data', onClick: () => setShowData(!showData), icon: <LayoutIcon className="w-4 h-4" />, active: showData },
    { id: 'download', label: 'Download report', onClick: onDownload, icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div 
      className="h-full bg-white flex flex-col p-8 select-none overflow-hidden shrink-0 border-r border-slate-100"
      style={{ width: `${width}px` }}
    >
      <div className="flex items-center space-x-3 mb-16 shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <span className="text-sm font-black tracking-[0.2em] text-slate-900 uppercase whitespace-nowrap overflow-hidden">Cognia</span>
      </div>

      <nav className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <ul className="space-y-6">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={item.onClick}
                disabled={!hasData && (item.id !== 'replace' && item.id !== 'add')}
                className={`flex items-center w-full group transition-all duration-300 ${
                  item.active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'
                } disabled:opacity-20 disabled:grayscale`}
              >
                <span className={`mr-5 text-xs transition-colors shrink-0 ${item.active ? 'text-indigo-600' : 'text-slate-200 group-hover:text-slate-400'}`}>—</span>
                <span className="text-[13px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden">{item.label}</span>
                {item.active && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0 shadow-sm" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="pt-10 border-t border-slate-50 shrink-0">
        <button 
          onClick={onReset}
          className="text-[10px] font-black text-slate-300 hover:text-red-400 transition-colors uppercase tracking-[0.3em] whitespace-nowrap overflow-hidden"
        >
          Reset Session
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
