import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { FiMessageSquare } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

import {
  useGetMessagesQuery,
  useSendMessageMutation,
} from "../../services/chatApi";
import {
  selectActiveConversationId,
  selectLocalMessages,
  selectIsTyping,
  addLocalMessage,
} from "../../features/chat/chatSlice";
import { MESSAGE_ROLES } from "../../utils/constants";
import "./Chat.css";
import { Loader } from "../Shared";

const Chat = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const activeConversationId = useSelector(selectActiveConversationId);
  const localMessages = useSelector(selectLocalMessages);
  const isTyping = useSelector(selectIsTyping);

  // Fetch messages for active conversation
  const {
    data: messagesData,
    isLoading: messagesLoading,
    isFetching: messagesFetching,
  } = useGetMessagesQuery(
    { conversationId: activeConversationId },
    { skip: !activeConversationId }
  );

  // Send message mutation
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  // Get messages from API or local state
  const apiMessages = messagesData?.data?.messages || [];
  const allMessages = [...apiMessages, ...localMessages];

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isTyping]);

  // Handle send message
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add optimistic user message
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      role: MESSAGE_ROLES.USER,
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    dispatch(addLocalMessage(optimisticMessage));

    try {
      await sendMessage({
        message: messageText,
        conversationId: activeConversationId || null,
      }).unwrap();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(
        error.data?.message || "Failed to send message. Please try again."
      );
    }
  };

  // Empty state - No conversation selected
  if (!activeConversationId && localMessages.length === 0) {
    return (
      <div className="chat">
        <div className="chat-empty">
          <div className="chat-empty-content">
            <div className="empty-icon">
              <RiRobot2Line />
            </div>
            <h2>Welcome to AI Chatbot</h2>
            <p>Powered by Perplexity</p>
            <div className="empty-suggestions">
              <span>Try asking:</span>
              <button
                onClick={() =>
                  handleSendMessage("Explain quantum computing in simple terms")
                }
              >
                "Explain quantum computing in simple terms"
              </button>
              <button
                onClick={() =>
                  handleSendMessage("Write a short poem about technology")
                }
              >
                "Write a short poem about technology"
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    "What are some tips for learning programming?"
                  )
                }
              >
                "What are some tips for learning programming?"
              </button>
            </div>
          </div>
        </div>
        <ChatInput onSend={handleSendMessage} disabled={sending} />
      </div>
    );
  }

  return (
    <div className="chat">
      {/* Messages Area */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {messagesLoading ? (
          <div className="chat-loading">
            <Loader size="medium" text="Loading messages..." />
          </div>
        ) : (
          <>
            {allMessages.length === 0 ? (
              <div className="chat-no-messages">
                <FiMessageSquare size={30} />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              allMessages.map((msg, index) => (
                <ChatMessage key={msg._id || `msg-${index}`} message={msg} />
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-message assistant typing">
                <div className="message-avatar">
                  <RiRobot2Line />
                </div>
                <div className="message-body">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={sending || messagesLoading}
      />
    </div>
  );
};

export default Chat;
