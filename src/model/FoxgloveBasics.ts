import { Channel } from '@foxglove/ws-protocol';

export interface EnrichedChannel<T> extends Channel {
  decoder: (msg: DataView) => T;
  lastMessage: T;
}
