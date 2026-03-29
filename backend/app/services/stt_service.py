import os
from faster_whisper import WhisperModel
from app.config import settings

class STTService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(STTService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized: return
        self._model = None
        self.device = settings.DEVICE
        self.compute_type = settings.COMPUTE_TYPE # Changed to use global float16
        self._initialized = True

    @property
    def model(self):
        if self._model is None:
            self._load_model()
        return self._model

    def _load_model(self):
        print(f"-> [STT] Loading Whisper on {self.device} ({self.compute_type})...")
        try:
            self._model = WhisperModel(
                settings.WHISPER_MODEL_PATH, 
                device=self.device, 
                compute_type=self.compute_type, 
                local_files_only=True
            )
            print(f"-> [STT] Success: Ready on {self.device}")
        except Exception as e:
            print(f"-> [STT] Failed to load on {self.device}: {e}. Falling back to CPU/int8.")
            self.device = "cpu"
            self.compute_type = "int8"
            self._model = WhisperModel(
                settings.WHISPER_MODEL_PATH, 
                device="cpu", 
                compute_type="int8"
            )

    def transcribe(self, audio_path: str) -> str:
        """Transcribes audio file with auto-recovery for GPU errors."""
        if not os.path.exists(audio_path):
            return ""
        
        try:
            return self._perform_stt(audio_path)
        except Exception as e:
            if "cuda" in str(e).lower() or "cudnn" in str(e).lower():
                print(f"-> [STT] Runtime GPU error: {e}. Switching to CPU...")
                self.device = "cpu"
                self.compute_type = "int8"
                self._model = None # Force reload
                return self._perform_stt(audio_path)
            print(f"-> [STT] Transcribe Error: {e}")
            return ""

    def _perform_stt(self, audio_path: str) -> str:
        segments, info = self.model.transcribe(
            audio_path, 
            beam_size=5,
            task="transcribe"
        )
        text = " ".join([segment.text for segment in segments])
        return text.strip()

stt_service = STTService()


