import numpy as np
import logging
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension

    def get_embedding(self, text: str) -> List[float]:
        # Deterministic feature hashing vector for local embeddings
        words = text.lower().split()
        vec = np.zeros(self.dimension)
        for i, word in enumerate(words):
            idx = abs(hash(word)) % self.dimension
            vec[idx] += 1.0 / (i + 1.0)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        a = np.array(vec_a)
        b = np.array(vec_b)
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot / (norm_a * norm_b))

embedding_service = EmbeddingService()
