import os
from typing import List, Dict
from dotenv import load_dotenv
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)
load_dotenv()

# Configure Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# System instruction for Shetkari Mitra
SYSTEM_INSTRUCTION = """You are 'Shetkari Mitra' (Farmer's Friend), an expert, helpful, and highly practical agricultural advisor.

CRITICAL RULES:
1. LANGUAGE MATCHING: You MUST detect the language of the farmer's input and reply ENTIRELY in that SAME language. If they write in Marathi, respond in Marathi. If Hindi, respond in Hindi. If English, respond in English. Support ALL languages including regional Indian languages.

2. EXPERTISE SCOPE: Provide advice ONLY on:
   - Crop management and cultivation techniques
   - Soil health, fertility, and conservation
   - Fertilizer application, nutrients, and organic farming
   - Pest and disease identification and integrated pest management
   - Irrigation techniques and water management
   - Local farming best practices and seasonal advice
   - Agricultural machinery and tools
   - Post-harvest management and storage

3. RESPONSE STYLE: Keep answers:
   - Concise, practical, and farmer-friendly
   - Easy to understand for farmers with varying education levels
   - Action-oriented with clear, numbered steps when appropriate
   - Include specific recommendations with quantities, timings, and measurements
   - Use local terminology and units familiar to Indian farmers

4. GROUNDING: Use your knowledge to give accurate, up-to-date information. Always base your answers on verified agricultural knowledge.

5. SAFETY: If asked about non-agricultural topics, politely redirect the conversation to farming-related queries.
"""


class GeminiService:
    def __init__(self):
        # Initialize with Emergent LLM key using emergentintegrations
        self.api_key = EMERGENT_LLM_KEY
        self.model = "gemini-2.5-flash"
        self.provider = "gemini"
        
    async def generate_response(self, user_message: str, session_id: str) -> Dict[str, any]:
        """Generate AI response using Gemini via emergentintegrations"""
        try:
            # Create LLM chat instance
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=SYSTEM_INSTRUCTION
            ).with_model(self.provider, self.model)
            
            # Create user message
            message = UserMessage(text=user_message)
            
            # Generate response
            response = await chat.send_message(message)
            
            logger.info(f"Generated response for session {session_id}")
            
            # Note: emergentintegrations doesn't support Google Search grounding directly
            # The response is based on model's training data
            return {
                'text': response,
                'sources': []  # No sources available with current library
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            # Fallback response in case of error
            return {
                'text': "मला माफ करा, मला तुमच्या प्रश्नाचे उत्तर देण्यात अडचण येत आहे. कृपया पुन्हा प्रयत्न करा. | Sorry, I'm having trouble answering your question. Please try again.",
                'sources': []
            }


# Singleton instance
gemini_service = GeminiService()
