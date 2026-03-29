# Voice Booking System

A full-stack AI-powered booking system that handles voice-based interactions for both Speech-to-Text (STT) and Text-to-Speech (TTS). It uses a FastAPI backend and a Next.js frontend to provide a seamless scheduling experience.

## Features

- **Voice Interaction:** Supports natural language booking through STT and TTS.
- **AI-Powered Logic:** Integrates with LLMs (via OpenRouter) to process booking requests.
- **Real-Time Processing:** Low-latency STT/TTS using Whisper and MMS models.
- **Modern UI:** Responsive and dynamic dashboard built with Next.js and Tailwind CSS.

## Project Structure

- `/backend`: FastAPI application, handlers, and model configurations.
- `/frontend`: Next.js web application for the user interface.
- `/alembic`: Database migration files.

## Tech Stack

- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy, Faster-Whisper, MMS.
- **Frontend:** TypeScript, Next.js, React, Tailwind CSS.
- **Database:** PostgreSQL (with Alembic for migrations).
- **AI Models:** Faster-Whisper (STT), MMS (TTS), OpenRouter/Arcee (LLM).

## Setup & Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd auto-book-system
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (create a `.env` file at the project root based on `.env.example`).
5. Run migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the backend:
   ```bash
   python main.py
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

The application uses an `.env` file at the root for configuration. Key variables include:
- `LLM_API_KEY`: OpenRouter API key.
- `WHISPER_MODEL_PATH`: Local path to the Whisper model.
- `DATABASE_URL`: PostgreSQL connection string.

Refer to `.env.example` for the complete list of variables.

## License

MIT
