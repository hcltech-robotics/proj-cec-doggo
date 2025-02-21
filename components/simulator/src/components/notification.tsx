import React, { ReactNode, useState } from 'react';

import './notifiaction.css';

interface NotificationProps {
  align?: string;
  content?: ReactNode;
  error?: string;
  message?: string;
  isClosable?: boolean;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, content, isClosable = false, error, align = 'middle', onClose }) => {
  return (
    <div className={`notification-wrapper ${align}`}>
      {message && <p>{message}</p>}
      {content}
      {error && <Accordion title='Details' content={error} />}
      {isClosable && <button onClick={onClose}>X</button>}
    </div>
  );
};

export default Notification;

interface AccordionProps { title: string; content: string }

const Accordion = ({ title, content }: AccordionProps) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="accordion-item">
      <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
        <span>{title}</span>
        <span>{isActive ? '-' : '+'}</span>
      </div>
      {isActive && <div className="accordion-content">{content}</div>}
    </div>
  );
};
