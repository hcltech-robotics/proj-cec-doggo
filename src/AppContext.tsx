import { createContext } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { ChatHistoryActions, ChatHistoryState } from './service/ChatHistoryService';
import { LlmCommunicationService } from './service/LlmCommunicationService';
import { RobotCommunicationService } from './service/RobotCommunicationService';

export interface AppContextDefinition {
  chatHistory: UseBoundStore<StoreApi<ChatHistoryState & ChatHistoryActions>>;
  connection: RobotCommunicationService;
  chatAgent: LlmCommunicationService;
  visualAgent: LlmCommunicationService;
}

export const AppContext = createContext<AppContextDefinition>({} as AppContextDefinition);
