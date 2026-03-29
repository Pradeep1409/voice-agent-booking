import os
import uuid
import aiofiles
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.stt_service import stt_service
from app.services.agent_service import agent_service
from app.services.tts_service import tts_service
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    logger.info("-> [WS] Connection established")
    
    # Session state
    history = []
    
    try:
        # 1. INITIAL GREETING PHASE
        greeting_text = "नमस्ते! मैं आपका ऑटोबुक सहायक हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?"
        history.append({"role": "assistant", "content": greeting_text})
        
        # Immediate text delivery
        await websocket.send_json({
            "user_text": None,
            "agent_reply": greeting_text,
            "is_greeting": True
        })
        
        # Audio delivery (lazy generated)
        try:
            tts_path = tts_service.generate(greeting_text)
            async with aiofiles.open(tts_path, "rb") as f:
                audio_bytes = await f.read()
                await websocket.send_bytes(audio_bytes)
            # if os.path.exists(tts_path):
            #     os.remove(tts_path)
            print(f"-> [WS] Saved greeting to: {tts_path}")
        except Exception as e:
            logger.error(f"-> [WS] Greeting Audio Error: {e}")

        # 2. MAIN INTERACTION LOOP
        while True:
            # Await user voice data
            audio_data = await websocket.receive_bytes()
            
            # Temporary storage with unique ID
            temp_filename = f"voice_in_{uuid.uuid4().hex[:8]}.wav"
            async with aiofiles.open(temp_filename, "wb") as f:
                await f.write(audio_data)
            
            try:
                # STT: Voice -> Text
                user_text = stt_service.transcribe(temp_filename)
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)

                if not user_text or len(user_text.strip()) < 2:
                    continue

                # Agent: Logical Processing
                agent_reply = agent_service.process_message(user_text, history)
                
                if not agent_reply or len(agent_reply.strip()) == 0:
                    logger.warning("-> [WS] Agent returned empty reply. Skipping TTS.")
                    continue

                # Update history (keep it lean)
                history.append({"role": "user", "content": user_text})
                history.append({"role": "assistant", "content": agent_reply})
                if len(history) > 20: history = history[-20:]

                # TTS: Text -> Voice
                tts_output_path = tts_service.generate(agent_reply)

                # Response Pack: Metadata first, then stream bytes
                await websocket.send_json({
                    "user_text": user_text,
                    "agent_reply": agent_reply
                })

                async with aiofiles.open(tts_output_path, "rb") as f:
                    response_audio = await f.read()
                    await websocket.send_bytes(response_audio)
                
                # Keep files for debugging as requested
                # if os.path.exists(tts_output_path):
                #     os.remove(tts_output_path)

            except Exception as loop_err:
                logger.error(f"-> [WS] Loop Error: {loop_err}")
                await websocket.send_json({"error": "Internal processing error"})

    except WebSocketDisconnect:
        logger.info("-> [WS] Client disconnected")
    except Exception as e:
        logger.error(f"-> [WS] Global WebSocket Error: {e}")
        try:
            await websocket.close()
        except:
            pass
