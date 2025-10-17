#!/bin/bash

# Beauty Intelligence Platform - Complete Local Setup Script
# This script sets up both backend (Python/FastAPI) and frontend (Next.js)

set -e  # Exit on any error

echo "=========================================="
echo "Beauty Intelligence Platform - Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if UV is installed
echo -e "${BLUE}Checking dependencies...${NC}"
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}UV is not installed. Installing UV...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo -e "${GREEN}UV installed successfully!${NC}"
else
    echo -e "${GREEN}UV is already installed${NC}"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js (v18+) from https://nodejs.org/${NC}"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Node.js is installed: $NODE_VERSION${NC}"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed. Please install npm${NC}"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}npm is installed: $NPM_VERSION${NC}"
fi

echo ""
echo "=========================================="
echo "Setting up Backend (Python/FastAPI)"
echo "=========================================="

# Sync Python dependencies using UV
echo -e "${BLUE}Installing Python dependencies with UV...${NC}"
uv sync

echo -e "${GREEN}Backend dependencies installed!${NC}"

echo ""
echo "=========================================="
echo "Setting up Frontend (Next.js)"
echo "=========================================="

# Install frontend dependencies
cd frontend
echo -e "${BLUE}Installing frontend dependencies with npm...${NC}"
npm install

echo -e "${GREEN}Frontend dependencies installed!${NC}"

cd ..

echo ""
echo "=========================================="
echo "Verifying Environment Configuration"
echo "=========================================="

# Check if .env file exists
if [ -f .env ]; then
    echo -e "${GREEN}.env file found${NC}"

    # Check for required environment variables
    if grep -q "AZURE_OPENAI_API_KEY" .env; then
        echo -e "${GREEN}AZURE_OPENAI_API_KEY is configured${NC}"
    else
        echo -e "${YELLOW}Warning: AZURE_OPENAI_API_KEY not found in .env${NC}"
    fi
else
    echo -e "${YELLOW}Warning: .env file not found in root directory${NC}"
    echo "Create a .env file with the following variables:"
    echo "AZURE_OPENAI_API_KEY=your_api_key_here"
fi

echo ""
echo "=========================================="
echo "Setup Complete! 🎉"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend:"
echo -e "   ${BLUE}make run-backend${NC}"
echo "   or"
echo -e "   ${BLUE}uv run uvicorn src.app:app --reload --host 0.0.0.0 --port 8000${NC}"
echo ""
echo "2. In a new terminal, start the frontend:"
echo -e "   ${BLUE}make run-frontend${NC}"
echo "   or"
echo -e "   ${BLUE}cd frontend && npm run dev${NC}"
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "Frontend will be available at: http://localhost:3000"
echo "API docs will be available at: http://localhost:8000/docs"
echo ""