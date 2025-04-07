import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import ChatInterface, { ChatMessage } from '../../components/agents/ChatInterface';

const PrdGeneratorPage = () => {
  // State for messages - empty for v0.0.5b
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // State for loading status - false for v0.0.5b
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder send message handler for v0.0.5b
  const handleSendMessage = (messageContent: string) => {
    console.log('PRD Generator Page: handleSendMessage called with:', messageContent);
    // Actual API call and state update will be implemented in v0.0.5c
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        PRD Generator Agent
      </h1>
      <ChatInterface
        messages={messages} // Pass empty messages array
        onSendMessage={handleSendMessage} // Pass placeholder handler
        isLoading={isLoading} // Pass initial loading state
      />
    </MainLayout>
  );
};

export default PrdGeneratorPage; 