# Beauty Intelligence Platform - Local Setup Guide

This guide will help you set up the Beauty Intelligence Platform on your local machine.

## Prerequisites

- **Python**: 3.10 or higher (managed by UV)
- **Node.js**: v18 or higher
- **npm**: Latest version
- **UV**: Python package manager (will be installed automatically if not present)

## Project Structure

```
beauty-intelligence-platform/
├── src/                      # Backend FastAPI application
│   ├── app.py               # Main FastAPI app with AI image transformation
│   └── sephora_trend_agent/ # Agent implementation
├── frontend/                # Next.js frontend application
├── scripts/                 # Utility scripts
├── .env                     # Environment variables (AZURE_OPENAI_API_KEY)
├── pyproject.toml          # Python dependencies
├── Makefile                # Shortcuts for running commands
└── setup scripts           # Installation scripts
```

## Quick Setup (Recommended)

### Option 1: Complete Setup (Backend + Frontend)

Run the complete setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
1. Check and install UV if needed
2. Install all Python dependencies using UV
3. Install all Node.js dependencies
4. Verify your .env configuration

### Option 2: Individual Setup

#### Backend Only

```bash
chmod +x setup-backend.sh
./setup-backend.sh
```

#### Frontend Only

```bash
chmod +x setup-frontend.sh
./setup-frontend.sh
```

## Manual Setup

If you prefer to run commands manually:

### 1. Backend Setup

```bash
# Install UV (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
uv sync
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Return to root
cd ..
```

### 3. Environment Configuration

Ensure your `.env` file exists in the root directory with:

```env
# Azure OpenAI for Image Transformation
AZURE_OPENAI_API_KEY=your_api_key_here

# Google AI Configuration (for Trend Discovery)
GOOGLE_GENAI_USE_VERTEXAI=True
# GOOGLE_CLOUD_PROJECT=your-project-id-here  # Optional, can be auto-detected
```

### 4. Google Cloud Authentication (for Vertex AI)

If you're using Vertex AI (recommended for sandbox/production):

```bash
# Authenticate with Google Cloud
gcloud auth application-default login
```

This command will:
- Open a browser for Google authentication
- Store credentials at `~/.config/gcloud/application_default_credentials.json`
- Allow Google ADK to automatically use Vertex AI

**Note**: Make sure `GOOGLE_GENAI_USE_VERTEXAI=True` in your `.env` file.

## Running the Application

### Using Makefile (Easiest)

**Terminal 1 - Start Backend:**
```bash
make run-backend
```

**Terminal 2 - Start Frontend:**
```bash
make run-frontend
```

### Using Direct Commands

**Backend:**
```bash
uv run uvicorn src.app:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend && npm run dev
```

## Access Points

Once both services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Key Features

### Backend (FastAPI + Google ADK)
- RESTful API for beauty trend analysis
- AI-powered image transformation using Azure OpenAI FLUX
- Google ADK agent integration
- Image editing endpoint: `/ai_transform_image`

### Frontend (Next.js 15)
- Modern React 19 UI
- Radix UI components
- Tailwind CSS styling
- Form handling with React Hook Form
- Dark mode support

## Dependencies

### Backend (Python)
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `google-adk` - Google Agent Development Kit
- `beautifulsoup4` - Web scraping
- `pandas` - Data manipulation
- `requests` - HTTP client
- `python-dotenv` - Environment variable management
- `httpx` - Async HTTP client

### Frontend (Node.js)
- `next` v15.2.4 - React framework
- `react` v19 - UI library
- `@radix-ui/*` - UI components
- `tailwindcss` v4 - Styling
- `lucide-react` - Icons
- `zod` - Schema validation
- `react-hook-form` - Form management

## Troubleshooting

### UV Not Found
If UV is not found after installation, restart your terminal or run:
```bash
source $HOME/.local/bin/env
```

### Port Already in Use
If port 8000 or 3000 is already in use:
```bash
# Backend - use different port
uv run uvicorn src.app:app --reload --host 0.0.0.0 --port 8001

# Frontend - use different port
cd frontend && PORT=3001 npm run dev
```

### Environment Variables Not Loading
Ensure `.env` file is in the root directory (not in `src/` or `frontend/`):
```bash
# Check if .env exists
ls -la .env

# View contents (be careful not to commit sensitive data)
cat .env
```

### Python Version Issues
UV will use the Python version specified in `.python-version` file. If you encounter issues:
```bash
# Check current Python version
python --version

# UV will handle the correct version automatically
uv sync
```

## Development Workflow

1. **Make changes to backend code** in `src/`
   - FastAPI will auto-reload on save

2. **Make changes to frontend code** in `frontend/`
   - Next.js will hot-reload on save

3. **Test the API** at http://localhost:8000/docs

4. **View the frontend** at http://localhost:3000

## Next Steps

- Review [app.py](src/app.py) for API endpoint implementations
- Explore the frontend components in `frontend/`
- Check the agent implementation in `src/sephora_trend_agent/`
- Customize the beauty trend prompts in `create_beauty_prompt()` function

## Additional Commands

```bash
# Run backend tests (if available)
uv run pytest

# Build frontend for production
cd frontend && npm run build

# Start frontend in production mode
cd frontend && npm start

# Lint frontend code
cd frontend && npm run lint
```

## Support

For issues or questions:
1. Check the [SUMMARY.md](SUMMARY.md) for project overview
2. Review the API documentation at http://localhost:8000/docs
3. Check the console output for error messages