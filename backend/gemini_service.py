import os
from typing import List, Dict
from google import genai
from google.genai import types
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

# Configure Gemini with Emergent LLM Key
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

4. GROUNDING: Use the search results provided to give accurate, up-to-date information. Always base your answers on verified agricultural knowledge.

5. SAFETY: If asked about non-agricultural topics, politely redirect the conversation to farming-related queries.
"""


class GeminiService:
    def __init__(self):
        # Initialize client with API key
        self.client = genai.Client(api_key=EMERGENT_LLM_KEY)
        self.model_name = 'gemini-2.5-flash'
        
        # Configure with Google Search grounding
        self.config = types.GenerateContentConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            max_output_tokens=2048,
            system_instruction=SYSTEM_INSTRUCTION,
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
        
    async def generate_response(self, user_message: str) -> Dict[str, any]:
        """Generate AI response with Google Search grounding"""
        try:
            # Generate content with grounding
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=user_message,
                config=self.config
            )
            
            # Extract text response
            response_text = response.text if hasattr(response, 'text') else ""
            
            # Extract sources from grounding metadata
            sources = []
            if hasattr(response, 'grounding_metadata') and response.grounding_metadata:
                if hasattr(response.grounding_metadata, 'grounding_chunks'):
                    for chunk in response.grounding_metadata.grounding_chunks:
                        if hasattr(chunk, 'web') and chunk.web:
                            sources.append({
                                'title': chunk.web.title if hasattr(chunk.web, 'title') else 'Agricultural Resource',
                                'url': chunk.web.uri if hasattr(chunk.web, 'uri') else '#'
                            })
            
            logger.info(f"Generated response with {len(sources)} sources")
            
            return {
                'text': response_text,
                'sources': sources
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
