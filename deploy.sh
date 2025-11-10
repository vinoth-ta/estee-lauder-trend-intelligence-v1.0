#!/bin/bash

# Beauty Intelligence Platform - Cloud Run Deployment Script
# This script deploys both frontend and backend to Google Cloud Run

set -e

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-gemini-copilot-testing}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="beauty-intelligence-platform"
BACKEND_SERVICE_NAME="${SERVICE_NAME}-backend"
FRONTEND_SERVICE_NAME="${SERVICE_NAME}-frontend"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Beauty Intelligence Platform Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if required tools are installed
command -v gcloud >/dev/null 2>&1 || { echo "Error: gcloud CLI is not installed. Please install it first."; exit 1; }

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}You are not logged in to gcloud. Please log in:${NC}"
    gcloud auth login
fi

# Set project
echo -e "${BLUE}Setting project to: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${BLUE}Enabling required Google Cloud APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com

# Check if environment variables are set
echo -e "${YELLOW}Checking environment variables...${NC}"
if [ -z "$AZURE_OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}Warning: AZURE_OPENAI_API_KEY not set. Please set it as an environment variable.${NC}"
    read -p "Enter your Azure OpenAI API Key: " AZURE_OPENAI_API_KEY
fi

# Build and Deploy Backend
echo -e "${GREEN}Step 1: Building and deploying backend...${NC}"
gcloud builds submit \
    --config=cloudbuild.backend.yaml \
    .

echo -e "${GREEN}Deploying backend to Cloud Run...${NC}"
gcloud run deploy ${BACKEND_SERVICE_NAME} \
    --image gcr.io/${PROJECT_ID}/${BACKEND_SERVICE_NAME} \
    --platform managed \
    --region ${REGION} \
    --no-allow-unauthenticated \
    --set-env-vars="AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY},GOOGLE_GENAI_USE_VERTEXAI=True,GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --min-instances 0

# Get backend URL
BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE_NAME} --region ${REGION} --format='value(status.url)')
echo -e "${GREEN}Backend deployed at: ${BACKEND_URL}${NC}"

# Build and Deploy Frontend
echo -e "${GREEN}Step 2: Building and deploying frontend...${NC}"
gcloud builds submit \
    --config=cloudbuild.frontend.yaml \
    --substitutions=_BACKEND_URL="${BACKEND_URL}" \
    .

echo -e "${GREEN}Deploying frontend to Cloud Run...${NC}"
gcloud run deploy ${FRONTEND_SERVICE_NAME} \
    --image gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars="NEXT_PUBLIC_API_URL=${BACKEND_URL},BACKEND_URL=${BACKEND_URL}" \
    --memory 1Gi \
    --cpu 1 \
    --timeout 60 \
    --max-instances 10 \
    --min-instances 0

# Grant frontend permission to invoke backend
echo -e "${GREEN}Configuring service permissions...${NC}"
gcloud run services add-iam-policy-binding ${BACKEND_SERVICE_NAME} \
    --region ${REGION} \
    --member="serviceAccount:$(gcloud run services describe ${FRONTEND_SERVICE_NAME} --region ${REGION} --format='value(spec.template.spec.serviceAccountName)')" \
    --role="roles/run.invoker"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE_NAME} --region ${REGION} --format='value(status.url)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Your application is now live at:${NC}"
echo -e "${BLUE}${FRONTEND_URL}${NC}"
echo ""
echo -e "${YELLOW}Note: The backend service is internal and not publicly accessible.${NC}"
echo -e "${YELLOW}Users will only access the frontend URL.${NC}"
echo ""
echo -e "${GREEN}Share this URL with anyone - no authentication required!${NC}"
echo ""