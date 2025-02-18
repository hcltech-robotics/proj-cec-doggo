import { History, Mic, Send } from 'lucide-react';
import { FormEventHandler, KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { LlmCommunicationService } from 'src/service/LlmCommunicationService';
import { RobotCommunication } from 'src/service/RobotCommunicationService';

import { format } from 'date-fns';
import './Chatbox.css';

export const Chatbox = (props: { connection: RobotCommunication; llm: LlmCommunicationService }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ text: string; side: 'me' | 'other '; added: Date; key: number }[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const textarea = useRef<HTMLTextAreaElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const historyNode = useRef<HTMLDivElement>(null);

  const adjustHeight = (node: HTMLTextAreaElement | null) => {
    if (node) {
      node.style.height = '1.2em';
      if (node.scrollHeight > 36) {
        node.style.height = `${node.scrollHeight}px`;
      }
    }
  };

  const inputChange: FormEventHandler<HTMLTextAreaElement> = (event) => {
    setInput((event.target as HTMLTextAreaElement).value);
    adjustHeight(textarea.current);
  };

  const handleKeyPress: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.current?.requestSubmit();
    }
  };

  const submitForm: FormEventHandler<HTMLFormElement> = (e) => {
    if (textarea.current) {
      const query = textarea.current.value;
      if (query) {
        textarea.current.value = '';
        adjustHeight(textarea.current);
        setHistory([...history, { text: query, side: 'me', added: new Date(), key: Math.random() * 1e12 }]);

        // props.llm.invoke(query);
      }
    }
    e.preventDefault();
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  useEffect(() => {
    if (historyNode.current) {
      historyNode.current.scrollTop = historyNode.current.scrollHeight;
    }
  }, [history, showHistory]);

  return (
    <>
      <div className="chatbox">
        {history.length > 0 && showHistory ? (
          <div className="chat-history" ref={historyNode}>
            <div className="history-entries">
              {history.map((item) => {
                return (
                  <div key={item.key} className={`history-message ${item.side}`} title={format(item.added, 'yyyy-MM-dd HH:mm:ss')}>
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          ''
        )}
        <form ref={form} onSubmit={submitForm}>
          <div className="chat-controls">
            <textarea
              id="q"
              className="chat-textarea"
              placeholder="Chat with the robot..."
              onInput={inputChange}
              onKeyDown={handleKeyPress}
              ref={textarea}
            ></textarea>
            <button type="button" className="chat-button">
              <Mic />
            </button>
            <button type="submit" className="chat-button" disabled={input.trim().length === 0}>
              <Send />
            </button>
            <button type="button" className="chat-button" onClick={toggleHistory}>
              <History />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
