import { Channel } from '@foxglove/ws-protocol';

export interface EnrichedChannel extends Channel {
  decoder: (msg: DataView) => {};
  lastMessage: any;
}
