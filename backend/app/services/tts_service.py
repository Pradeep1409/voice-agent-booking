import os
import uuid
import torch
import scipy.io.wavfile
import numpy as np
from transformers import VitsModel, AutoTokenizer
from app.config import settings

class TTSService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TTSService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized: return
        self.model = None
        self.tokenizer = None
        self.device = settings.DEVICE
        self.sampling_rate = 16000
        self._initialized = True

    def toggle_device(self, device_name: str):
        self.device = device_name
        if self.model:
            self.model = self.model.to(device_name)

    def _lazy_load(self):
        if self.model is None:
            print(f"-> [TTS] Initialized loading on {self.device} (float16: {self.device == 'cuda'})")
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(settings.TTS_MMS_PATH)
                self.model = VitsModel.from_pretrained(settings.TTS_MMS_PATH)
                
                if self.device == "cuda":
                    self.model = self.model.to(self.device).half() # Speedup!
                else:
                    self.model = self.model.to(self.device)
                
                self.sampling_rate = getattr(self.model.config, "sampling_rate", 16000)
                print(f"-> [TTS] Success: Ready on {self.device}")
            except Exception as e:
                print(f"-> [TTS] Failed to load on {self.device}: {e}. Falling back to CPU.")
                self.device = "cpu"
                self.tokenizer = AutoTokenizer.from_pretrained(settings.TTS_MMS_PATH)
                self.model = VitsModel.from_pretrained(settings.TTS_MMS_PATH).to("cpu")
                self.sampling_rate = 16000

    def generate(self, text: str) -> str:
        self._lazy_load()
        
        # MMS Hin (Hindi) model often fails or generates empty audio for pure English text.
        # We ensure there is at least some Hindi context or transliterate basic English phrases.
        processed_text = text
        if all(ord(char) < 128 for char in text):
             # Basic mapping for the initial greeting and common phrases if they are in pure English
             if "Hello" in text:
                 processed_text = text.replace("Hello", "नमस्ते")
             if "AutoBook" in text:
                 processed_text = processed_text.replace("AutoBook", "ऑटोबुक")
        
        output_dir = "temp_tts"
        os.makedirs(output_dir, exist_ok=True)
        filename = f"out_{uuid.uuid4().hex[:8]}.wav"
        output_path = os.path.join(output_dir, filename)

        try:
            return self._process(processed_text, output_path)
        except Exception as e:
            if "cuda" in str(e).lower() or "cudnn" in str(e).lower():
                print(f"-> [TTS] Runtime GPU error: {e}. Switching to CPU...")
                self.toggle_device("cpu")
                return self._process(processed_text, output_path)
            print(f"-> [TTS] Fatal Error: {e}")
            raise e

    def _process(self, text: str, output_path: str) -> str:
        if not text or len(text.strip()) == 0:
            raise ValueError("Empty text provided to TTS")

        # 1. Tokenization
        inputs = self.tokenizer(text, return_tensors="pt")
        
        # 2. Careful Type Casting & Device Placement
        processed_inputs = {}
        for key, val in inputs.items():
            if key in ["input_ids", "attention_mask", "speaker_id"]:
                processed_inputs[key] = val.to(self.device).long()
            else:
                # If on GPU, use FP16 for the hidden states/inputs
                processed_inputs[key] = val.to(self.device).half() if self.device == "cuda" else val.to(self.device)

        # 3. Model Inference
        import time
        start_time = time.time()
        with torch.no_grad():
            try:
                outputs = self.model(**processed_inputs)
                waveform = outputs.waveform
                duration = time.time() - start_time
                print(f"-> [TTS] Inference took {duration:.2f}s")
            except Exception as e:
                print(f"-> [TTS] Inference failed: {e}")
                raise e

        # 4. Post-processing
        waveform = waveform.cpu().numpy().squeeze()
        
        if waveform.size == 0:
            raise ValueError("Model generated empty waveform")

        # 5. Audio Quality: Normalization and Limiting
        # Move to float32 first for precision in math
        waveform = waveform.astype(np.float32)
        
        # Apply peak normalization to 0.95 to avoid any clipping
        max_amplitude = np.max(np.abs(waveform))
        if max_amplitude > 0:
            waveform = waveform / max_amplitude
            waveform = waveform * 0.95
        
        # 6. Conversion to standard PCM 16-bit
        # Using clip to be extra safe before conversion
        waveform_int16 = np.clip(waveform * 32767, -32768, 32767).astype(np.int16)
        
        # 7. Write to WAV
        scipy.io.wavfile.write(output_path, self.sampling_rate, waveform_int16)
        
        return output_path

tts_service = TTSService()


