#!/bin/bash

# Beauty Intelligence Platform - Backend Setup Script
# Sets up Python environment and dependencies using UV

set -e  # Exit on any error

echo "=========================================="
echo "Backend Setup (Python/FastAPI)"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if UV is installed
echo -e "${BLUE}Checking if UV is installed...${NC}"
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}UV is not installed. Installing UV...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo -e "${GREEN}UV installed successfully!${NC}"
    echo ""
    echo "Please restart your terminal or run:"
    echo "source $HOME/.local/bin/env"
    exit 0
else
    UV_VERSION=$(uv --version)
    echo -e "${GREEN}UV is installed: $UV_VERSION${NC}"
fi

echo ""
echo -e "${BLUE}Installing Python dependencies...${NC}"
uv sync

echo ""
echo -e "${GREEN}Backend setup complete!${NC}"
echo ""
echo "To start the backend server, run:"
echo -e "${BLUE}make run-backend${NC}"
echo "or"
echo -e "${BLUE}uv run uvicorn src.app:app --reload --host 0.0.0.0 --port 8000${NC}"
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "API docs will be available at: http://localhost:8000/docs"
echo ""