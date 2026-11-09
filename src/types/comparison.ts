export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';
export type ChangeSeverity = 'Critical' | 'Important' | 'Minor';
export type EntityType = 'numerical' | 'date' | 'percentage' | 'amount' | 'location' | 'role' | 'clause';
export type SupportedLanguage = 'en' | 'hi' | 'hi-en';

export interface LineDiff {
  id?: string;
  originalNumber?: number;
  updatedNumber?: number;
  type: ChangeType;
  originalText?: string;
  updatedText?: string;
  severity?: ChangeSeverity;
  entityType?: EntityType;
  whyItMatters?: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface ImportantChangeItem {
  id?: string;
  title: string;
  category: string;
  type: 'added' | 'removed' | 'modified';
  severity: ChangeSeverity;
  description: string;
  whyItMatters: string;
  entityType?: EntityType;
  beforeValue?: string;
  afterValue?: string;
  originalSnippet?: string;
  updatedSnippet?: string;
}

export interface MissingInfoItem {
  field: string;
  description: string;
  impact: string;
}

export interface InconsistencyItem {
  issue: string;
  detail: string;
  risk: ChangeSeverity;
}

export interface LocalizedAnalysis {
  executiveSummary: string;
  recommendations: string[];
  importantChanges: {
    title: string;
    description: string;
    whyItMatters: string;
  }[];
}

export interface AIAnalysisResult {
  executiveSummary: string;
  importantChanges: ImportantChangeItem[];
  missingInformation: MissingInfoItem[];
  inconsistencies: InconsistencyItem[];
  recommendations: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  aiEngine: 'bharatcode-qwen-3.8-27b' | 'local-heuristic-engine';
  isFallback: boolean;
  modelUsed: string;
  multilingual?: {
    hi?: LocalizedAnalysis;
    'hi-en'?: LocalizedAnalysis;
  };
}

export interface ComparisonStatistics {
  totalChanges: number;
  criticalChanges: number;
  importantChanges: number;
  minorChanges: number;
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  unchangedLines: number;
  originalWordCount: number;
  updatedWordCount: number;
  wordCountDifference: number;
  similarityScore: number;
}

export interface ComparisonRecord {
  id: string;
  originalDocumentName: string;
  updatedDocumentName: string;
  timestamp: string;
  originalText: string;
  updatedText: string;
  statistics: ComparisonStatistics;
  lineDiffs: LineDiff[];
  aiAnalysis: AIAnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  evidenceSnippets?: string[];
}

export type ActiveTab = 'overview' | 'differences' | 'missing' | 'ai-insights' | 'chat';
export type AppView = 'landing' | 'dashboard' | 'new-comparison' | 'results' | 'history' | 'profile' | 'settings';
