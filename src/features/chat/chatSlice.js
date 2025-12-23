import { createSlice } from "@reduxjs/toolkit";
import { chatApi } from "../../services/chatApi";

const initialState = {
  activeConversationId: null,
  localMessages: [], // For optimistic updates
  isTyping: false,
  isSidebarOpen: true,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
      state.localMessages = [];
    },
    addLocalMessage: (state, action) => {
      state.localMessages.push(action.payload);
    },
    clearLocalMessages: (state) => {
      state.localMessages = [];
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    clearChat: (state) => {
      state.activeConversationId = null;
      state.localMessages = [];
      state.isTyping = false;
    },
  },
  extraReducers: (builder) => {
    // When send message starts, set typing
    builder.addMatcher(chatApi.endpoints.sendMessage.matchPending, (state) => {
      state.isTyping = true;
    });

    // When send message completes, clear typing and update conversation
    builder.addMatcher(
      chatApi.endpoints.sendMessage.matchFulfilled,
      (state, { payload }) => {
        state.isTyping = false;
        state.localMessages = [];
        // Set active conversation if it's a new one
        if (payload.data?.conversation && !state.activeConversationId) {
          state.activeConversationId = payload.data.conversation;
        }
      }
    );

    // Handle send message error
    builder.addMatcher(chatApi.endpoints.sendMessage.matchRejected, (state) => {
      state.isTyping = false;
    });
  },
});

export const {
  setActiveConversation,
  addLocalMessage,
  clearLocalMessages,
  setTyping,
  toggleSidebar,
  setSidebarOpen,
  clearChat,
} = chatSlice.actions;

// Selectors
export const selectActiveConversationId = (state) =>
  state.chat.activeConversationId;
export const selectLocalMessages = (state) => state.chat.localMessages;
export const selectIsTyping = (state) => state.chat.isTyping;
export const selectIsSidebarOpen = (state) => state.chat.isSidebarOpen;

export default chatSlice.reducer;
