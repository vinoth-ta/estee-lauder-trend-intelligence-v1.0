# Estee Lauder Beauty Intelligence Platform - Setup Guide

This guide provides step-by-step instructions for setting up and running the Beauty Intelligence Platform locally using API key authentication.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [API Key Configuration](#api-key-configuration)
- [Running the Application](#running-the-application)
- [Verifying the Setup](#verifying-the-setup)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Software Prerequisites

- **Operating System**: macOS, Linux, or Windows (WSL recommended)
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **UV Package Manager**: Latest version

### Required API Keys

Before starting, obtain the following API keys:

1. **Google AI API Key**
   - Required for trend discovery functionality
   - Get from: https://aistudio.google.com/apikey
   - Make sure to enable "Generative Language API"

2. **Azure OpenAI API Key**
   - Required for image transformation functionality
   - Get from: Azure Portal > Azure OpenAI Service

---

## Installation Steps

### Step 1: Install Python

Verify Python 3.10 or higher is installed:

\`\`\`bash
python --version
\`\`\`

If not installed, download from: https://www.python.org/downloads/

### Step 2: Install Node.js and npm

Verify Node.js and npm are installed:

\`\`\`bash
node --version
npm --version
\`\`\`

If not installed, download from: https://nodejs.org/

### Step 3: Install UV Package Manager

UV is a fast Python package manager used by this project.

**macOS/Linux:**
\`\`\`bash
curl -LsSf https://astral.sh/uv/install.sh | sh
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
\`\`\`

**Verify Installation:**
\`\`\`bash
uv --version
\`\`\`

If the command is not found after installation, restart your terminal.

### Step 4: Clone or Extract Project

Navigate to the project directory:

\`\`\`bash
cd /path/to/beauty-intelligence-platform
\`\`\`

### Step 5: Install Backend Dependencies

From the project root directory:

\`\`\`bash
uv sync
\`\`\`

This command will:
- Create a Python virtual environment in \`.venv/\`
- Install all required Python packages
- Set up the development environment

Expected output:
\`\`\`
Resolved XX packages in X.XXs
Installed XX packages in X.XXs
\`\`\`

### Step 6: Install Frontend Dependencies

\`\`\`bash
cd frontend
npm install
cd ..
\`\`\`

Expected output:
\`\`\`
added XXX packages in XXs
\`\`\`

---

## API Key Configuration

### Step 1: Create Environment File

Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

If \`.env.example\` doesn't exist, create a new \`.env\` file in the project root.

### Step 2: Configure API Keys

Edit the \`.env\` file with your API keys:

\`\`\`env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here

# Google AI Configuration (for Trend Discovery)
# Set to False to use API key authentication
GOOGLE_GENAI_USE_VERTEXAI=False

# Google Cloud Project ID (optional when using API key)
GOOGLE_CLOUD_PROJECT=your_project_id

# Google API Key (required when GOOGLE_GENAI_USE_VERTEXAI=False)
GOOGLE_API_KEY=your_google_api_key_here

# Backend URL Configuration
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
\`\`\`

### Step 3: Replace Placeholder Values

Replace the following placeholders with your actual values:

1. **AZURE_OPENAI_API_KEY**
   - Your Azure OpenAI API key
   - Example: \`FeKhXyMpkasSmksGrNpwNEKoSSJgud4a...\`

2. **GOOGLE_API_KEY**
   - Your Google AI Studio API key
   - Example: \`AIzaSyDd7VUIIStqZsqm1nDWImGQE...\`

3. **GOOGLE_CLOUD_PROJECT** (optional)
   - Your Google Cloud project ID
   - Example: \`my-beauty-platform-project\`

### Configuration Options

**Using Google API Key (Recommended for Local Development):**

\`\`\`env
GOOGLE_GENAI_USE_VERTEXAI=False
GOOGLE_API_KEY=your_google_api_key_here
\`\`\`

**Using Vertex AI (Requires GCP Access):**

\`\`\`env
GOOGLE_GENAI_USE_VERTEXAI=True
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
\`\`\`

Note: If using Vertex AI, you must also run:
\`\`\`bash
gcloud auth application-default login
\`\`\`

---

## Running the Application

### Option 1: Using Makefile (Recommended)

The project includes a Makefile for easy startup.

**Terminal 1 - Start Backend:**

\`\`\`bash
make run-backend
\`\`\`

Wait for the message:
\`\`\`
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
\`\`\`

**Terminal 2 - Start Frontend:**

Open a new terminal window and run:

\`\`\`bash
make run-frontend
\`\`\`

Wait for the message:
\`\`\`
- Local:        http://localhost:3000
Ready in X.Xs
\`\`\`

### Option 2: Using Direct Commands

If Makefile is not available:

**Terminal 1 - Start Backend:**

\`\`\`bash
uv run uvicorn src.app:app --reload --host 0.0.0.0 --port 8000
\`\`\`

**Terminal 2 - Start Frontend:**

\`\`\`bash
cd frontend
npm run dev
\`\`\`

### Access the Application

Once both services are running:

- **Application UI**: http://localhost:3000
- **Backend API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000

---

## Verifying the Setup

### Step 1: Check Backend Health

Open http://localhost:8000 in your browser. You should see:

\`\`\`json
{
  "message": "Estee Lauder Trend Intelligence API"
}
\`\`\`

### Step 2: Check Frontend

Open http://localhost:3000 in your browser. You should see the Estee Lauder Beauty Intelligence Platform interface with:

- Navigation sidebar with "Discover Trends", "Research Findings", and "Image Lab" options
- Estee Lauder logo at the top
- Tiger Analytics logo at the bottom

### Step 3: Test Trend Discovery

1. Click "Discover Trends" in the sidebar
2. Click the "Discover New Trends" button
3. You should see:
   - A loading indicator
   - Real-time progress updates
   - Trend cards appearing with makeup, skincare, and hair trends

If errors occur, check the troubleshooting section below.

### Step 4: Test Image Transformation (Optional)

1. Click "Image Lab" in the sidebar
2. Upload an image
3. Select a category (Makeup, Skincare, or Hair)
4. Choose a trend
5. Click "Transform Image"

---

## Troubleshooting

### Issue 1: "uv: command not found"

**Cause**: UV not installed or not in PATH

**Solution**:
\`\`\`bash
curl -LsSf https://astral.sh/uv/install.sh | sh
exec -l \$SHELL  # Restart shell
\`\`\`

### Issue 2: "Port 8000 already in use"

**Cause**: Another process is using port 8000

**Solution**:

Find and kill the process:
\`\`\`bash
# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
\`\`\`

Or use a different port:
\`\`\`bash
uv run uvicorn src.app:app --reload --host 0.0.0.0 --port 8001
\`\`\`

Then update \`.env\`:
\`\`\`env
BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_API_URL=http://localhost:8001
\`\`\`

### Issue 3: "API key not valid" Error

**Cause**: Invalid or incorrect Google API key

**Solution**:

1. Verify your API key at https://aistudio.google.com/apikey
2. Ensure the key has no extra spaces or characters
3. Check that "Generative Language API" is enabled
4. Generate a new API key if needed
5. Update \`.env\` file with the correct key
6. Restart the backend server

### Issue 4: Frontend Cannot Connect to Backend

**Cause**: Backend not running or incorrect URL configuration

**Solution**:

1. Verify backend is running:
   \`\`\`bash
   curl http://localhost:8000
   \`\`\`

2. Check \`.env\` file has correct URLs:
   \`\`\`env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   \`\`\`

3. Restart frontend:
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

### Issue 5: Module Not Found Errors

**Cause**: Dependencies not installed correctly

**Solution**:

**Backend:**
\`\`\`bash
rm -rf .venv
uv sync
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Issue 6: Python Version Error

**Cause**: Python version is below 3.10

**Solution**:

1. Check Python version:
   \`\`\`bash
   python --version
   \`\`\`

2. Install Python 3.10 or higher from https://www.python.org/downloads/

3. Reinstall dependencies:
   \`\`\`bash
   uv sync
   \`\`\`

### Issue 7: "No root_agent found" Error

**Cause**: Agent folder renamed or misconfigured

**Solution**:

Verify the agent folder exists:
\`\`\`bash
ls src/estee_lauder_trend_agent/
\`\`\`

Should contain:
- agent.py
- config.py
- callbacks.py
- __init__.py

### Issue 8: Trends Not Updating

**Cause**: Using cached data or authentication failure

**Solution**:

1. Check backend terminal for errors
2. Verify API key is working:
   - Check backend logs for "Using Google API Key authentication"
   - Look for "200 OK" responses, not "400" or "401" errors

3. Clear browser cache and refresh
4. Try discovering trends again

---

## Advanced Configuration

### Using Vertex AI Instead of API Key

If you have access to Google Cloud Platform:

1. Install Google Cloud SDK:
   \`\`\`bash
   # macOS
   brew install google-cloud-sdk

   # Linux
   curl https://sdk.cloud.google.com | bash
   \`\`\`

2. Authenticate:
   \`\`\`bash
   gcloud auth application-default login
   \`\`\`

3. Update \`.env\`:
   \`\`\`env
   GOOGLE_GENAI_USE_VERTEXAI=True
   GOOGLE_CLOUD_PROJECT=your_gcp_project_id
   \`\`\`

4. Restart backend

### Changing Default Ports

**Backend Port:**

Edit \`Makefile\` or run:
\`\`\`bash
uv run uvicorn src.app:app --reload --host 0.0.0.0 --port 8001
\`\`\`

Update \`.env\`:
\`\`\`env
BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_API_URL=http://localhost:8001
\`\`\`

**Frontend Port:**

\`\`\`bash
cd frontend
PORT=3001 npm run dev
\`\`\`

---

## Getting Help

### Logs Location

**Backend Logs:**
- Visible in terminal where backend is running
- Contains API requests, errors, and agent execution details

**Frontend Logs:**
- Browser console (F12 > Console tab)
- Terminal where frontend is running

### API Documentation

Interactive API documentation available at:
- http://localhost:8000/docs

Features:
- Try all endpoints directly in browser
- View request/response schemas
- Test with your API keys

### Common Log Messages

**Success Messages:**
\`\`\`
Using Google API Key authentication
Authentication Method: API Key
INFO: Application startup complete
\`\`\`

**Error Messages to Check:**
\`\`\`
API key not valid
Port already in use
Module not found
Connection refused
\`\`\`

---

## Production Deployment Notes

### Security Considerations

1. **Never commit .env file** - It contains sensitive API keys
2. **Use environment variables** - Set via hosting platform
3. **Enable HTTPS** - Use SSL certificates in production
4. **Rate limiting** - Implement API rate limits
5. **API key rotation** - Regularly update API keys

### Environment Variables for Production

Set these in your hosting platform:

\`\`\`
AZURE_OPENAI_API_KEY=<production_key>
GOOGLE_API_KEY=<production_key>
GOOGLE_GENAI_USE_VERTEXAI=False
BACKEND_URL=https://your-domain.com/api
NEXT_PUBLIC_API_URL=https://your-domain.com/api
\`\`\`

### Building for Production

**Backend:**
\`\`\`bash
uv run uvicorn src.app:app --host 0.0.0.0 --port 8000 --workers 4
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
npm run build
npm start
\`\`\`

---

## Support Contact

For technical issues or questions:

1. Review this guide thoroughly
2. Check the troubleshooting section
3. Review backend logs for error messages
4. Contact Tiger Analytics support team

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Platform**: Estee Lauder Beauty Intelligence Platform
**Developed By**: Tiger Analytics
