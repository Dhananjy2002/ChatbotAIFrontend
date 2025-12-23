import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiMessageSquare,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useUpdateConversationMutation,
} from "../../services/chatApi";
import {
  setActiveConversation,
  selectActiveConversationId,
  clearChat,
  setSidebarOpen,
} from "../../features/chat/chatSlice";
import { formatDate, truncateText } from "../../utils/helpers";
import { Loader } from "../Shared/index";

const ChatSidebar = () => {
  const dispatch = useDispatch();
  const activeConversationId = useSelector(selectActiveConversationId);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // RTK Query hooks
  const { data, isLoading, isError } = useGetConversationsQuery({});
  const [createConversation, { isLoading: isCreating }] =
    useCreateConversationMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const [updateConversation] = useUpdateConversationMutation();

  const conversations = data?.data?.conversations || [];

  // Handle new chat
  const handleNewChat = async () => {
    dispatch(setActiveConversation(null));
    dispatch(clearChat());

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  // Handle select conversation
  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      await deleteConversation(conversationId).unwrap();

      if (activeConversationId === conversationId) {
        dispatch(clearChat());
      }

      toast.success("Conversation deleted");
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete conversation");
    }
  };

  // Handle edit start
  const handleEditStart = (e, conversation) => {
    e.stopPropagation();
    setEditingId(conversation._id);
    setEditTitle(conversation.title);
  };

  // Handle edit save
  const handleEditSave = async (e, conversationId) => {
    e.stopPropagation();

    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await updateConversation({
        conversationId,
        title: editTitle.trim(),
      }).unwrap();

      setEditingId(null);
      toast.success("Title updated");
    } catch (error) {
      toast.error(error.data?.message || "Failed to update title");
    }
  };

  // Handle edit cancel
  const handleEditCancel = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle("");
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = formatDate(conv.lastMessageAt || conv.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conv);
    return groups;
  }, {});

  return (
    <div className="chat-sidebar">
      {/* New Chat Button */}
      <div className="sidebar-header">
        <button
          className="new-chat-btn"
          onClick={handleNewChat}
          disabled={isCreating}
        >
          <FiPlus />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="sidebar-conversations">
        {isLoading ? (
          <div className="sidebar-loading">
            <Loader size="small" text="Loading..." />
          </div>
        ) : isError ? (
          <div className="sidebar-error">Failed to load conversations</div>
        ) : conversations.length === 0 ? (
          <div className="sidebar-empty">
            <FiMessageSquare size={40} />
            <p>No conversations yet</p>
            <span>Start a new chat to begin</span>
          </div>
        ) : (
          Object.entries(groupedConversations).map(([date, convs]) => (
            <div key={date} className="conversation-group">
              <div className="conversation-date">{date}</div>
              {convs.map((conv) => (
                <div
                  key={conv._id}
                  className={`conversation-item ${
                    activeConversationId === conv._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectConversation(conv._id)}
                >
                  {editingId === conv._id ? (
                    <div className="conversation-edit">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(e, conv._id);
                          if (e.key === "Escape") handleEditCancel(e);
                        }}
                        autoFocus
                      />
                      <button
                        className="edit-action save"
                        onClick={(e) => handleEditSave(e, conv._id)}
                      >
                        <FiCheck />
                      </button>
                      <button
                        className="edit-action cancel"
                        onClick={handleEditCancel}
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiMessageSquare className="conversation-icon" />
                      <span className="conversation-title">
                        {truncateText(conv.title, 30)}
                      </span>
                      <div className="conversation-actions">
                        <button
                          className="action-btn edit"
                          onClick={(e) => handleEditStart(e, conv)}
                          aria-label="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={(e) => handleDeleteConversation(e, conv._id)}
                          aria-label="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
