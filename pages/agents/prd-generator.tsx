import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout'; // Keep layout import for structure
import ChatInterface, { ChatMessage } from '../../components/agents/ChatInterface';

const PrdGeneratorPage = () => {
  // State for messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);
  // State for the final generated Markdown output
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string | null>(null);
  // State to track if generation is complete to disable input
  const [isComplete, setIsComplete] = useState(false);

  // Add initial greeting message from assistant on component mount
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I can help you generate a Product Requirements Document (PRD). To start, could you please provide the executive summary for your initiative?'
      }
    ]);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle copying markdown to clipboard
  const handleCopyToClipboard = () => {
    if (generatedMarkdown) {
      navigator.clipboard.writeText(generatedMarkdown)
        .then(() => {
          console.log('Markdown copied to clipboard!');
          // Optionally show a success toast/message
        })
        .catch(err => {
          console.error('Failed to copy markdown:', err);
          // Optionally show an error toast/message
        });
    }
  };

  // Handle downloading markdown as a .md file
  const handleDownloadMarkdown = () => {
    if (generatedMarkdown) {
      const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prd_export.md'; // Filename for the download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Markdown download initiated.');
    }
  };

  // Handle sending a message
  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isComplete) return; // Don't send if empty or complete

    setIsLoading(true);
    const newUserMessage: ChatMessage = { role: 'user', content: messageContent };

    // Optimistic UI update
    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    try {
      const response = await fetch('/api/agents/prd-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newUserMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('API Error:', response.status, errorData);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorData.message || response.statusText}. Please try again.`,
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } else {
        const data = await response.json();
        // --- Check for Markdown or Reply --- 
        if (data.markdown) {
          // Generation complete, display Markdown
          setGeneratedMarkdown(data.markdown);
          const finalMessage: ChatMessage = {
            role: 'assistant',
            content: 'I have generated the PRD based on our conversation. You can copy or download the Markdown below.'
          };
          setMessages(prevMessages => [...prevMessages, finalMessage]);
          setIsComplete(true); // Mark as complete to disable further input
        } else if (data.reply) {
          // Normal conversation turn
          const assistantMessage: ChatMessage = { role: 'assistant', content: data.reply };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        } else {
          // Unexpected response
          console.error('API response missing reply or markdown:', data);
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: 'Sorry, I received an unexpected response from the server. Please try again.',
          };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
        // --- End Check --- 
      }
    } catch (error: any) {
      console.error('Fetch Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I couldn't connect to the server: ${error.message}. Please check your connection and try again.`,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Using React Fragment as MainLayout is applied globally in _app.tsx
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        PRD Generator Agent
      </h1>

      {/* Chat Interface */}
      <div className={`${generatedMarkdown ? 'mb-6' : ''}`}> {/* Add margin below chat if markdown is shown */}
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          // Pass combined loading and completion state to disable input
          isLoading={isLoading || isComplete} 
        />
      </div>

      {/* Markdown Export Section (Conditionally Rendered) */}
      {generatedMarkdown && (
        <div className="mt-6 p-6 bg-white shadow-soft rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated PRD (Markdown)</h2>
          <textarea
            readOnly
            value={generatedMarkdown}
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
            aria-label="Generated PRD Markdown"
          />
          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={handleCopyToClipboard}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Download .md File
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PrdGeneratorPage; 