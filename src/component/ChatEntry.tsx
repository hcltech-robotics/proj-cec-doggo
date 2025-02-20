import { format } from 'date-fns';
import { ChatHistoryItem } from 'src/model/ChatInterfaces';
import './ChatEntry.css';

export const ChatEntry = ({ item }: { item: ChatHistoryItem }) => {
  return (
    <>
      {item.text ? (
        <div key={item.key} className={`history-message ${item.side}`} title={format(item.added, 'yyyy-MM-dd HH:mm:ss')}>
          {item.text}
        </div>
      ) : (
        ''
      )}
      {item.image ? (
        <div key={item.key} className={`history-image ${item.side}`} title={format(item.added, 'yyyy-MM-dd HH:mm:ss')}>
          <img src={item.image} />
        </div>
      ) : (
        ''
      )}
    </>
  );
};
