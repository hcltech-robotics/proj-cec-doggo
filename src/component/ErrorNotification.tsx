import React, { ReactNode, useState } from 'react';
import { SquareArrowDown, SquareArrowUp, TriangleAlert, X } from 'lucide-react';

import './ErrorNotification.css';

interface ErrorNotificationProps {
  align?: string;
  content?: ReactNode;
  errorDetails: ErrorNotificationMessage | null;
  message?: string;
  isClosable?: boolean;
  buttonProps?: { title: string; onClick: () => void };
  onClose?: () => void;
}

export interface ErrorNotificationMessage {
  message: string;
  type: string;
  param: unknown;
  code: string;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  content,
  isClosable = false,
  errorDetails,
  align = 'middle',
  buttonProps,
  onClose,
}) => {
  return (
    <div className={`error-notification-wrapper ${align}`}>
      <div className="error-icon-wrapper">
        <TriangleAlert size={48} />
      </div>
      {message && <p>{message}</p>}
      {buttonProps && (
        <button className="error-button" onClick={buttonProps.onClick}>
          {buttonProps.title}
        </button>
      )}
      {content}
      {errorDetails && <Accordion title="Details" content={errorDetails} />}
      {isClosable && (
        <button className="close-button" onClick={onClose}>
          <X />
        </button>
      )}
    </div>
  );
};

export default ErrorNotification;

interface AccordionProps {
  title: string;
  content: ErrorNotificationMessage;
}

const Accordion = ({ title, content }: AccordionProps) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="accordion-item">
      <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
        <span>{title}</span>
        <span className="detail-icon">{isActive ? <SquareArrowUp /> : <SquareArrowDown />}</span>
      </div>
      <div className={`accordion-content ${isActive ? 'detailed' : ''}`}>
        <ul className="error-details">
          <li>Reason: {content.code || 'Unknown error'}</li>
          <li>Message: {content.message}</li>
        </ul>
      </div>
    </div>
  );
};
