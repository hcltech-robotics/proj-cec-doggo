import { SceneManager } from "./visualizer/SceneManager"

export type GuiCallback = (n: number) => void

export type SceneTransformParam = {
    timestamp: bigint, subscriptionId: number, data: {
        channelTopic: string, messageData: any, channelSchemaName: string,
    }
}
export type SceneTransformCb = ({ timestamp }: SceneTransformParam, s:SceneManager) => void