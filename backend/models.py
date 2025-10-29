from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class ChatSource(BaseModel):
    title: str
    url: str


class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    type: str  # 'user' or 'bot'
    text: str
    sources: List[ChatSource] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    message: str
    session_id: str


class ChatResponse(BaseModel):
    id: str
    message: str
    sources: List[ChatSource] = []
    timestamp: datetime


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessage]
