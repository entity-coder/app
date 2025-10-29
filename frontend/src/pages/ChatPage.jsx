import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { mockResponses } from '../mock/chatMock';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      text: 'नमस्कार! मी शेतकरी मित्र आहे. मी तुम्हाला शेतीविषयक सल्ला देण्यासाठी येथे आहे. तुम्ही मराठी, हिंदी किंवा इंग्रजीमध्ये विचारू शकता.',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMockResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for language and keywords
    if (lowerMessage.includes('टोमॅटो') || lowerMessage.includes('टमाटर')) {
      return mockResponses.marathi.tomato;
    } else if (lowerMessage.includes('गेहूं') || lowerMessage.includes('wheat')) {
      return mockResponses.hindi.wheat;
    } else if (lowerMessage.includes('pest') || lowerMessage.includes('कीट')) {
      return mockResponses.english.pest;
    } else if (lowerMessage.includes('खत') || lowerMessage.includes('fertilizer')) {
      return mockResponses.marathi.fertilizer;
    }
    
    // Default responses based on detected language
    if (/[\u0900-\u097F]/.test(userMessage) && /[टोमॅटो|पीक|शेती|माती]/.test(userMessage)) {
      return mockResponses.marathi.general;
    } else if (/[\u0900-\u097F]/.test(userMessage)) {
      return mockResponses.hindi.general;
    } else {
      return mockResponses.english.general;
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const mockResponse = getMockResponse(inputText);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: mockResponse.text,
        sources: mockResponse.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🌾 शेतकरी मित्र
          </h1>
          <p className="text-sm text-green-100 mt-1">तुमचा विश्वासू शेती सल्लागार | Your Trusted Farm Advisor</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
                  message.type === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-green-100'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.text}</p>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-100 space-y-1">
                    <p className="text-xs font-semibold text-green-700 mb-2">📚 Sources:</p>
                    {message.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-green-600 hover:text-green-800 hover:underline transition-colors"
                      >
                        {idx + 1}. {source.title}
                      </a>
                    ))}
                  </div>
                )}
                
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-green-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-green-100">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-sm">शेतकरी मित्र विचार करत आहे...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-green-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all"
              title="Attach image (Coming soon for disease detection)"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="तुमचा प्रश्न विचारा... (Ask your question in Marathi, Hindi, or English)"
                className="w-full pr-4 py-6 rounded-2xl border-green-300 focus:border-green-500 focus:ring-green-500 text-sm md:text-base"
                disabled={isLoading}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            शेतकरी मित्र can help with crops, soil, pests, fertilizers & farming practices
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;