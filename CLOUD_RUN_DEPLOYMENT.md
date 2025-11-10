# Cloud Run Deployment Guide

This guide explains how to deploy the Beauty Intelligence Platform to Google Cloud Run, making it accessible via a single public URL without any authentication requirements for end users.

## Overview

The deployment creates:
- **Backend Service** (internal): FastAPI application with AI trend discovery and image transformation
- **Frontend Service** (public): Next.js application that users access
- **Single Public URL**: Users only see and access the frontend URL

## Prerequisites

### 1. Google Cloud Account
- Active Google Cloud account with billing enabled
- A Google Cloud Project (or create a new one)

### 2. Required Tools
```bash
# Install Google Cloud SDK
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash

# Windows
# Download from: https://cloud.google.com/sdk/docs/install
```

### 3. API Keys
- **Azure OpenAI API Key**: For image transformation (FLUX model)
- **Google Cloud Project**: For trend discovery (Gemini API)

## Quick Deployment

### Step 1: Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
export GOOGLE_CLOUD_PROJECT="your-project-id"
gcloud config set project ${GOOGLE_CLOUD_PROJECT}
```

### Step 2: Set Environment Variables

```bash
# Set your Azure OpenAI API key
export AZURE_OPENAI_API_KEY="your_azure_openai_api_key_here"

# Optional: Set region (default is us-central1)
export REGION="us-central1"
```

### Step 3: Run Deployment Script

```bash
# Make the script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. Enable required Google Cloud APIs
2. Build and deploy the backend service (internal)
3. Build and deploy the frontend service (public)
4. Configure service permissions
5. Display the public URL

### Step 4: Access Your Application

After deployment completes, you'll see output like:

```
========================================
Deployment Complete!
========================================

Your application is now live at:
https://beauty-intelligence-platform-frontend-xxxxx-uc.a.run.app

Note: The backend service is internal and not publicly accessible.
Users will only access the frontend URL.

Share this URL with anyone - no authentication required!
```

## Manual Deployment

If you prefer to deploy manually:

### 1. Enable Google Cloud APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com
```

### 2. Build and Deploy Backend

```bash
# Build backend image
gcloud builds submit \
    --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-backend \
    --dockerfile=Dockerfile.backend \
    .

# Deploy backend (internal, not public)
gcloud run deploy beauty-intelligence-platform-backend \
    --image gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-backend \
    --platform managed \
    --region us-central1 \
    --no-allow-unauthenticated \
    --set-env-vars="AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY},GOOGLE_GENAI_USE_VERTEXAI=True,GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}" \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --min-instances 0
```

### 3. Get Backend URL

```bash
BACKEND_URL=$(gcloud run services describe beauty-intelligence-platform-backend \
    --region us-central1 \
    --format='value(status.url)')

echo "Backend URL: ${BACKEND_URL}"
```

### 4. Build and Deploy Frontend

```bash
# Build frontend image with backend URL
gcloud builds submit \
    --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-frontend \
    --dockerfile=Dockerfile.frontend \
    --build-arg NEXT_PUBLIC_API_URL=${BACKEND_URL} \
    --build-arg BACKEND_URL=${BACKEND_URL} \
    .

# Deploy frontend (public)
gcloud run deploy beauty-intelligence-platform-frontend \
    --image gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="NEXT_PUBLIC_API_URL=${BACKEND_URL},BACKEND_URL=${BACKEND_URL}" \
    --memory 1Gi \
    --cpu 1 \
    --timeout 60 \
    --max-instances 10 \
    --min-instances 0
```

### 5. Configure Service Permissions

```bash
# Get frontend service account
FRONTEND_SA=$(gcloud run services describe beauty-intelligence-platform-frontend \
    --region us-central1 \
    --format='value(spec.template.spec.serviceAccountName)')

# Grant frontend permission to invoke backend
gcloud run services add-iam-policy-binding beauty-intelligence-platform-backend \
    --region us-central1 \
    --member="serviceAccount:${FRONTEND_SA}" \
    --role="roles/run.invoker"
```

### 6. Get Frontend URL

```bash
FRONTEND_URL=$(gcloud run services describe beauty-intelligence-platform-frontend \
    --region us-central1 \
    --format='value(status.url)')

echo "Your application is live at: ${FRONTEND_URL}"
```

## Architecture

```
┌─────────────────────────────────────────────┐
│                                             │
│          Public Internet Users              │
│                                             │
└───────────────────┬─────────────────────────┘
                    │
                    │ HTTPS
                    │
        ┌───────────▼────────────┐
        │                        │
        │  Frontend Cloud Run    │
        │  (Public Access)       │
        │  - Next.js 15          │
        │  - React 19            │
        │  - Port 8080           │
        │                        │
        └───────────┬────────────┘
                    │
                    │ Internal HTTP
                    │ (Authenticated)
                    │
        ┌───────────▼────────────┐
        │                        │
        │  Backend Cloud Run     │
        │  (No Public Access)    │
        │  - FastAPI             │
        │  - Google Gemini       │
        │  - Azure OpenAI FLUX   │
        │  - Port 8080           │
        │                        │
        └────────────────────────┘
