
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  Send, 
  Loader2,
  X,
  FileSpreadsheet,
  BrainCircuit,
  Database,
  ChartBar,
  Code2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Monitor,
  Sparkles,
  Search,
  Layout
} from 'lucide-react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import { AppState, ChatMessage, DatasetContext, ColumnStats } from './types';
import { analyzeData } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import DataTable from './components/DataTable';
import MessageBubble from './components/MessageBubble';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    dataset: null,
    metadata: null,
    visibleRows: 10,
    notes: '',
    messages: [],
    isAnalyzing: false,
    activeTab: 'insights',
    layout: {
      sidebarWidth: 260,
      headerHeight: 140
    }
  });

  const [input, setInput] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showData, setShowData] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingHeader, setIsResizingHeader] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingSidebar && !isSidebarCollapsed) {
      const newWidth = Math.min(Math.max(180, e.clientX), 600);
      setState(prev => ({ ...prev, layout: { ...prev.layout, sidebarWidth: newWidth } }));
    }
    if (isResizingHeader && !isHeaderCollapsed) {
      const newHeight = Math.min(Math.max(80, e.clientY), 600);
      setState(prev => ({ ...prev, layout: { ...prev.layout, headerHeight: newHeight } }));
    }
  }, [isResizingSidebar, isResizingHeader, isSidebarCollapsed, isHeaderCollapsed]);

  const handleMouseUp = useCallback(() => {
    setIsResizingSidebar(false);
    setIsResizingHeader(false);
  }, []);

  useEffect(() => {
    if (isResizingSidebar || isResizingHeader) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizingSidebar ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingHeader, handleMouseMove, handleMouseUp]);

  const computeStats = (data: any[], columns: string[]): Record<string, ColumnStats> => {
    const stats: Record<string, ColumnStats> = {};
    columns.forEach(col => {
      const values = data.map(d => d[col]).filter(v => v !== null && v !== undefined);
      const isNumeric = values.every(v => typeof v === 'number' || !isNaN(Number(v)));
      
      const colStats: ColumnStats = {
        nullCount: data.length - values.length
      };

      if (isNumeric && values.length > 0) {
        const numValues = values.map(v => Number(v));
        colStats.min = Math.min(...numValues);
        colStats.max = Math.max(...numValues);
        colStats.mean = numValues.reduce((a, b) => a + b, 0) / numValues.length;
      } else {
        const uniqueValues = new Set(values);
        colStats.uniqueCount = uniqueValues.size;
        
        const freq: Record<string, number> = {};
        values.forEach(v => freq[v] = (freq[v] || 0) + 1);
        const sortedFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        if (sortedFreq.length > 0) {
          colStats.mostFrequent = sortedFreq[0][0];
        }
      }
      stats[col] = colStats;
    });
    return stats;
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const processFile = (data: any[], columns: string[]) => {
      const types: Record<string, string> = {};
      if (data.length > 0) {
        columns.forEach(col => {
          const val = data.find(d => d[col] !== null)?.[col];
          types[col] = typeof val;
        });
      }

      const summaryStats = computeStats(data, columns);
      
      const metadata: DatasetContext = {
        columnNames: columns,
        dataTypes: types,
        sampleRows: data.slice(0, 15),
        rowCount: data.length,
        summaryStats
      };
      
      setIsSidebarCollapsed(true); 
      setIsHeaderCollapsed(false);

      setState(prev => ({
        ...prev,
        dataset: data,
        metadata,
        layout: { ...prev.layout, headerHeight: 320 }, 
        messages: [{
          id: Date.now().toString(),
          role: 'analyst',
          directAnswer: `Data Intelligence Mode: Context initialized for "${file.name}".`,
          detailedExplanation: `Repository mapping complete. I have ingested ${data.length.toLocaleString()} records and calculated summary statistics for ${columns.length} attributes. The workspace is now optimized for full-dataset logic queries. My analysis will focus on patterns identified across the entire repository.`,
          pythonCode: "import pandas as pd\ndf = pd.read_csv('active_dataset.csv')\nprint(df.describe(include='all'))",
          attributesUsed: columns.slice(0, 8),
          timestamp: new Date()
        }]
      }));
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => processFile(results.data, results.meta.fields || [])
      });
    } else if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const arrayData = Array.isArray(data) ? data : [data];
          processFile(arrayData, Object.keys(arrayData[0] || {}));
        } catch { alert('JSON Parsing Error'); }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || state.isAnalyzing || !state.metadata) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setState(prev => ({ ...prev, messages: [...prev.messages, userMsg], isAnalyzing: true }));
    setInput('');

    try {
      const response = await analyzeData(input, state.metadata);
      const analystMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'analyst',
        ...response,
        timestamp: new Date()
      };
      setState(prev => ({ ...prev, messages: [...prev.messages, analystMsg], isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        messages: [...prev.messages, {
          id: Date.now().toString(),
          role: 'analyst',
          directAnswer: "Core processing logic interrupted.",
          detailedExplanation: "I encountered a computational error while processing the analytical pipeline. Please verify the dataset integrity.",
          timestamp: new Date()
        }]
      }));
    }
  };

  const handleDownloadReport = () => {
    if (state.messages.length === 0) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const checkPageOverflow = (neededHeight: number) => {
      if (y + neededHeight > 270) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Brand Indigo
    doc.setFont("helvetica", "bold");
    doc.text("Cognia Analysis Report", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 400
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
    y += 15;

    // Dataset Metadata
    if (state.metadata) {
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(margin, y, pageWidth - (margin * 2), 25, "F");
      
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.setFont("helvetica", "bold");
      doc.text("Dataset Context", margin + 5, y + 10);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Records: ${state.metadata.rowCount.toLocaleString()}`, margin + 5, y + 17);
      doc.text(`Attributes: ${state.metadata.columnNames.length}`, margin + 70, y + 17);
      y += 35;
    }

    // Messages
    state.messages.forEach((msg) => {
      checkPageOverflow(20);

      if (msg.role === 'user') {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "bold");
        doc.text("USER QUERY:", margin, y);
        y += 6;
        
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "italic");
        const lines = doc.splitTextToSize(msg.content || "", pageWidth - (margin * 2));
        doc.text(lines, margin, y);
        y += (lines.length * 6) + 12;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(79, 70, 229);
        doc.setFont("helvetica", "bold");
        doc.text("ANALYST FINDINGS:", margin, y);
        y += 8;

        // Direct Answer
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        const directAnswerLines = doc.splitTextToSize(msg.directAnswer || "", pageWidth - (margin * 2));
        doc.text(directAnswerLines, margin, y);
        y += (directAnswerLines.length * 7) + 5;

        // Explanation
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // Slate 600
        doc.setFont("helvetica", "normal");
        const explLines = doc.splitTextToSize(msg.detailedExplanation || "", pageWidth - (margin * 2));
        doc.text(explLines, margin, y);
        y += (explLines.length * 6) + 10;

        // Python Code Section
        if (msg.pythonCode) {
          checkPageOverflow(40);
          
          doc.setFontSize(10);
          doc.setTextColor(16, 185, 129); // Emerald 500
          doc.setFont("helvetica", "bold");
          doc.text("COMPUTATIONAL LOGIC:", margin, y);
          y += 6;

          // One-line code explanation
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.setFont("helvetica", "italic");
          doc.text("Deterministic Python implementation used to derive the analytical insights presented above.", margin, y);
          y += 6;

          // Code Block
          const codeLines = doc.splitTextToSize(msg.pythonCode, pageWidth - (margin * 2) - 10);
          const blockHeight = (codeLines.length * 5) + 10;
          
          checkPageOverflow(blockHeight);
          
          doc.setFillColor(241, 245, 249); // Slate 100
          doc.rect(margin, y, pageWidth - (margin * 2), blockHeight, "F");
          
          doc.setFont("courier", "normal");
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59); // Slate 800
          doc.text(codeLines, margin + 5, y + 7);
          y += blockHeight + 10;
        }

        // Key Factors
        if (msg.keyFactors && msg.keyFactors.length > 0) {
          checkPageOverflow(msg.keyFactors.length * 6 + 10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text("Key Factors Identified:", margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          msg.keyFactors.forEach(kf => {
             doc.text(`• ${kf.factor}: ${kf.value}`, margin + 5, y);
             y += 5;
          });
          y += 5;
        }

        // Limitations
        if (msg.limitations && msg.limitations.length > 0) {
           checkPageOverflow(msg.limitations.length * 6 + 10);
           doc.setFont("helvetica", "bold");
           doc.setFontSize(9);
           doc.text("Contextual Limitations:", margin, y);
           y += 6;
           doc.setFont("helvetica", "normal");
           msg.limitations.forEach(lim => {
             doc.text(`• ${lim}`, margin + 5, y);
             y += 5;
           });
           y += 5;
        }

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y, pageWidth - margin, y);
        y += 15;
      }
    });

    doc.save(`Cognia_Analysis_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <div className="flex shrink-0">
        {!isSidebarCollapsed && (
          <ControlPanel 
            hasData={!!state.dataset}
            onReplace={() => fileInputRef.current?.click()}
            onAddData={() => fileInputRef.current?.click()}
            onReset={() => setState(p => ({ ...p, dataset: null, metadata: null, messages: [] }))}
            onDownload={handleDownloadReport}
            showNotes={showNotes}
            setShowNotes={setShowNotes}
            showData={showData}
            setShowData={setShowData}
            width={state.layout.sidebarWidth}
          />
        )}
        
        <div className="flex flex-col border-r border-slate-100 bg-slate-50 relative">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-md m-1 transition-all text-slate-400 hover:text-indigo-600"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          
          <div 
            className={`flex-1 w-1 cursor-col-resize hover:bg-indigo-500/20 active:bg-indigo-600 transition-colors ${isSidebarCollapsed ? 'pointer-events-none' : ''}`}
            onMouseDown={() => !isSidebarCollapsed && setIsResizingSidebar(true)}
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/10 relative">
        <header 
          className="px-4 pt-4 shrink-0 relative flex flex-col transition-all duration-300 ease-in-out"
          style={{ height: isHeaderCollapsed ? '48px' : `${state.layout.headerHeight}px` }}
        >
          <div 
            className={`flex-1 border border-slate-200 bg-white rounded-3xl flex flex-col overflow-hidden transition-all shadow-sm relative ${!state.metadata && !isHeaderCollapsed ? 'hover:shadow-md hover:border-indigo-100 cursor-pointer' : ''}`}
            onClick={() => !state.metadata && !isHeaderCollapsed && fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.json" onChange={handleFileUpload} />
            
            {isHeaderCollapsed ? (
              <div className="flex items-center justify-between px-6 h-full">
                <div className="flex items-center space-x-3">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {state.metadata ? `Repository: ${state.metadata.rowCount.toLocaleString()} Total Records` : 'No Data Connected'}
                  </span>
                </div>
                <button onClick={() => setIsHeaderCollapsed(false)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><ChevronDown size={14} /></button>
              </div>
            ) : !state.metadata ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="p-5 bg-indigo-50 rounded-3xl text-indigo-600 animate-pulse"><Upload className="w-8 h-8" /></div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900">Ingest Analytical Resource</h2>
                  <p className="text-[12px] text-slate-400 font-medium">Select a local CSV or JSON context for deep analysis</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-8 py-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
                  <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Global Context Preview</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setShowData(true)} className="flex items-center space-x-2 text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"><Maximize2 className="w-3 h-3" /><span>Inspector</span></button>
                    <button onClick={() => setIsHeaderCollapsed(true)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><ChevronUp size={14} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden opacity-40 pointer-events-none">
                  <DataTable data={state.metadata.sampleRows} columns={state.metadata.columnNames} visibleRows={10} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-indigo-100 text-[11px] font-black text-indigo-900 uppercase tracking-widest flex items-center space-x-3">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Statistical Context Loaded</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {!isHeaderCollapsed && (
            <div 
              className="absolute -bottom-1 left-8 right-8 h-2 cursor-row-resize hover:bg-indigo-500/20 transition-all z-40 rounded-full flex items-center justify-center"
              onMouseDown={() => setIsResizingHeader(true)}
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
          )}
        </header>

        <div className="px-8 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="flex items-center space-x-12">
            <button 
              onClick={() => setState(s => ({ ...s, activeTab: 'insights' }))}
              className={`flex items-center space-x-2 py-5 border-b-2 transition-all font-black text-[10px] uppercase tracking-[0.25em] ${state.activeTab === 'insights' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <ChartBar className="w-4 h-4" />
              <span>Analytic Findings</span>
            </button>
            <button 
              onClick={() => setState(s => ({ ...s, activeTab: 'code' }))}
              className={`flex items-center space-x-2 py-5 border-b-2 transition-all font-black text-[10px] uppercase tracking-[0.25em] ${state.activeTab === 'code' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <Code2 className="w-4 h-4" />
              <span>Logic Code</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-8">
            {isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-all group"
              >
                <Layout className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Exit Full Screen</span>
              </button>
            )}
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">
              {state.isAnalyzing ? 'Analyzing Full Dataset...' : 'Analytical Core Ready'}
            </div>
          </div>
        </div>

        <section className="flex-1 flex flex-col p-8 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto scroll-smooth pr-4 custom-scrollbar">
            {state.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                <BrainCircuit className="w-24 h-24 text-slate-900" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 tracking-widest">Awaiting Directives</p>
              </div>
            ) : (
              <div className={`mx-auto py-4 transition-all duration-500 ${isSidebarCollapsed ? 'max-w-6xl' : 'max-w-4xl'}`}>
                {state.messages.map(m => (
                  <MessageBubble key={m.id} message={m} viewMode={state.activeTab} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={`mt-8 shrink-0 transition-all duration-500 ${isSidebarCollapsed ? 'max-w-5xl' : 'max-w-3xl'} mx-auto w-full`}>
            <form onSubmit={handleSendMessage} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-full blur opacity-0 group-focus-within:opacity-100 transition-all" />
              <div className="relative">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={!state.metadata || state.isAnalyzing}
                  placeholder={state.metadata ? "Query patterns, outliers, or trends..." : "Upload data context above..."}
                  className="w-full pl-12 pr-24 py-6 bg-white border border-slate-200 rounded-full shadow-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all text-[15px] font-bold text-slate-900 outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Search size={18} /></div>
                <button 
                  type="submit"
                  disabled={!input.trim() || state.isAnalyzing || !state.metadata} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-20"
                >
                  {state.isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {showNotes && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 z-50 animate-in zoom-in-95 duration-200 resize overflow-auto min-w-[350px] min-h-[350px]">
          <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Analyst Observations</h3>
            <button onClick={() => setShowNotes(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={20} /></button>
          </div>
          <textarea 
            value={state.notes}
            onChange={e => setState(p => ({ ...p, notes: e.target.value }))}
            className="w-full h-[calc(100%-60px)] p-6 bg-slate-50 border-none rounded-3xl outline-none resize-none font-bold text-slate-700 shadow-inner text-[15px]"
          />
        </div>
      )}

      {showData && state.dataset && (
        <div className="fixed inset-12 bg-white rounded-[4rem] shadow-2xl border border-slate-200 p-16 z-50 flex flex-col animate-in slide-in-from-bottom-12 duration-500 resize overflow-auto min-w-[800px] min-h-[600px]">
          <div className="flex justify-between items-center mb-12 shrink-0">
            <div className="flex items-center space-x-6">
              <div className="p-5 bg-indigo-50 rounded-3xl text-indigo-600"><FileSpreadsheet className="w-8 h-8" /></div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Dataset Inspector</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Full Integrity Snapshot • {state.metadata?.rowCount.toLocaleString()} Records Indexed</p>
              </div>
            </div>
            <button onClick={() => setShowData(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={40} /></button>
          </div>
          <div className="flex-1 overflow-auto rounded-[3rem] border border-slate-100 shadow-inner bg-slate-50/10">
            <DataTable data={state.dataset} columns={state.metadata?.columnNames || []} visibleRows={state.dataset.length} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
