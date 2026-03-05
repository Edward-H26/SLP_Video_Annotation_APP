import openai
from config import settings


class OpenAIConfig:
    @staticmethod
    def get_client():
        if settings.OPENAI_API_BASE_URL:
            return openai.OpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_API_BASE_URL
            )
        return openai.OpenAI(api_key=settings.OPENAI_API_KEY)


openaiConfig = OpenAIConfig()
