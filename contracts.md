# Shetkari Mitra - Implementation Contracts

## API Contracts

### 1. POST /api/chat/send
**Purpose**: Send user message and get AI response with Google Search grounding

**Request Body**:
```json
{
  "message": "string (user's question in any language)",
  "session_id": "string (unique chat session identifier)"
}
```

**Response**:
```json
{
  "id": "string",
  "message": "string (AI response in same language)",
  "sources": [
    {
      "title": "string",
      "url": "string"
    }
  ],
  "timestamp": "datetime",
  "audio_url": "string (optional - for text-to-speech)"
}
```

### 2. GET /api/chat/history/{session_id}
**Purpose**: Retrieve chat history for a session

**Response**:
```json
{
  "session_id": "string",
  "messages": [
    {
      "id": "string",
      "type": "user | bot",
      "text": "string",
      "sources": [],
      "timestamp": "datetime"
    }
  ]
}
```

### 3. POST /api/voice/transcribe
**Purpose**: Convert speech to text (if using backend transcription)

**Request**: FormData with audio file

**Response**:
```json
{
  "text": "string (transcribed text)",
  "language": "string (detected language code)"
}
```

## Frontend-Backend Integration

### Mock Data to Replace
From `/app/frontend/src/mock/chatMock.js`:
- Remove all mock responses
- Replace with actual API calls to `/api/chat/send`
- Add session management using localStorage or state

### New Features to Add

#### Voice Chat Implementation:
1. **Speech-to-Text (Frontend - Web Speech API)**:
   - Use browser's native SpeechRecognition API
   - Support multiple languages
   - Convert voice to text, then send to chat API

2. **Text-to-Speech (Frontend - Web Speech API)**:
   - Use browser's native SpeechSynthesis API
   - Play bot responses as audio
   - Support multilingual voices

## Backend Implementation Plan

### 1. Install Dependencies
```bash
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
```

### 2. Environment Variables
Add to `/app/backend/.env`:
```
EMERGENT_LLM_KEY=sk-emergent-8529d16AbF402EcC6F
```

### 3. MongoDB Collections

**Collection: chat_sessions**
```json
{
  "_id": "ObjectId",
  "session_id": "string (UUID)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Collection: chat_messages**
```json
{
  "_id": "ObjectId",
  "session_id": "string",
  "message_id": "string (UUID)",
  "type": "user | bot",
  "text": "string",
  "sources": [{"title": "string", "url": "string"}],
  "timestamp": "datetime"
}
```

### 4. Gemini Integration

**Model**: gemini-2.5-flash
**Provider**: gemini via emergentintegrations

**System Instruction**:
```
You are 'Shetkari Mitra' (Farmer's Friend), an expert, helpful, and highly practical agricultural advisor. 

CRITICAL RULES:
1. LANGUAGE MATCHING: You MUST detect the language of the farmer's input and reply ENTIRELY in that SAME language. If they write in Marathi, respond in Marathi. If Hindi, respond in Hindi. If English, respond in English. Support ALL languages.

2. EXPERTISE SCOPE: Provide advice ONLY on:
   - Crop management and cultivation
   - Soil health and fertility
   - Fertilizer application and nutrients
   - Pest and disease identification and control
   - Irrigation techniques
   - Local farming best practices
   - Seasonal agricultural advice

3. GROUNDING: Your knowledge must be grounded in the context provided by Google Search. Always cite your sources.

4. RESPONSE STYLE: Keep answers:
   - Concise and practical
   - Easy to understand for farmers
   - Action-oriented with clear steps
   - Include specific recommendations with quantities/timings when relevant

5. CITATIONS: Always provide source links when available from search results.
```

### 5. Google Search Grounding
- Research if emergentintegrations supports Google Search grounding
- If not supported, use direct Gemini API with grounding tools
- Fallback: Use without grounding but mention in responses

## Language Support

### Supported Languages (via Web Speech API & Gemini):
- Marathi (mr-IN)
- Hindi (hi-IN)
- English (en-IN, en-US)
- Punjabi (pa-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)
- Bengali (bn-IN)
- Gujarati (gu-IN)
- Odia (or-IN)
- And 100+ more languages supported by Gemini

## Voice Features Implementation

### Frontend Changes:
1. Add microphone button to input bar
2. Implement speech recognition with language detection
3. Add speaker button for bot messages
4. Visual feedback during recording/speaking
5. Language selector (optional - can auto-detect)

### User Flow:
1. User clicks mic → starts recording
2. Speech converted to text → displayed in input
3. User sends message → bot responds
4. Optional: Auto-play bot response as speech
5. User can toggle text-to-speech on/off

## Integration Steps

### Phase 1: Backend Core
1. Install emergentintegrations
2. Add EMERGENT_LLM_KEY to .env
3. Create chat endpoints with Gemini integration
4. Implement MongoDB session and message storage
5. Test Gemini responses with system instruction

### Phase 2: Frontend Integration
1. Replace mock data with API calls
2. Implement session management
3. Add error handling for API failures
4. Update UI for loading states

### Phase 3: Voice Features
1. Add speech-to-text using Web Speech API
2. Add text-to-speech for bot responses
3. Update UI with voice controls
4. Test multilingual voice support

### Phase 4: Google Search Grounding
1. Research grounding implementation options
2. Integrate with Gemini API if needed
3. Parse and display source citations
4. Handle cases where grounding unavailable

## Testing Checklist

- [ ] Chat API sends/receives messages correctly
- [ ] Gemini responds in same language as input
- [ ] Session persistence works
- [ ] Chat history retrieval works
- [ ] Sources/citations display correctly
- [ ] Speech-to-text works in multiple languages
- [ ] Text-to-speech works in multiple languages
- [ ] Error handling for API failures
- [ ] Mobile responsiveness maintained
- [ ] Voice controls work on mobile browsers
