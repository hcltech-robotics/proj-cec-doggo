export interface ChatHistoryItem {
  text?: string;
  image?: string;
  side: 'me' | 'other';
  added: Date;
  hide: Date;
  key: number;
}
