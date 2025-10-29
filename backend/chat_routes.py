from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from models import ChatRequest, ChatResponse, ChatMessage, ChatSource, ChatHistoryResponse
from gemini_service import gemini_service
import os
import logging
from datetime import datetime
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to Shetkari Mitra and get AI response with Google Search grounding
    """
    try:
        # Store user message
        user_message = ChatMessage(
            session_id=request.session_id,
            type="user",
            text=request.message,
            sources=[]
        )
        await db.chat_messages.insert_one(user_message.dict())
        logger.info(f"Stored user message for session {request.session_id}")
        
        # Generate AI response using Gemini with emergentintegrations
        ai_response = await gemini_service.generate_response(request.message, request.session_id)
        
        # Convert sources dict to ChatSource objects
        sources = [ChatSource(**source) for source in ai_response['sources']]
        
        # Store bot message
        bot_message = ChatMessage(
            session_id=request.session_id,
            type="bot",
            text=ai_response['text'],
            sources=sources
        )
        await db.chat_messages.insert_one(bot_message.dict())
        logger.info(f"Stored bot message for session {request.session_id}")
        
        # Return response
        return ChatResponse(
            id=bot_message.id,
            message=ai_response['text'],
            sources=sources,
            timestamp=bot_message.timestamp
        )
        
    except Exception as e:
        logger.error(f"Error in send_message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(session_id: str):
    """
    Retrieve chat history for a session
    """
    try:
        messages = await db.chat_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        chat_messages = [ChatMessage(**msg) for msg in messages]
        
        return ChatHistoryResponse(
            session_id=session_id,
            messages=chat_messages
        )
        
    except Exception as e:
        logger.error(f"Error in get_chat_history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
