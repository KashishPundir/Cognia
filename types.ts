
export interface ColumnStats {
  min?: number;
  max?: number;
  mean?: number;
  uniqueCount?: number;
  nullCount: number;
  mostFrequent?: string | number;
}

export interface DatasetContext {
  columnNames: string[];
  dataTypes: Record<string, string>;
  sampleRows: any[];
  rowCount: number;
  summaryStats: Record<string, ColumnStats>;
}

export interface KeyFactor {
  factor: string;
  value: string;
}

export interface AnalysisResponse {
  directAnswer: string;
  detailedExplanation: string;
  pythonCode: string;
  attributesUsed: string[];
  keyFactors?: KeyFactor[];
  limitations?: string[];
  furtherAnalysis?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'analyst';
  content?: string;
  directAnswer?: string;
  detailedExplanation?: string;
  pythonCode?: string;
  attributesUsed?: string[];
  keyFactors?: KeyFactor[];
  limitations?: string[];
  furtherAnalysis?: string[];
  timestamp: Date;
}

export interface LayoutConfig {
  sidebarWidth: number;
  headerHeight: number;
}

export interface AppState {
  dataset: any[] | null;
  metadata: DatasetContext | null;
  visibleRows: number;
  notes: string;
  messages: ChatMessage[];
  isAnalyzing: boolean;
  activeTab: 'insights' | 'code';
  layout: LayoutConfig;
}
