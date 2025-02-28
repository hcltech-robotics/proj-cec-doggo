import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Chatbox } from './Chatbox';
import { ErrorNotificationMessage } from './ErrorNotification';

export const ChatWithAi: React.FC<{handleConnection: (param: ErrorNotificationMessage) => void}> = ({handleConnection}) => {
  const { chatAgent, chatHistory } = useContext(AppContext);
  const { addTextMessage } = chatHistory();

  const askLlm = async (query: string) => {
    addTextMessage(query);
    try {
      const response = await chatAgent.invoke(query);
      if (response) {
        addTextMessage(response, 'other');
      }
    } catch (error) {
      handleConnection(error as ErrorNotificationMessage);
    }
  };

  return (
    <>
      <Chatbox sendMessage={askLlm} />
    </>
  );
};
