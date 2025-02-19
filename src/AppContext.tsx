import { createContext } from 'react';
import { useChatHistoryStore } from './service/ChatHistoryService';

export const AppContext = createContext({
  chatHistory: useChatHistoryStore,
});
