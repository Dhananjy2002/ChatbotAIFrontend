import React from "react";
import Layout from "../components/Layout/Layout";
import { Chat, ChatSidebar } from "../components/Chat";

const ChatPage = () => {
  return (
    <Layout sidebar={<ChatSidebar />}>
      <Chat />
    </Layout>
  );
};

export default ChatPage;
