import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "Voice Booking System"
    
    # LLM Settings
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://openrouter.ai/api/v1")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "arcee-ai/trinity-large-preview:free")
    
    # Model Paths - These should be set in .env
    WHISPER_MODEL_PATH: str = os.getenv("WHISPER_MODEL_PATH", "./models/whisper-small")
    TTS_GGUF_PATH: str = os.getenv("TTS_GGUF_PATH")
    TTS_MMS_PATH: str = os.getenv("TTS_MMS_PATH")
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://admin:admin@localhost:5432/booking_system")
    
    # Hardware Settings
    DEVICE: str = os.getenv("DEVICE", "cuda")
    COMPUTE_TYPE: str = os.getenv("COMPUTE_TYPE", "float16")
    STT_COMPUTE_TYPE: str = os.getenv("STT_COMPUTE_TYPE", "int8_float16")

settings = Settings()
