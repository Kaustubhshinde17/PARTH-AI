from pinecone import Pinecone, ServerlessSpec
from config import settings
from typing import List

# Initialize Pinecone
pc = None
if settings.pinecone_api_key:
    pc = Pinecone(api_key=settings.pinecone_api_key)

INDEX_NAME = "parthai-knowledge"

def get_or_create_index():
    if not pc:
        return None
    if INDEX_NAME not in pc.list_indexes().names():
        pc.create_index(
            name=INDEX_NAME, 
            dimension=1536, # Assuming OpenAI embeddings
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region=settings.pinecone_env or 'us-east-1'
            )
        )
    return pc.Index(INDEX_NAME)

class RAGEngine:
    def __init__(self):
        self.index = get_or_create_index()

    def embed_text(self, text: str) -> List[float]:
        """
        Simulated text embedding. 
        In production, call OpenAI/Groq Embeddings API.
        """
        # Return a dummy vector of 1536 zeros for testing
        return [0.0] * 1536

    def retrieve_context(self, query: str, top_k: int = 3) -> List[str]:
        """
        Retrieves context chunks from Pinecone.
        """
        if not self.index:
            return ["Pinecone index is not configured. Real-time RAG context disabled."]
            
        vector = self.embed_text(query)
        try:
            results = self.index.query(vector=vector, top_k=top_k, include_metadata=True)
            return [match['metadata']['text'] for match in results['matches']]
        except Exception as e:
            return [f"Vector db fetch error: {str(e)}"]

rag_engine = RAGEngine()
