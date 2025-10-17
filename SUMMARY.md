# Beauty Intelligence Platform - Project Summary

## Overview

The Beauty Intelligence Platform is an AI-powered application that combines Google Gemini for trend discovery and Azure OpenAI FLUX for image transformation. It provides beauty professionals and consumers with insights into emerging trends and the ability to visualize them on their own photos.

## Key Components

### 1. Backend (FastAPI + Google ADK)
- **Framework**: FastAPI with async/await support
- **AI Agent**: Google ADK-based multi-agent system
- **Models**: Gemini 2.5 Pro for trend research and analysis
- **Image Processing**: Azure OpenAI FLUX for beauty transformations

### 2. Frontend (Next.js 15 + React 19)
- **Framework**: Next.js 15 with App Router
- **UI Components**: Radix UI with Tailwind CSS v4
- **State Management**: React Hook Form + Zod validation
- **Styling**: Modern dark mode support with Tailwind

### 3. AI Integration
- **Google Vertex AI**: Gemini 2.5 Pro for natural language processing and web research
- **Azure OpenAI**: FLUX.1-Kontext-pro for image editing and transformation
- **Real-time Streaming**: Server-Sent Events (SSE) for live updates

## Features

### Trend Discovery
- Multi-agent system with research and composition agents
- Web search integration using Google Search
- Citation-backed findings with source attribution
- Categorized results (makeup, skincare, hair)
- Structured output using Pydantic models

### Image Transformation
- AI-powered beauty trend application to photos
- Category-specific transformations (makeup, skincare, hair)
- Preserves user identity and facial features
- Base64 image processing with async HTTP client

### User Experience
- Real-time streaming of trend research results
- Interactive UI with modern design
- Responsive layout for all devices
- Fast page loads with Next.js optimizations

## Architecture

```
┌──────────────┐
│   Frontend   │  Next.js 15 + React 19
│  Port 3000   │  Radix UI + Tailwind CSS
└──────┬───────┘
       │ HTTP/SSE
┌──────▼───────┐
│   Backend    │  FastAPI + Google ADK
│  Port 8000   │  Uvicorn ASGI Server
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌─▼────┐
│Google│  │Azure │
│Gemini│  │FLUX  │
└──────┘  └──────┘
```

## Technical Highlights

### Backend
- **Async Processing**: Full async/await support for high performance
- **Agent Architecture**: Sequential multi-agent system with specialized roles
- **Error Handling**: Comprehensive error handling and logging
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

### Frontend
- **Modern React**: React 19 with latest features
- **Type Safety**: Full TypeScript support
- **Component Library**: Extensive Radix UI component collection
- **Performance**: Next.js 15 optimizations and edge runtime support

### AI/ML
- **Temperature Control**: Low temperature (0.01) for deterministic outputs
- **Structured Output**: Type-safe Pydantic models for AI responses
- **Web Grounding**: Citation tracking for all research findings
- **Multi-modal**: Text analysis + image generation

## Development Stack

**Backend:**
- Python 3.10+
- FastAPI 0.116.1+
- Google ADK 1.12.0+
- Uvicorn (ASGI server)
- BeautifulSoup4 (web scraping)
- Pandas (data processing)

**Frontend:**
- Next.js 15.2.4
- React 19
- TypeScript 5
- Tailwind CSS 4.1.9
- Radix UI components
- React Hook Form + Zod

**AI Services:**
- Google Vertex AI (Gemini 2.5 Pro)
- Azure OpenAI (FLUX.1-Kontext-pro)

## Project Status

### Completed Features ✓
- [x] Google ADK agent integration
- [x] Gemini 2.5 Pro configuration
- [x] Multi-agent workflow (research + composition)
- [x] Azure FLUX image transformation
- [x] Server-Sent Events streaming
- [x] Next.js frontend with Radix UI
- [x] Environment configuration
- [x] API documentation
- [x] Error handling and logging
- [x] Comprehensive README and setup guide

### Architecture Decisions

1. **Google ADK**: Chosen for its robust agent framework and Vertex AI integration
2. **FastAPI**: Selected for async support and automatic API documentation
3. **Next.js 15**: Leverages latest React 19 features and App Router
4. **Vertex AI**: Enterprise-grade authentication with Application Default Credentials
5. **Pydantic Models**: Type-safe data structures for AI responses

## Usage

### Local Development
```bash
# Backend
make run-backend

# Frontend
make run-frontend
```

### Endpoints
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Configuration

All configuration is managed through environment variables in `.env`:

```env
# Azure OpenAI
AZURE_OPENAI_API_KEY=your_key

# Google AI
GOOGLE_GENAI_USE_VERTEXAI=True
GOOGLE_CLOUD_PROJECT=your_project

# Backend URLs
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Authentication

### Google Vertex AI
Uses Application Default Credentials:
```bash
gcloud auth application-default login
```

### Azure OpenAI
Uses API key authentication via environment variable.

## Data Flow

1. **User Request** → Frontend UI
2. **API Call** → Backend FastAPI endpoint
3. **Agent Execution** → Google ADK processes request
4. **Web Search** → Gemini performs trend research
5. **Composition** → Results structured into Pydantic models
6. **SSE Stream** → Real-time updates sent to frontend
7. **Display** → Results shown in UI with citations

For image transformation:
1. **Image Upload** → Base64 encoded
2. **Prompt Creation** → Category-specific instructions
3. **FLUX API** → Azure OpenAI processes image
4. **Response** → Transformed image returned
5. **Display** → Result shown in UI

## Performance Considerations

- Async processing throughout the stack
- Streaming responses for faster perceived performance
- Optimized Next.js bundle with code splitting
- Efficient image handling with base64 encoding
- Connection pooling for external API calls

## Security

- Environment variables for sensitive credentials
- CORS configuration for frontend-backend communication
- API key rotation support
- Secure credential storage with gcloud ADC
- Input validation with Zod schemas

## Future Enhancements

Potential improvements for future iterations:
- Caching layer for repeated trend queries
- User authentication and session management
- Trend history and favorites
- Batch image processing
- Additional AI models for comparison
- Product recommendations based on trends
- Social media integration for trend validation

## Documentation

- [README.md](./README.md) - Complete setup and usage guide
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed local setup instructions
- [/docs](http://localhost:8000/docs) - Interactive API documentation
- [openapi.json](./scripts/openapi.json) - OpenAPI specification

## Support

For issues or questions, refer to the [Troubleshooting](./README.md#troubleshooting) section in the README.

---

**Project**: Beauty Intelligence Platform
**Organization**: Tiger Analytics
**Last Updated**: October 2024