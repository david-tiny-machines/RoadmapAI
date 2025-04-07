import React, { useState, useEffect } from 'react';
// Remove MainLayout import if no longer needed
// import MainLayout from '../../components/layout/MainLayout';
import ChatInterface, { ChatMessage } from '../../components/agents/ChatInterface';

const PrdGeneratorPage = () => {
  // State for messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);

  // Add initial greeting message from assistant on component mount
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I can help you generate a Product Requirements Document (PRD). To start, could you please provide the executive summary for your initiative?'
      }
    ]);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle sending a message
  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return; // Don't send empty messages

    setIsLoading(true);
    const newUserMessage: ChatMessage = { role: 'user', content: messageContent };

    // Optimistic UI update: Add user message immediately
    // Use functional update to ensure we're using the latest state
    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    try {
      const response = await fetch('/api/agents/prd-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send only the NEW user message object to the backend
        body: JSON.stringify({ message: newUserMessage }), 
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('API Error:', response.status, errorData);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorData.message || response.statusText}. Please try again.`,
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } else {
        // Handle successful response
        const data = await response.json();
        if (data.reply) {
          const assistantMessage: ChatMessage = { role: 'assistant', content: data.reply };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        } else {
          console.error('API response missing reply:', data);
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: 'Sorry, I received an unexpected response from the server. Please try again.',
          };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
      }
    } catch (error: any) {
      // Handle network errors or other exceptions
      console.error('Fetch Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I couldn't connect to the server: ${error.message}. Please check your connection and try again.`,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        PRD Generator Agent
      </h1>
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </>
  );
};

export default PrdGeneratorPage; 