
export interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
  date: string;
  category: 'Politics' | 'Economy' | 'Culture' | 'Geography' | 'Schemes' | 'General';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ResearchAnalysis {
  summary: string;
  keyPoints: string[];
  historicalContext: string;
  relevanceToRAS: string;
  sources: GroundingSource[];
  shortQuestions: string[];
  longQuestions: string[];
  significanceScore: number; // 1-100, where <10 is elite/experimental
  oracleInsight?: string; // Mystical prophetic insight for top-tier topics
}

export type TabType = 'dashboard' | 'research' | 'resources' | 'quiz';
