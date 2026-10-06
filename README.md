# 🌾 Shetkari Mitra (शेतकरी मित्र) — Farmer's Friend Chatbot

A multilingual AI-powered agricultural advisory chatbot that gives farmers expert
farming advice in their own language — crops, soil, pests, fertilizers, and best
practices, powered by Google's Gemini AI.

## What it does

- **Chat with an AI agronomist**: ask farming questions in your native language and get practical answers
- **Multilingual**: built for farmers who don't work in English — advice in the language they actually speak
- **Covers the real questions**: crop selection, soil health, pest control, fertilizer use, seasonal best practices
- **Chat history**: conversations are stored (MongoDB) so advice can be revisited

## Tech stack

- **Backend**: Python + FastAPI (async), MongoDB via Motor, Gemini AI via the `emergentintegrations` LLM interface
- **Frontend**: React + Tailwind CSS + Radix UI components
- **AI**: Google Gemini (2.5 Flash) for responses

## Project structure

```
├── backend/
│   ├── server.py          # FastAPI app, CORS, MongoDB client setup
│   ├── chat_routes.py     # Chat API routes
│   ├── gemini_service.py  # Gemini LLM integration
│   ├── models.py          # Data models
│   └── requirements.txt
└── frontend/
    └── src/               # React app (components, hooks, pages)
```

## How to run

**Backend** (needs Python 3.10+):

```bash
cd backend
pip install -r requirements.txt
# create a .env file with your MongoDB connection string and Gemini API key
uvicorn server:app --reload
```

**Frontend** (needs Node.js):

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`, talking to the API on `http://localhost:8000`.

## Interview notes

**What this is:** a full-stack AI chatbot that brings expert farming advice to farmers in their own language — a chat UI backed by FastAPI + MongoDB, with Gemini generating the answers.

**Why these choices:**
- **Chatbot over a search/info site:** farmers ask specific, situational questions ("yellow spots on my cotton leaves") — a conversational interface handles that far better than static articles, and removes the English-literacy barrier.
- **FastAPI (async):** chat means many concurrent, I/O-bound requests (waiting on the LLM + DB) — async Python handles that efficiently on modest hardware.
- **MongoDB:** chat history is semi-structured and evolves; a document store fits better than rigid tables at this stage.
- **Gemini via a single LLM interface (`emergentintegrations`):** keeps the model swappable — if a better/cheaper model appears, only the service layer changes, not the routes.
- **React + Radix UI:** accessible, component-driven chat UI without reinventing primitives.

**Trade-offs I'd mention honestly:**
- Every answer costs an API call and needs internet — unusable in low-connectivity fields without an offline fallback.
- Advice quality in regional languages is bounded by the model's training; a wrong farming recommendation has real-world cost, so answers should carry a "verify with your local extension officer" disclaimer.
- No voice input yet — typing is a barrier for many farmers; speech-to-text would matter more than any UI polish.

**How I'd extend it:** voice input/output in regional languages, photo-based crop disease detection (multimodal), a WhatsApp/SMS interface (farmers already live there), and an offline FAQ cache for common questions.
