import openai
from config import settings


class OpenAIConfig:
    @staticmethod
    def get_client():
        return openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


openaiConfig = OpenAIConfig()
