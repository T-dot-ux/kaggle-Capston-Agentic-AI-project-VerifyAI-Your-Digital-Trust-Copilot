# VerifyAI - Your Digital Trust Copilot

This is an Agentic AI project designed to provide advanced, real-time AI capabilities for verifying and assisting with digital trust tasks. It includes a frontend developed in Next.js and a backend in FastAPI.

## Project Structure
- `frontend/` - Next.js (React) application
- `backend/` - FastAPI (Python) backend

## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies (assuming you have a requirements file):
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables**:
   Copy the provided demo environment file to create your local environment:
   ```bash
   cp .env.demo .env
   ```
   **Note**: Open the newly created `.env` file and replace the placeholder values (such as `GEMINI_API_KEY`) with your actual API keys. Never commit your `.env` file to version control.
5. Start the backend server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. The frontend should now be running on `http://localhost:3000`.

## Important Note regarding Environment Variables
This repository includes a `.env.demo` file to show the structure of required environment variables. It has been made GitHub-ready to not expose any personal keys. You must create your own `.env` file locally by following the setup instructions above to run the project.
