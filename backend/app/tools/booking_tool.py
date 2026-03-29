import json
from datetime import datetime
from app.storage.booking_store import Appointment, engine
from sqlmodel import Session

class BookingTools:
    @staticmethod
    def get_tool_definitions():
        return [
            {
                "type": "function",
                "function": {
                    "name": "book_appointment",
                    "description": "Book a new appointment for a customer.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "Full name of the customer"},
                            "date": {"type": "string", "description": "Date of appointment (YYYY-MM-DD)"},
                            "time": {"type": "string", "description": "Time of appointment (HH:MM)"},
                            "service": {"type": "string", "description": "Description of the service needed"}
                        },
                        "required": ["name", "date", "time", "service"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "check_availability",
                    "description": "Check if a specific date/time slot is available.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "date": {"type": "string", "description": "Date to check (YYYY-MM-DD)"},
                            "time": {"type": "string", "description": "Time to check (HH:MM)"}
                        },
                        "required": ["date"]
                    }
                }
            }
        ]

    @staticmethod
    def execute_tool(name, arguments):
        args = json.loads(arguments)
        
        if name == "book_appointment":
            try:
                with Session(engine) as session:
                    new_appt = Appointment(
                        customer_name=args['name'],
                        appointment_date=args['date'],
                        appointment_time=args['time'],
                        service_type=args['service'],
                        status="confirmed"
                    )
                    session.add(new_appt)
                    session.commit()
                    return f"Confirmed! Successfully booked {args['service']} for {args['name']} on {args['date']} at {args['time']}."
            except Exception as e:
                return f"Error booking appointment: {str(e)}"
        
        elif name == "check_availability":
            # For now, let's just return that it's available 
            # In a real app, we'd query the DB for existing appointments
            return f"Yes, {args.get('time', 'the day')} on {args['date']} is available for booking."
        
        return "Unknown tool called."
