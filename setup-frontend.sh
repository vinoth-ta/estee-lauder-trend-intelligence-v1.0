#!/bin/bash

# Beauty Intelligence Platform - Frontend Setup Script
# Sets up Next.js frontend dependencies

set -e  # Exit on any error

echo "=========================================="
echo "Frontend Setup (Next.js)"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}Checking if Node.js is installed...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed.${NC}"
    echo "Please install Node.js (v18 or higher) from: https://nodejs.org/"
    echo ""
    echo "Or install using Homebrew:"
    echo "brew install node"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Node.js is installed: $NODE_VERSION${NC}"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed.${NC}"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}npm is installed: $NPM_VERSION${NC}"
fi

echo ""
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install

echo ""
echo -e "${GREEN}Frontend setup complete!${NC}"
echo ""
echo "To start the frontend development server, run:"
echo -e "${BLUE}make run-frontend${NC}"
echo "or"
echo -e "${BLUE}cd frontend && npm run dev${NC}"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo ""