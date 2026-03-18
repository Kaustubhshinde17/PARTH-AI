from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session
from database import get_session
from auth import get_current_user
from models import User, ChatSession, Memory
from ai.llm import brain
from ai.reasoning import evaluate_truthfulness
import json

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    query: str
    session_id: int | None = None

@router.post("/")
async def chat(request: ChatRequest, db: Session = Depends(get_session)):
    """
    Standard synchronous chat endpoint (made public for UI testing).
    """
    # 1. Memory / RAG Retrieval (Simulated)
    context = []
    
    # 2. Generation Engine
    raw_response = await brain.generate_response(request.query, context)
    
    # 3. Truth System Validation
    is_factual, confidence, final_response = evaluate_truthfulness(request.query, raw_response)
    
    return {
        "response": final_response,
        "confidence": confidence,
        "is_factual": is_factual
    }

class SuggestRequest(BaseModel):
    query: str

@router.post("/suggest")
async def suggest_completion(request: SuggestRequest):
    """
    Predictive autocomplete based on partial text from the user.
    """
    if len(request.query) < 2:
        return {"suggestion": ""}
    
    system_prompt = "You are a ghostwriter predictive algorithm. Complete the user's thought. Respond ONLY with exactly 2 to 6 words that logically complete their sentence without repeating what they already typed. No punctuation marks or quotes."
    
    try:
        completion = await brain.client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.query}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=20,
        )
        prediction = completion.choices[0].message.content.strip().replace('"', '').replace('.','')
        return {"suggestion": prediction}
    except Exception:
        return {"suggestion": ""}

@router.post("/stream")
async def chat_stream(request: ChatRequest, user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """
    Streaming endpoint using SSE or raw streaming payload for the 4D UI.
    """
    async def event_generator():
        # Yield metadata first (confidence scoring)
        yield json.dumps({"type": "meta", "confidence": 0.95}) + "\n"
        
        async for chunk in brain.generate_stream(request.query):
            yield json.dumps({"type": "chunk", "content": chunk}) + "\n"
            
    return StreamingResponse(event_generator(), media_type="application/x-ndjson")
