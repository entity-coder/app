import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  const [sessionId] = useState(() => localStorage.getItem('chat_session_id') || uuidv4());
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Save session ID to localStorage
  useEffect(() => {
    localStorage.setItem('chat_session_id', sessionId);
  }, [sessionId]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      // Auto-detect language - will use browser's default or we can set specific ones
      recognitionRef.current.lang = 'hi-IN'; // Default to Hindi, but will adapt

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API}/chat/history/${sessionId}`);
      if (response.data.messages && response.data.messages.length > 0) {
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.id,
          type: msg.type,
          text: msg.text,
          sources: msg.sources,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to detect language and set appropriate voice
      // For Marathi, Hindi, English detection
      if (/[\u0900-\u097F]/.test(text)) {
        utterance.lang = 'hi-IN'; // Hindi voice for Devanagari script
      } else {
        utterance.lang = 'en-IN';
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
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
    const currentMessage = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat/send`, {
        message: currentMessage,
        session_id: sessionId,
      });

      const botMessage = {
        id: response.data.id,
        type: 'bot',
        text: response.data.message,
        sources: response.data.sources || [],
        timestamp: new Date(response.data.timestamp),
      };

      setMessages((prev) => [...prev, botMessage]);
      
      // Auto-speak bot response if enabled
      if (autoSpeak) {
        speakText(response.data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'क्षमस्व, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा. | Sorry, something went wrong. Please try again.',
        sources: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🌾 शेतकरी मित्र
            </h1>
            <p className="text-sm text-green-100 mt-1">तुमचा विश्वासू शेती सल्लागार | Your Trusted Farm Advisor</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`text-white hover:bg-green-600 ${autoSpeak ? 'bg-green-600' : ''}`}
              title={autoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
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
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed flex-1">{message.text}</p>
                  {message.type === 'bot' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => isSpeaking ? stopSpeaking() : speakText(message.text)}
                      className="h-6 w-6 p-0 hover:bg-green-50"
                    >
                      {isSpeaking ? <VolumeX className="h-3 w-3 text-green-600" /> : <Volume2 className="h-3 w-3 text-green-600" />}
                    </Button>
                  )}
                </div>
                
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
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              className={`h-10 w-10 rounded-full border-green-300 transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 animate-pulse' 
                  : 'text-green-700 hover:bg-green-50 hover:text-green-800'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="तुमचा प्रश्न विचारा... (Ask your question in any language)"
                className="w-full pr-4 py-6 rounded-2xl border-green-300 focus:border-green-500 focus:ring-green-500 text-sm md:text-base"
                disabled={isLoading || isRecording}
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
            {isRecording ? '🎤 Listening... Speak now' : 'शेतकरी मित्र can help with crops, soil, pests, fertilizers & farming practices'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;