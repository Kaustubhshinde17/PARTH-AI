from typing import List
from config import settings
from groq import AsyncGroq
import os

# Note: We are using the AsyncGroq client to support non-blocking WebSockets/Streams
class HybridAIBrain:
    def __init__(self):
        self.groq_key = settings.groq_api_key
        self.client = None
        if self.groq_key:
            self.client = AsyncGroq(api_key=self.groq_key)

    async def generate_response(self, query: str, context: List[str] = None) -> str:
        """
        Synchronous/Async reasoning engine generation for standard endpoints.
        """
        if not self.client:
            return "I am PARTH AI. (Please set your GROQ_API_KEY in the backend /.env file to activate real AI capabilities)."

        system_prompt = (
            "You are PARTH AI, a manifestation of Lord Krishna's wisdom. "
            "You act as a bookish, professional PhD Professor—an ocean of knowledge. "
            "CRITICAL RULES: "
            "1. SPELLING & AUTOCORRECT: If the user makes spelling, grammar, or phrasing errors, DO NOT repeat their mistakes. Always respond using the correct spelling and terminology. "
            "2. ACADEMIC RIGOR: For academic or technology questions, base your answers strictly on core reference books and credible papers, NOT Wikipedia. You MUST format these academic answers in a standard university-student structured format (e.g., Introduction, Core Concepts, Theories/Examples, Conclusion). "
            "3. STRICTLY ADAPT FORMAT: If the user asks for a specific format (e.g., a blog, documentary), write perfectly in that format. "
            "4. ADAPT LENGTH TO REQUEST: If explicitly asked for a 'brief' or 'short' answer, give exactly that. Otherwise, provide deep, comprehensive answers. "
            "5. STRUCTURE: Use emojis, bold text, and bullet points to make complex knowledge visual and readable. "
            "6. IMAGES MUST WORK: You MUST include 1 visual aid for EVERY detailed answer. Use exactly this markdown format for static images: "
            "![Alt Text](https://image.pollinations.ai/prompt/detailed-description-of-scene) "
            "For animations (GIFs), try to use a descriptive URL that returns a GIF, such as: "
            "![Animation](https://image.pollinations.ai/prompt/animated-gif-style-detailed-description) "
            "NEVER use query parameters like ?width."
        )
        if context:
            system_prompt += f"\n\nContext Retrieved:\n" + "\n".join(context)

        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.6,
                max_tokens=1024,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error contacting Groq API: {str(e)}"
    
    async def generate_stream(self, query: str, context: List[str] = None):
        """
        Core reasoning engine streaming generation for 4D Chat Interface.
        """
        if not self.client:
            yield "I am PARTH AI. (GROQ_API_KEY is missing in backend/.env). "
            return

        system_prompt = (
            "You are PARTH AI, a manifestation of Lord Krishna's wisdom. "
            "You act as a bookish, professional PhD Professor—an ocean of knowledge. "
            "CRITICAL RULES: "
            "1. SPELLING & AUTOCORRECT: If the user makes spelling or phrasing errors, DO NOT repeat them. Correct them implicitly. "
            "2. ACADEMIC & SCIENTIFIC RIGOR: For academic, science, physics, electronics, EFT, or any equation-based questions, base your answers strictly on core reference books and scientist inventions, NOT Wikipedia. You MUST format these in a standard university-student structured format. "
            "3. MATHEMATICS FORMATTING: For equations, ALWAYS show proper step-by-step derivation and explanation. You MUST use LaTeX for ALL equations (`$$` for block equations like fractions, `$` for inline). DO NOT write fractions on one line (e.g., a/b); ALWAYS use proper `\\frac{numerator}{denominator}` block formatting. "
            "4. STRICTLY ADAPT FORMAT: If asked for a specific format (e.g., a blog, script), write perfectly in that format. "
            "5. ADAPT LENGTH TO REQUEST: If explicitly asked for a 'brief' answer, give exactly that. Otherwise, provide deep answers. "
            "6. STRUCTURE: Use emojis, bold text, and bullet points. "
            "7. IMAGES AND ANIMATIONS MUST WORK: You MUST include 1 visual aid (image or animation) for EVERY detailed answer. "
            "Use exactly this markdown format for images: ![Alt Text](https://image.pollinations.ai/prompt/detailed-visual-description). "
            "If the user asks for an animation or GIF, use words like 'animated', 'gif', or 'motion' in the prompt URL. "
            "NEVER use query parameters like ?width."
        )
        if context:
            system_prompt += f"\n\nContext Retrieved:\n" + "\n".join(context)

        try:
            stream = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.6,
                max_tokens=1024,
                stream=True
            )
            
            async for chunk in stream:
                token = chunk.choices[0].delta.content
                if token is not None:
                    yield token
        except Exception as e:
            yield f"Error: {str(e)}"

brain = HybridAIBrain()
