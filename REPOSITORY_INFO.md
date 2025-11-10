# Estee Lauder Beauty Intelligence Platform v1.0

Client-ready repository for deploying the Estee Lauder Beauty Intelligence Platform locally.

## Repository Purpose

This repository contains the complete source code for the Estee Lauder Beauty Intelligence Platform, an AI-powered application that discovers emerging luxury beauty trends and transforms images using advanced AI models.

## What's Included

- Complete frontend application (Next.js 15 + React 19)
- Complete backend API (FastAPI + Python)
- AI trend discovery agent using Google Gemini
- Image transformation using Azure OpenAI FLUX
- Comprehensive setup documentation
- API key authentication support (no GCP sandbox required)

## For Clients

### Quick Start

1. Clone this repository
2. Follow [QUICKSTART.md](./QUICKSTART.md) for 5-minute setup
3. See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions

### Requirements

- Python 3.10+
- Node.js 18+
- Google AI API Key (from https://aistudio.google.com/apikey)
- Azure OpenAI API Key

### Documentation Files

- **QUICKSTART.md** - Get started in 5 minutes
- **SETUP_GUIDE.md** - Comprehensive setup instructions with troubleshooting
- **README.md** - Full project documentation
- **.env.example** - Template for environment configuration

## Repository Structure

```
estee-lauder-trend-intelligence-v1.0/
├── QUICKSTART.md              # Quick start guide
├── SETUP_GUIDE.md             # Detailed setup guide
├── README.md                  # Full documentation
├── .env.example               # Environment template
├── src/                       # Backend source code
│   ├── app.py                # FastAPI application
│   └── estee_lauder_trend_agent/
│       ├── agent.py          # AI agent logic
│       ├── config.py         # Configuration
│       └── callbacks.py      # Event handling
├── frontend/                  # Frontend application
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   └── public/               # Static assets
├── pyproject.toml            # Python dependencies
├── package.json              # Node.js dependencies
└── Makefile                  # Convenience commands
```

## Security Notes

- The `.env` file is excluded from version control
- Never commit API keys to the repository
- Use `.env.example` as a template
- Keep API keys secure and rotate regularly

## Version

**v1.0** - Client-ready release
- Complete Estee Lauder branding
- API key authentication support
- Comprehensive documentation
- Production-ready codebase

## Developed By

**Tiger Analytics**
- Built for Estee Lauder demo presentation
- Enterprise-grade AI platform
- Professional beauty trend intelligence

## Support

For setup issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) troubleshooting section
2. Review [QUICKSTART.md](./QUICKSTART.md)
3. Contact Tiger Analytics support team

---

**License**: Proprietary - Copyright Tiger Analytics 2025
**Confidential**: This repository contains proprietary code for Estee Lauder
