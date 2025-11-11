# Beauty Intelligence Platform - Cloud Run Deployment Guide

This guide explains how to deploy the Beauty Intelligence Platform to Google Cloud Run.

## Prerequisites

1. **Google Cloud Project**: `gemini-copilot-testing`
2. **Authentication**: Run `gcloud auth login` and `gcloud auth application-default login`
3. **Required APIs** (already enabled):
   - Cloud Run API
   - Cloud Build API
   - Artifact Registry API

## Architecture

The deployment consists of two Cloud Run services:

1. **Backend Service** (`beauty-intelligence-backend`)
   - FastAPI application with Google ADK agents
   - Handles trend discovery (Vertex AI Gemini)
   - Handles image transformation (Azure OpenAI FLUX)
   - Port: 8080
   - Region: us-central1

2. **Frontend Service** (`beauty-intelligence-frontend`)
   - Next.js 15 application
   - Modern UI with React 19
   - Connects to backend API
   - Port: 8080
   - Region: us-central1

## Deployment Steps

### Quick Deploy (Recommended)

Run the automated deployment script:

```bash
./deploy.sh
```

This script will:
1. Create the Artifact Registry repository (if needed)
2. Build and deploy the backend service
3. Build and deploy the frontend service
4. Configure CORS automatically
5. Output the public URLs

### Manual Deployment

If you prefer to deploy manually:

#### 1. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create beauty-intelligence \
    --repository-format=docker \
    --location=us-central1 \
    --description="Beauty Intelligence Platform containers"
```

#### 2. Deploy Backend

```bash
gcloud builds submit \
    --config=cloudbuild.backend.yaml \
    --region=us-central1
```

#### 3. Get Backend URL

```bash
BACKEND_URL=$(gcloud run services describe beauty-intelligence-backend \
    --region=us-central1 \
    --format="value(status.url)")
echo "Backend URL: $BACKEND_URL"
```

#### 4. Update Frontend Configuration

Edit `cloudbuild.frontend.yaml` and replace the `NEXT_PUBLIC_API_URL` environment variable with your backend URL.

#### 5. Deploy Frontend

```bash
gcloud builds submit \
    --config=cloudbuild.frontend.yaml \
    --region=us-central1
```

#### 6. Get Frontend URL

```bash
FRONTEND_URL=$(gcloud run services describe beauty-intelligence-frontend \
    --region=us-central1 \
    --format="value(status.url)")
echo "Frontend URL: $FRONTEND_URL"
```

#### 7. Update Backend CORS

```bash
gcloud run services update beauty-intelligence-backend \
    --region=us-central1 \
    --update-env-vars="ALLOWED_ORIGINS=${FRONTEND_URL},http://localhost:3000"
```

## Environment Variables

### Backend Service

The backend requires these environment variables (automatically configured by Cloud Build):

- `GOOGLE_GENAI_USE_VERTEXAI`: Set to `True` to use Vertex AI
- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key (from `.env`)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins

### Frontend Service

The frontend requires:

- `NEXT_PUBLIC_API_URL`: Backend API URL (configured during deployment)

## Security

### Authentication

Both services are deployed with `--allow-unauthenticated`, meaning:
- Users can access the application without Google Cloud authentication
- The application itself authenticates to GCP services using the Cloud Run service account
- Users only see the UI and cannot access the underlying code

### CORS Configuration

The backend uses CORS middleware to only allow requests from:
- The deployed frontend URL
- `http://localhost:3000` (for local development)

### Service Account Permissions

The Cloud Run services run with the default compute service account, which has:
- Permission to call Vertex AI
- Permission to read from Artifact Registry
- No access to user data or other GCP resources

## Resource Configuration

### Backend
- Memory: 2Gi
- CPU: 2
- Timeout: 300s
- Concurrency: Default (80)

### Frontend
- Memory: 1Gi
- CPU: 1
- Timeout: 60s
- Concurrency: Default (80)

## Monitoring

View logs for your services:

```bash
# Backend logs
gcloud run services logs read beauty-intelligence-backend \
    --region=us-central1 \
    --limit=50

# Frontend logs
gcloud run services logs read beauty-intelligence-frontend \
    --region=us-central1 \
    --limit=50
```

## Updating the Deployment

To update either service, simply run the deployment again:

```bash
# Update everything
./deploy.sh

# Or update individually
gcloud builds submit --config=cloudbuild.backend.yaml --region=us-central1
gcloud builds submit --config=cloudbuild.frontend.yaml --region=us-central1
```

Cloud Run automatically handles:
- Zero-downtime deployments
- Traffic migration to new revisions
- Automatic rollback on failure

## Cost Optimization

Cloud Run pricing is based on:
1. **Request Time**: Pay only when handling requests
2. **CPU Allocation**: During request processing
3. **Memory Allocation**: During request processing

To minimize costs:
- Services automatically scale to zero when not in use
- Only pay for actual usage
- No charges when idle

Estimated costs (us-central1):
- **Backend**: ~$0.24 per million requests
- **Frontend**: ~$0.12 per million requests

## Troubleshooting

### Build Fails

If the build fails, check:
1. All required APIs are enabled
2. You have necessary IAM permissions
3. The Artifact Registry repository exists

### Service Not Starting

Check service logs:
```bash
gcloud run services logs read <service-name> --region=us-central1
```

Common issues:
- Missing environment variables
- Port configuration (must use `PORT` env var)
- Service account permissions

### CORS Errors

If the frontend can't connect to the backend:
1. Verify backend CORS configuration includes frontend URL
2. Check backend logs for CORS errors
3. Ensure frontend is using correct API URL

## Sharing the Application

Once deployed, you can share the **Frontend URL** with anyone:
- No GCP account required
- No authentication needed
- Users only interact with the UI
- Code and infrastructure remain private

Example URL format:
```
https://beauty-intelligence-frontend-<project-number>.us-central1.run.app
```

## Cleanup

To delete all deployed resources:

```bash
# Delete services
gcloud run services delete beauty-intelligence-backend --region=us-central1 --quiet
gcloud run services delete beauty-intelligence-frontend --region=us-central1 --quiet

# Delete container images
gcloud artifacts repositories delete beauty-intelligence \
    --location=us-central1 \
    --quiet
```

## Support

For issues or questions:
1. Check the logs first
2. Review this documentation
3. Contact the development team