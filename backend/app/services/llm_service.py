from openai import OpenAI
from app.config import settings

class LLMService:
    def __init__(self):
        self.client = OpenAI(
            base_url=settings.LLM_BASE_URL,
            api_key=settings.LLM_API_KEY
        )
        self.model = settings.LLM_MODEL

    def chat(self, messages: list, tools: list = None):
        """
        Sends messages to the LLM and returns the response.
        Supports tool calling.
        """
        params = {
            "model": self.model,
            "messages": messages,
        }
        if tools:
            params["tools"] = tools
            params["tool_choice"] = "auto"

        response = self.client.chat.completions.create(**params)
        return response.choices[0].message

llm_service = LLMService()
