export interface ChatHistoryItem {
  text: string;
  side: 'me' | 'other';
  added: Date;
  hide: Date;
  key: number;
}
