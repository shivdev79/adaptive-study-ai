import json
import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

def parse_json_safely(text: str, fallback_default: Any = None) -> Any:
    """
    Safely parses JSON output from LLM models (e.g. Groq, OpenAI),
    handling markdown code fences (```json ... ```), surrounding text,
    and trailing content.
    """
    if not text or not text.strip():
        return fallback_default if fallback_default is not None else {}

    cleaned = text.strip()

    # 1. Strip markdown code block fences
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    # 2. Try direct json.loads
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 3. Extract JSON object {...} or JSON array [...]
    start_brace = cleaned.find("{")
    start_bracket = cleaned.find("[")

    if start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket):
        end_brace = cleaned.rfind("}")
        if end_brace != -1:
            try:
                return json.loads(cleaned[start_brace:end_brace + 1])
            except Exception as e:
                logger.warning(f"Extracted object JSON parsing failed: {e}")
    elif start_bracket != -1:
        end_bracket = cleaned.rfind("]")
        if end_bracket != -1:
            try:
                return json.loads(cleaned[start_bracket:end_bracket + 1])
            except Exception as e:
                logger.warning(f"Extracted array JSON parsing failed: {e}")

    logger.error(f"Failed to parse JSON safely from text. Snippet: {text[:200]}")
    return fallback_default if fallback_default is not None else {}
