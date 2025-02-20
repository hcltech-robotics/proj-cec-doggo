import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Chatbox } from './Chatbox';

export const ChatWithAi = () => {
  const { chatAgent, chatHistory } = useContext(AppContext);
  const { addTextMessage } = chatHistory();

  const askLlm = async (query: string) => {
    addTextMessage(query);
    const response = await chatAgent.invoke(query);
    addTextMessage(response, 'other');
  };

  return (
    <>
      <Chatbox sendMessage={askLlm} />
    </>
  );
};
