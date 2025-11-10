# Vercel + Render Deployment Guide

Deploy the Beauty Intelligence Platform in 10 minutes - completely free, no credit card required!

## Overview

This deployment uses:
- **Render** (Backend) - Free Python hosting with automatic HTTPS
- **Vercel** (Frontend) - Free Next.js hosting with CDN

Users will only access a single Vercel URL - the backend is completely hidden.

---

## Prerequisites

- GitHub account (for code hosting)
- Google Cloud credentials (for Vertex AI)
- Azure OpenAI API key

---

## Step 1: Push Code to GitHub

### 1.1 Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `beauty-intelligence-platform`)
3. Keep it **Private** (to protect your code)

### 1.2 Push Your Code

```bash
# Initialize git if not already done
cd /Users/vinothpremkumar/Documents/ESL/beauty-intelligence-platform

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/beauty-intelligence-platform.git

# Commit all files
git add .
git commit -m "Initial commit - Beauty Intelligence Platform"

# Push to GitHub
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create Render Account

1. Go to https://render.com/
2. Click "Get Started"
3. Sign up with GitHub (easier integration)

### 2.2 Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `beauty-intelligence-platform` repository
4. Configure:
   - **Name**: `beauty-intelligence-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: Python 3
   - **Build Command**: `pip install uv && uv sync`
   - **Start Command**: `uv run uvicorn src.app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. Add Environment Variables:
   - Click "Advanced" → "Add Environment Variable"
   - Add these:
     ```
     AZURE_OPENAI_API_KEY = FeKhXyMpkasSmksGrNpwNEKoSSJgud4aGQqOiOoppDJCMvzNSxOWJQQJ99BCACHYHv6XJ3w3AAAAACOGjpwL
     GOOGLE_GENAI_USE_VERTEXAI = True
     GOOGLE_CLOUD_PROJECT = gemini-copilot-testing
     GOOGLE_APPLICATION_CREDENTIALS_JSON = <paste your GCP credentials JSON here>
     ```

6. Click "Create Web Service"

### 2.3 Set Up Google Cloud Credentials

On Render, you need to provide GCP credentials as a JSON string:

1. Run locally:
   ```bash
   cat ~/.config/gcloud/application_default_credentials.json
   ```

2. Copy the entire JSON output

3. In Render dashboard:
   - Go to your service → "Environment"
   - Add variable: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Paste the JSON content
   - Click "Save Changes"

### 2.4 Get Backend URL

Once deployed (takes ~5 minutes), copy your backend URL:
```
https://beauty-intelligence-backend.onrender.com
```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub

### 3.2 Deploy Frontend

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL = https://beauty-intelligence-backend.onrender.com
     BACKEND_URL = https://beauty-intelligence-backend.onrender.com
     ```

5. Click "Deploy"

### 3.3 Get Frontend URL

Once deployed (takes ~2 minutes), you'll get a URL like:
```
https://beauty-intelligence-platform.vercel.app
```

**This is your public URL!** Share it with anyone - no authentication required.

---

## Step 4: Configure CORS (Backend)

After both services are deployed, you need to update the backend to allow requests from your Vercel frontend.

1. Update `src/app.py` CORS settings (I'll do this for you)
2. Push changes to GitHub
3. Render will automatically redeploy

---

## What Users See

✅ **Single Public URL**: `https://beauty-intelligence-platform.vercel.app`
✅ **No Authentication Required**
✅ **Full Functionality**: Trend discovery + Image transformation
✅ **Fast Loading**: CDN-powered frontend
✅ **Secure**: Backend URL hidden, source code private

❌ **No Code Visibility**
❌ **No Backend Access** (only frontend calls it)
❌ **No API Keys Exposed**

---

## Cost

### 100% FREE

- **Render Free Tier**:
  - 750 hours/month compute
  - Automatic SSL
  - Sleeps after 15 min inactivity (wakes on request)

- **Vercel Free Tier**:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Global CDN
  - Automatic HTTPS

---

## Custom Domain (Optional)

### For Vercel (Frontend):

1. Go to your project → Settings → Domains
2. Add your domain (e.g., `beauty.yourcompany.com`)
3. Update DNS records as instructed
4. SSL certificate automatically provisioned

### For Render (Backend):

No need! The backend is internal and accessed via Vercel.

---

## Updating the Application

### Update Backend:

```bash
# Make changes to backend code
git add .
git commit -m "Update backend"
git push

# Render automatically redeploys (takes ~5 min)
```

### Update Frontend:

```bash
# Make changes to frontend code
git add .
git commit -m "Update frontend"
git push

# Vercel automatically redeploys (takes ~2 min)
```

---

## Monitoring

### Render Dashboard:
- View logs: https://dashboard.render.com
- Monitor uptime and performance
- Check environment variables

### Vercel Dashboard:
- View deployment logs: https://vercel.com/dashboard
- Monitor traffic and performance
- Check build logs

---

## Troubleshooting

### Backend Sleeps (Render Free Tier)

**Issue**: First request after 15 min takes 30-60 seconds

**Solutions**:
1. Upgrade to paid plan ($7/month for always-on)
2. Use a ping service to keep it awake
3. Accept the cold start (still works, just slower first load)

### Frontend Can't Connect to Backend

**Issue**: CORS errors in browser console

**Solution**:
1. Check backend URL in Vercel environment variables
2. Verify CORS settings in `src/app.py`
3. Ensure backend is running (check Render dashboard)

### Google Cloud Authentication Failed

**Issue**: Backend logs show authentication errors

**Solution**:
1. Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is set correctly
2. Ensure the service account has Vertex AI permissions
3. Check the JSON format is valid

---

## Advantages Over Cloud Run

✅ **No GCP Permissions Required**
✅ **Simpler Deployment** (just connect GitHub)
✅ **Free Tier More Generous**
✅ **Automatic CI/CD** (push to GitHub = auto deploy)
✅ **Better Developer Experience**
✅ **No Credit Card Required**

---

## Production Considerations

### For Production Use:

1. **Upgrade Render** ($7/month):
   - Always-on (no cold starts)
   - More resources
   - Better performance

2. **Custom Domain**:
   - Professional URL
   - Better branding
   - SSL included

3. **Monitoring**:
   - Set up error tracking (e.g., Sentry)
   - Monitor API usage
   - Set up uptime alerts

4. **Scaling**:
   - Render scales automatically
   - Vercel scales globally via CDN
   - No configuration needed

---

## Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Use your repo for tracking

---

**Total Setup Time**: ~10 minutes
**Monthly Cost**: $0 (free tier)
**Maintenance**: Automatic (push to GitHub)

---

**Last Updated**: November 2025
**Platform Version**: v1.0
**Developed By**: Tiger Analytics for Estee Lauder