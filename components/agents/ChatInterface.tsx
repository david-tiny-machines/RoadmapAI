import React, { useState, useRef, useEffect } from 'react';

// Define the structure for a message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Define the props for the ChatInterface component
interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (messageContent: string) => void; // Will be implemented in v0.0.5c
  isLoading?: boolean; // To show loading state (v0.0.5c)
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Scroll to the bottom of the messages list when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Handle sending a message (Placeholder for v0.0.5b)
  const handleSend = () => {
    if (inputValue.trim()) {
      console.log("Placeholder: Send message:", inputValue); // Placeholder action
      // In v0.0.5c, this will call props.onSendMessage(inputValue);
      setInputValue(''); // Clear input after pseudo-send
    }
  };

  // Handle Enter key press in input field
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white shadow-soft rounded-lg border border-gray-200">
      {/* Message display area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
            >
              {/* Basic whitespace handling for display */}
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {/* Loading indicator (Placeholder) */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg shadow bg-gray-200 text-gray-500 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        {/* Empty div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading} // Disable input when loading
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()} // Disable button when loading or input is empty
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 