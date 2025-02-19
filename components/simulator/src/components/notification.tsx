// Notification.tsx
import React, { ReactNode } from 'react';

interface NotificationProps {
  content: ReactNode;
  isClosable: boolean;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ content, isClosable, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#333',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '5px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
      }}
    >
      <div>
        {content}
        {isClosable && (
          <button
            onClick={onClose}
            style={{ marginLeft: '10px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            X
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;
