# Quick Start Guide

Get the Estee Lauder Beauty Intelligence Platform running in 5 minutes.

## Prerequisites

- Python 3.10+
- Node.js 18+
- Google AI API Key
- Azure OpenAI API Key

## Installation

```bash
# 1. Install UV package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Install dependencies
uv sync
cd frontend && npm install && cd ..

# 3. Configure API keys
cp .env.example .env
# Edit .env and add your API keys
```

## Configuration

Edit `.env` file:

```env
# Required: Add your Azure OpenAI API key
AZURE_OPENAI_API_KEY=your_azure_key_here

# Required: Add your Google API key
GOOGLE_API_KEY=your_google_key_here

# Required: Use API key mode
GOOGLE_GENAI_USE_VERTEXAI=False
```

## Run

**Terminal 1 - Backend:**
```bash
make run-backend
```

**Terminal 2 - Frontend:**
```bash
make run-frontend
```

## Access

Open http://localhost:3000 in your browser.

## Troubleshooting

### "uv: command not found"
Restart your terminal after installing UV.

### "API key not valid"
1. Get a new key from https://aistudio.google.com/apikey
2. Update `.env` file
3. Restart backend

### "Port already in use"
```bash
lsof -ti:8000 | xargs kill -9  # Kill process on port 8000
```

## Full Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete documentation.

---

**Need Help?**
- Review [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Check backend logs in terminal
- Visit http://localhost:8000/docs for API documentation
