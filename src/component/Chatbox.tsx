import { differenceInSeconds, format } from 'date-fns';
import { History, Mic, Send } from 'lucide-react';
import { FormEventHandler, KeyboardEventHandler, useContext, useEffect, useRef, useState } from 'react';
import { ChatHistoryItem } from 'src/model/ChatInterfaces';
import { AppContext } from '../AppContext';
import { useInterval } from '../helper/TimeHooks';
import './Chatbox.css';

export const Chatbox = (props: { sendMessage: (query: string) => void }) => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyStart, setHistoryStart] = useState<number>(-1);
  const { history } = useContext(AppContext).chatHistory();

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
      setInput('');
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
        props.sendMessage(query);
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

  const calcHistory = (lHistory: ChatHistoryItem[]): number => {
    const historyStart = lHistory.findIndex((item) => differenceInSeconds(item.hide, new Date()) > 0);

    return historyStart;
  };

  useInterval(() => {
    setHistoryStart(calcHistory(history));
  }, 1000);

  useEffect(() => {
    setHistoryStart(calcHistory(history));
  }, [history]);

  return (
    <>
      <div className="chatbox">
        {history.length > 0 && showHistory ? (
          <div className="chat-history">
            <div className="history-entries" ref={historyNode}>
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
          <div className="chat-recent">
            <div className="history-entries" ref={historyNode}>
              {historyStart >= 0
                ? history.slice(historyStart).map((item) => {
                    return (
                      <div key={item.key} className={`history-message ${item.side}`} title={format(item.added, 'yyyy-MM-dd HH:mm:ss')}>
                        {item.text}
                      </div>
                    );
                  })
                : ''}
            </div>
          </div>
        )}
        <form className="chat-form" ref={form} onSubmit={submitForm}>
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
