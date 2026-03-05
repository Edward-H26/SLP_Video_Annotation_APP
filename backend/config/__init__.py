import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv(dotenv_path=".env", override=True)


class DatabaseSettings:
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")


class CommonSettings(BaseSettings):
    APP_NAME: str = "Video Annotation Platform"
    DEBUG_MODE: bool = True
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "data")


class ServerSettings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8321


class Settings(CommonSettings, ServerSettings):
    pass


settings = Settings()
