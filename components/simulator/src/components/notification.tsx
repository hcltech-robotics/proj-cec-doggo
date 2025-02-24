import React, { ReactNode, useState } from 'react';

import './notification.css';

interface NotificationProps {
  align?: string;
  content?: ReactNode;
  error: NotificationError | null;
  message?: string;
  isClosable?: boolean;
  onClose?: () => void;
}

export interface NotificationError {
  message: string;
  type: string;
  param: unknown;
  code: string;
}

const Notification: React.FC<NotificationProps> = ({ message, content, isClosable = false, error, align = 'middle', onClose }) => {
  return (
    <div className={`notification-wrapper ${align}`}>
      <div className="error-icon-wrapper">
        <svg className="error-icon" aria-hidden="true">
          <use xlinkHref="#error-icon" fill="white"></use>
        </svg>
      </div>
      {message && <p>{message}</p>}
      {content}
      {error && <Accordion title="Details" content={error} />}
      {isClosable && <button onClick={onClose}>X</button>}
    </div>
  );
};

export default Notification;

interface AccordionProps {
  title: string;
  content: NotificationError;
}

const Accordion = ({ title, content }: AccordionProps) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="accordion-item">
      <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
        <span>{title}</span>
        <span className="detail-icon">{isActive ? '⬆️' : '⬇️'}</span>
      </div>
      <div className={`accordion-content ${isActive ? 'detailed' : ''}`}>
        <ul>
          <li>Reason: {content.code}</li>
          <li>Message: {content.message}</li>
        </ul>
      </div>
    </div>
  );
};
