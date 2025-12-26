
import React from 'react';
import { ChatMessage } from '../types';
import { Terminal, Database, ShieldCheck, Sparkles, Activity, AlertCircle, TrendingUp } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  viewMode: 'insights' | 'code';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, viewMode }) => {
  const isAnalyst = message.role === 'analyst';

  if (!isAnalyst) {
    return (
      <div className="flex justify-end mb-12 px-4">
        <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] rounded-tr-none text-sm font-semibold shadow-2xl max-w-[80%] border border-slate-800">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
        viewMode === 'insights' 
          ? 'bg-white border-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.06)]' 
          : 'bg-[#0a0f1e] border-slate-800 shadow-2xl'
      }`}>
        {viewMode === 'insights' ? (
          <div className="p-12 space-y-12">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-xl"><Sparkles className="w-4 h-4 text-indigo-600" /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Analytic Insight Directive</span>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-1 bg-indigo-100 self-stretch mr-8 rounded-full" />
                <div className="space-y-6 flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">
                    {message.directAnswer}
                  </h3>
                  <div className="h-px w-24 bg-slate-100" />
                  <p className="text-[16px] font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {message.detailedExplanation}
                  </p>
                </div>
              </div>

              {message.keyFactors && message.keyFactors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                  {message.keyFactors.map((kf, i) => (
                    <div key={i} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                      <div className="flex items-center space-x-3 mb-2">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{kf.factor}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{kf.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-50">
                {message.limitations && message.limitations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contextual Constraints</span>
                    </div>
                    <ul className="space-y-3">
                      {message.limitations.map((lim, i) => (
                        <li key={i} className="text-[13px] font-semibold text-slate-500 flex items-start">
                          <span className="mr-3 text-amber-200 mt-1">•</span>
                          {lim}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {message.furtherAnalysis && message.furtherAnalysis.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suggested Inquiries</span>
                    </div>
                    <ul className="space-y-3">
                      {message.furtherAnalysis.map((fa, i) => (
                        <li key={i} className="text-[13px] font-semibold text-slate-500 flex items-start">
                          <span className="mr-3 text-emerald-200 mt-1">•</span>
                          {fa}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-emerald-500">
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Repository Mapping</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.attributesUsed?.map((attr) => (
                  <span key={attr} className="px-4 py-1.5 bg-emerald-500/10 rounded-xl text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
                    {attr}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-slate-400">
                  <Terminal className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Computational Pipeline</span>
                </div>
                <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-600 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Verified Deterministic Analysis</span>
                </div>
              </div>
              <div className="bg-[#050810] rounded-[2rem] p-8 border border-slate-800/50 shadow-inner">
                <pre className="mono text-[14px] text-indigo-300/90 leading-relaxed overflow-x-auto selection:bg-indigo-500/30">
                  <code>{message.pythonCode}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={`mt-6 flex items-center justify-between px-10 transition-opacity duration-300 ${viewMode === 'insights' ? 'opacity-40' : 'opacity-20'}`}>
        <div className="flex items-center space-x-4">
          <span className={`text-[9px] font-black uppercase tracking-widest ${viewMode === 'insights' ? 'text-slate-900' : 'text-white'}`}>Intelligence Node 09-Preview</span>
          <div className={`w-1.5 h-1.5 rounded-full ${viewMode === 'insights' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
          <span className={`text-[9px] font-black uppercase tracking-widest ${viewMode === 'insights' ? 'text-slate-900' : 'text-white'}`}>ID: {message.id.slice(-8)}</span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${viewMode === 'insights' ? 'text-slate-900' : 'text-white'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
