import { api } from "./api";

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations
    getConversations: builder.query({
      query: ({ page = 1, limit = 20 } = {}) =>
        `/conversations?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data?.conversations
          ? [
              ...result.data.conversations.map(({ _id }) => ({
                type: "Conversation",
                id: _id,
              })),
              { type: "Conversation", id: "LIST" },
            ]
          : [{ type: "Conversation", id: "LIST" }],
      // Keep data fresh
      keepUnusedDataFor: 60,
    }),

    // Get single conversation with messages
    getConversation: builder.query({
      query: (conversationId) => `/conversations/${conversationId}`,
      providesTags: (result, error, id) => [
        { type: "Conversation", id },
        { type: "Message", id },
      ],
    }),

    // Get messages of a conversation
    getMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 50 }) =>
        `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      providesTags: (result, error, { conversationId }) => [
        { type: "Message", id: conversationId },
      ],
    }),

    // Create new conversation
    createConversation: builder.mutation({
      query: (data) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),

    // Update conversation title
    updateConversation: builder.mutation({
      query: ({ conversationId, ...data }) => ({
        url: `/conversations/${conversationId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Conversation", id: conversationId },
        { type: "Conversation", id: "LIST" },
      ],
    }),

    // Delete conversation
    deleteConversation: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),

    // Clear conversation messages
    clearConversationMessages: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: "Message", id: conversationId },
      ],
    }),

    // Send message and get AI response
    sendMessage: builder.mutation({
      query: (data) => ({
        url: "/chat/send",
        method: "POST",
        body: data,
      }),
      // Invalidate to refresh messages and conversation list
      invalidatesTags: (result) => [
        { type: "Conversation", id: "LIST" },
        { type: "Message", id: result?.data?.conversation },
        { type: "Conversation", id: result?.data?.conversation },
      ],
    }),

    // Quick chat (without saving)
    quickChat: builder.mutation({
      query: (data) => ({
        url: "/chat/quick",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
  useClearConversationMessagesMutation,
  useSendMessageMutation,
  useQuickChatMutation,
} = chatApi;
