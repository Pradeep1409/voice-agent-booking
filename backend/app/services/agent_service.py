import json
from app.services.llm_service import llm_service
from app.tools.booking_tool import BookingTools

class AgentService:
    def __init__(self):
        self.system_prompt = (
            "You are a professional voice booking receptionist. "
            "Your goal is to assist callers in booking appointments politely and efficiently. "
            "You understand and can speak in both Hindi and English (Hinglish). "
            "Always confirm details like date and time before finalizing a booking. "
            "Be concise as this is a voice conversation."
        )

    def process_message(self, user_text: str, history: list):
        """
        Processes a user message, handles tool calls, and returns the final agent response.
        """
        messages = [
            {"role": "system", "content": "You are a helpful assistant for 'AutoBook', a professional booking system. ALWAYS respond in Hindi (Devanagari script) or natural Hinglish. Keep responses concise and suitable for voice interaction. Avoid using too many English words in pure English script, as the text-to-speech system works best with Hindi characters."},
            *history,
            {"role": "user", "content": user_text}
        ]

        tools = BookingTools.get_tool_definitions()
        
        # 1. First LLM Call
        response_msg = llm_service.chat(messages, tools=tools)
        
        # 2. Handle Tool Calls
        if response_msg.tool_calls:
            messages.append(response_msg)
            for tool_call in response_msg.tool_calls:
                result = BookingTools.execute_tool(
                    tool_call.function.name, 
                    tool_call.function.arguments
                )
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_call.function.name,
                    "content": result
                })
            
            # 3. Final LLM Call after tools
            final_response = llm_service.chat(messages)
            return final_response.content
        
        return response_msg.content

agent_service = AgentService()
