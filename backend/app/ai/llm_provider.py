import json
import re
import logging
import requests
from typing import Dict, Any, List, Optional
from app.core.config import settings

import time

logger = logging.getLogger(__name__)

class LLMProvider:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.groq_api_key = settings.GROQ_API_KEY
        self.groq_model = settings.GROQ_MODEL

    def generate_completion(self, system_prompt: str, user_prompt: str, json_mode: bool = False, custom_api_key: Optional[str] = None) -> str:
        groq_key = custom_api_key or settings.GROQ_API_KEY or self.groq_api_key or (self.api_key if self.api_key and self.api_key.startswith("gsk_") else None)

        # Truncate overly large user prompts to ~9,000 characters (~2,200 tokens) to guarantee fit in 8,000 TPM limit
        safe_user_prompt = user_prompt if len(user_prompt) <= 9000 else user_prompt[:9000] + "\n...[Content truncated for context window]..."

        # 1. Try Groq API if Groq key is present
        if groq_key:
            target_models = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "groq/compound"]
            if settings.GROQ_MODEL and settings.GROQ_MODEL not in target_models and "llama" not in settings.GROQ_MODEL:
                target_models.insert(0, settings.GROQ_MODEL)

            for model_name in target_models:
                try:
                    headers = {
                        "Authorization": f"Bearer {groq_key}",
                        "Content-Type": "application/json"
                    }
                    body = {
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": safe_user_prompt}
                        ],
                        "temperature": 0.3
                    }
                    if json_mode:
                        body["response_format"] = {"type": "json_object"}

                    response = requests.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers=headers,
                        json=body,
                        timeout=30
                    )
                    if response.status_code == 200:
                        res_json = response.json()
                        content = res_json["choices"][0]["message"]["content"]
                        if content:
                            return content
                    elif response.status_code in (413, 429):
                        logger.warning(f"Groq API {response.status_code} limit on '{model_name}'. Retrying with shorter prompt after 1.5s...")
                        time.sleep(1.5)
                        # Try with even shorter prompt on rate limit
                        body["messages"][1]["content"] = user_prompt[:5000] + "\n...[Truncated]..."
                        retry_resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body, timeout=30)
                        if retry_resp.status_code == 200:
                            content = retry_resp.json()["choices"][0]["message"]["content"]
                            if content:
                                return content
                    else:
                        logger.warning(f"Groq API Error for model '{model_name}' ({response.status_code}): {response.text}")
                except Exception as e:
                    logger.error(f"Failed to call Groq API model '{model_name}': {e}")

        # 2. Try OpenAI API if OpenAI key is present
        if self.provider == "openai" and self.api_key and not self.api_key.startswith("gsk_") and self.api_key != "your_openai_api_key_here":
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                body = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.3
                }
                if json_mode:
                    body["response_format"] = {"type": "json_object"}

                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=body,
                    timeout=30
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"OpenAI API Error ({response.status_code}): {response.text}")
            except Exception as e:
                logger.error(f"Failed to call OpenAI API: {e}")

        # 3. If no LLM provider succeeded, return empty structured response or explicit notice
        if json_mode:
            return json.dumps({
                "error": "Groq API key required or generation failed",
                "modules": [],
                "questions": [],
                "pyq_analysis": {}
            })
        return "Groq API Key required to generate content. Please configure your Groq API Key in Settings."

llm = LLMProvider()