```

## Security

### Authentication
- **Frontend**: No authentication required (public access)
- **Backend**: Service-to-service authentication (not publicly accessible)
- **API Keys**: Stored as environment variables in Cloud Run

### Network Security
- Backend is not exposed to the internet
- Only the frontend service can call the backend
- HTTPS enforced for all traffic

### Code Protection
- Source code is not exposed to users
- Only compiled/built artifacts are deployed
- Users access the application through the UI only

## Cost Management

### Free Tier
Google Cloud Run includes a generous free tier:
- 2 million requests per month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds of compute time

### Cost Optimization Settings
The deployment uses:
- **Min instances: 0** - Scale to zero when not in use
- **Max instances: 10** - Limit concurrent instances
- **Automatic scaling** - Only pay for what you use

### Estimated Costs
For moderate usage (100 requests/day):
- **Frontend**: ~$0-5/month
- **Backend**: ~$5-15/month
- **Total**: ~$5-20/month

For production usage, costs depend on:
- Number of users
- Image transformation requests (Azure OpenAI costs)
- Trend discovery requests (Gemini API costs)

## Monitoring and Logs

### View Logs

```bash
# Frontend logs
gcloud run services logs read beauty-intelligence-platform-frontend \
    --region us-central1 \
    --limit 50

# Backend logs
gcloud run services logs read beauty-intelligence-platform-backend \
    --region us-central1 \
    --limit 50
```

### Cloud Console
Visit [Google Cloud Console](https://console.cloud.google.com/run) to:
- View service metrics
- Monitor requests and errors
- Adjust scaling settings
- Update environment variables

## Updating the Application

### Update Backend

```bash
# Rebuild and redeploy backend
gcloud builds submit \
    --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-backend \
    --dockerfile=Dockerfile.backend \
    .

gcloud run deploy beauty-intelligence-platform-backend \
    --image gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-backend \
    --region us-central1
```

### Update Frontend

```bash
# Rebuild and redeploy frontend
gcloud builds submit \
    --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-frontend \
    --dockerfile=Dockerfile.frontend \
    --build-arg NEXT_PUBLIC_API_URL=${BACKEND_URL} \
    --build-arg BACKEND_URL=${BACKEND_URL} \
    .

gcloud run deploy beauty-intelligence-platform-frontend \
    --image gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-frontend \
    --region us-central1
```

### Update Environment Variables

```bash
# Update backend environment variables
gcloud run services update beauty-intelligence-platform-backend \
    --region us-central1 \
    --set-env-vars="AZURE_OPENAI_API_KEY=new_key_here"

# Update frontend environment variables
gcloud run services update beauty-intelligence-platform-frontend \
    --region us-central1 \
    --set-env-vars="NEXT_PUBLIC_API_URL=new_backend_url_here"
```

## Troubleshooting

### Deployment Fails

**Issue**: Build or deployment errors

**Solution**:
```bash
# Check build logs
gcloud builds list --limit=5

# View specific build log
gcloud builds log <BUILD_ID>
```

### Frontend Can't Connect to Backend

**Issue**: CORS or connection errors

**Solution**:
1. Verify backend is deployed and running
2. Check backend URL is correctly set in frontend
3. Verify service permissions are configured

```bash
# Check backend status
gcloud run services describe beauty-intelligence-platform-backend \
    --region us-central1

# Re-apply permissions
./deploy.sh  # Or manually configure IAM binding
```

### High Costs

**Issue**: Unexpected Cloud Run costs

**Solution**:
1. Check instance scaling settings
2. Review request logs for unusual traffic
3. Consider setting budget alerts

```bash
# Set max instances to limit costs
gcloud run services update beauty-intelligence-platform-backend \
    --region us-central1 \
    --max-instances 5
```

### Slow Response Times

**Issue**: Application feels slow

**Solution**:
1. Consider setting minimum instances (warm start)
2. Increase CPU/memory allocation
3. Check API key rate limits

```bash
# Set minimum instances to keep service warm
gcloud run services update beauty-intelligence-platform-backend \
    --region us-central1 \
    --min-instances 1 \
    --cpu 2 \
    --memory 2Gi
```

## Custom Domain (Optional)

To use your own domain (e.g., beauty.yourcompany.com):

1. **Verify Domain Ownership**
   ```bash
   gcloud domains verify yourdomain.com
   ```

2. **Map Domain to Service**
   ```bash
   gcloud run services update beauty-intelligence-platform-frontend \
       --region us-central1 \
       --add-custom-domain beauty.yourcompany.com
   ```

3. **Update DNS Records**
   - Follow the instructions provided by gcloud to update your DNS
   - Typically requires adding CNAME or A records

## Deleting the Deployment

To remove all deployed services:

```bash
# Delete frontend service
gcloud run services delete beauty-intelligence-platform-frontend \
    --region us-central1 \
    --quiet

# Delete backend service
gcloud run services delete beauty-intelligence-platform-backend \
    --region us-central1 \
    --quiet

# Optional: Delete container images
gcloud container images delete gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-frontend --quiet
gcloud container images delete gcr.io/${GOOGLE_CLOUD_PROJECT}/beauty-intelligence-platform-backend --quiet
```

## Support

For issues or questions:
- Check Cloud Run logs: `gcloud run services logs read [SERVICE_NAME]`
- Visit [Cloud Run Documentation](https://cloud.google.com/run/docs)
- Contact Tiger Analytics support team

---

**Last Updated**: November 2025
**Platform Version**: v1.0
**Developed By**: Tiger Analytics for Estee Lauder