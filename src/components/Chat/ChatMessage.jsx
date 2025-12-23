import React, { useState } from "react";
import { FiUser, FiCopy, FiCheck } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { formatTime, copyToClipboard } from "../../utils/helpers";
import { MESSAGE_ROLES } from "../../utils/constants";

const ChatMessage = ({ message }) => {
  const { role, content, createdAt } = message;
  const [copied, setCopied] = useState(false);

  const isUser = role === MESSAGE_ROLES.USER;
  const isAssistant = role === MESSAGE_ROLES.ASSISTANT;

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`chat-message ${role}`}>
      <div className="message-avatar">
        {isUser ? <FiUser /> : <RiRobot2Line />}
      </div>

      <div className="message-body">
        <div className="message-header">
          <span className="message-sender">
            {isUser ? "You" : "AI Assistant"}
          </span>
          <span className="message-time">{formatTime(createdAt)}</span>
        </div>

        <div className="message-content">
          {content.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < content.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>

        {isAssistant && (
          <div className="message-actions">
            <button
              className="message-action-btn"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              {copied ? <FiCheck /> : <FiCopy />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
